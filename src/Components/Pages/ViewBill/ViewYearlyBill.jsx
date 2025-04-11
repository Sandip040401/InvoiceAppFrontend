import React, { useState } from "react";
import ExcelJS from 'exceljs';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth0 } from '@auth0/auth0-react';
import './ViewBill.css';

function ViewYearlyBill() {
    const { user, isAuthenticated } = useAuth0();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [bills, setBills] = useState([]);
    const [totalPayment, setTotalPayment] = useState(0);
    const [totalPWT, setTotalPWT] = useState(0);
    const [totalCASH, setTotalCASH] = useState(0);
    const [totalBANK, setTotalBANK] = useState(0);
    const [totalDUE, setTotalDUE] = useState(0);
    const [totalN_P, setTotalN_P] = useState(0);
    const [totalTCS, setTotalTCS] = useState(0);
    const [totalTDS, setTotalTDS] = useState(0);
    const [totalS_TDS, setTotalS_TDS] = useState(0);
    const [totalATD, setTotalATD] = useState(0);
    const [totalAllTotals, setTotalAllTotals] = useState(0);
    const [totalNP, setTotalNP] = useState(0); // New state for totalNP
    const [showDateRange, setShowDateRange] = useState(false);
    const backendUrl = import.meta.env.VITE_BASE_URL;

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    }

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const email = user.email;
            const response = await fetch(`${backendUrl}/api/bills/year?email=${email}&startDate=${startDate}&endDate=${endDate}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            let totalNP = data[0].totalNP;
            setTotalNP(totalNP); // Set totalNP state
            const sortedBills = data.sort((a, b) => a.code.localeCompare(b.code));
            setBills(sortedBills);
            setShowDateRange(true);

            // Calculate totals and totalNP
            let totalPayment = 0;
            let totalPWT = 0;
            let totalCASH = 0;
            let totalBANK = 0;
            let totalDUE = 0;
            let totalN_P = 0;
            let totalTCS = 0;
            let totalTDS = 0;
            let totalS_TDS = 0;
            let totalATD = 0;
            let totalAllTotals = 0;

            data.forEach(bill => {
                totalPayment += bill.payment;
                totalPWT += bill.PWT;
                totalCASH += bill.CASH;
                totalBANK += bill.BANK;
                totalDUE += bill.DUE;
                totalN_P += bill.N_P;
                totalTCS += bill.TCS;
                totalTDS += bill.TDS;
                totalS_TDS += bill.S_TDS;
                totalATD += bill.ATD;
                totalAllTotals += (bill.PWT + bill.CASH + bill.BANK + bill.DUE + bill.N_P + bill.TCS + bill.TDS + bill.S_TDS + bill.ATD);
            });

            setTotalPWT(totalPWT);
            setTotalCASH(totalCASH);
            setTotalBANK(totalBANK);
            setTotalDUE(totalDUE);
            setTotalN_P(totalN_P);
            setTotalTCS(totalTCS);
            setTotalTDS(totalTDS);
            setTotalS_TDS(totalS_TDS);
            setTotalATD(totalATD);
            setTotalAllTotals(totalAllTotals);
            // Include totalNP in the totalPayment calculation
            totalPayment += totalNP;

            // Set states
            setTotalPayment(totalPayment);

        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle error as needed
        }
    }

    const handleDownloadExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Bills');

        // Add headers
        worksheet.addRow(['Sl no', 'Code', 'PartyName', 'Payment', 'PWT', 'CASH', 'BANK', 'DUE', 'N_P', 'TCS', 'TDS', 'S_TDS', 'ATD', 'Total']);

        // Add data rows
        bills.forEach((bill, index) => {
            worksheet.addRow([
                index + 1,
                bill.code,
                bill.partyName,
                bill.payment,
                bill.PWT,
                bill.CASH,
                bill.BANK,
                bill.DUE,
                bill.N_P,
                bill.TCS,
                bill.TDS,
                bill.S_TDS,
                bill.ATD,
                (bill.PWT + bill.CASH + bill.BANK + bill.DUE + bill.N_P + bill.TCS + bill.TDS + bill.S_TDS + bill.ATD)
            ]);
        });
        worksheet.addRow(['']);
        worksheet.addRow(['','','N/P:', totalNP]); // Add totalNP row

        // Add total row
        worksheet.addRow([
            '',
            '',
            'Total:',
            totalPayment,
            totalPWT,
            totalCASH,
            totalBANK,
            totalDUE,
            totalN_P,
            totalTCS,
            totalTDS,
            totalS_TDS,
            totalATD,
            totalAllTotals
        ]);

        worksheet.addRow(['']);

        // Add date range row
        worksheet.addRow(['','','Date:', `${startDate} To ${endDate}`]);

        // Write to file
        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'bills.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }

    const handleDownloadPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    
        doc.setFontSize(9); // Reduce font size to fit more content
        doc.text(`Bill Report (${startDate} - ${endDate})`, 14, 10);
    
        const tableColumn = [
            "Sl no", "Code", "Party Name", "Payment", "PWT", "CASH", "BANK", "DUE", "N_P", "TCS", "TDS", "S_TDS", "ATD", "Total"
        ];
    
        const tableRows = bills.map((bill, index) => ([
            index + 1,
            bill.code,
            bill.partyName,
            bill.payment,
            bill.PWT,
            bill.CASH,
            bill.BANK,
            bill.DUE,
            bill.N_P,
            bill.TCS,
            bill.TDS,
            bill.S_TDS,
            bill.ATD,
            (bill.PWT + bill.CASH + bill.BANK + bill.DUE + bill.N_P + bill.TCS + bill.TDS + bill.S_TDS + bill.ATD)
        ]));
    
        // Add N/P row before the total row
        tableRows.push(["", "", "N/P:", totalNP, "", "", "", "", "", "", "", "", "", ""]);
    
        // Add total row
        tableRows.push(["", "", "Total:", totalPayment, totalPWT, totalCASH, totalBANK, totalDUE, totalN_P, totalTCS, totalTDS, totalS_TDS, totalATD, totalAllTotals]);
    
        // Add date range row
        tableRows.push(["", "", "Date:", `${startDate} To ${endDate}`, "", "", "", "", "", "", "", "", "", ""]);
    
        // Adjust column widths and shrink content
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 15,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 0.5 }, // Reduce font size further and cell padding
            headStyles: { fillColor: [220, 220, 220], fontSize: 8, halign: "center" }, // Light gray header
            columnStyles: {
                0: { cellWidth: 8 },  // Sl no
                1: { cellWidth: 15 }, // Code
                2: { cellWidth: 30 }, // Party Name
                3: { cellWidth: 15 }, // Payment
                4: { cellWidth: 15 },
                5: { cellWidth: 15 },
                6: { cellWidth: 15 },
                7: { cellWidth: 15 },
                8: { cellWidth: 15 },
                9: { cellWidth: 15 },
                10: { cellWidth: 15 },
                11: { cellWidth: 15 },
                12: { cellWidth: 15 },
                13: { cellWidth: 18 }, // Total
            },
            margin: { top: 10, bottom: 5, left: 5, right: 5 },
            tableWidth: 'auto' // Ensures table auto-adjusts to fit within page
        });
    
        doc.save(`bills_${startDate}_${endDate}.pdf`);
    };
    
    

    return (
        <>
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <form onSubmit={handleSubmit} className="card p-4">
                            <h4 className="mb-3 d-flex justify-content-center">Yearly Bill</h4>
                            <div className="d-flex justify-content-around">
                                <div className="mb-3">
                                    <label htmlFor="start-date" className="form-label">Start Date:</label>
                                    <input 
                                        type="date" 
                                        id="start-date" 
                                        className="form-control"
                                        value={startDate} 
                                        onChange={handleStartDateChange} 
                                        placeholder="Start Date"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="end-date" className="form-label">End Date:</label>
                                    <input 
                                        type="date" 
                                        id="end-date" 
                                        className="form-control"
                                        value={endDate} 
                                        onChange={handleEndDateChange} 
                                        placeholder="End Date"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary">View Bill</button>
                        </form>
                    </div>
                </div>
            </div>
            {bills.length > 0 && (
                <div className="text-center my-4">
                    <button onClick={handleDownloadPDF} className="btn btn-danger me-2">Download PDF</button>
                    <button onClick={handleDownloadExcel} className="btn btn-success">Download EXCEL</button>
                </div>
            )}
            {showDateRange && (
                <div className="container text-center mt-4">
                    <h3 className="fw-bold">Date Range: {startDate} to {endDate}</h3>
                </div>
            )}
            <div className="container mt-4">
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Sl no.</th>
                                <th>Code</th>
                                <th>Party Name</th>
                                <th>Payment</th>
                                <th>PWT</th>
                                <th>CASH</th>
                                <th>BANK</th>
                                <th>DUE</th>
                                <th>N_P</th>
                                <th>TCS</th>
                                <th>TDS</th>
                                <th>S_TDS</th>
                                <th>ATD</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill, index) => (
                                <tr key={index}>
                                    <td>{index+1}</td>
                                    <td>{bill.code}</td>
                                    <td>{bill.partyName}</td>
                                    <td><b>{bill.payment}</b></td>
                                    <td>{bill.PWT}</td>
                                    <td>{bill.CASH}</td>
                                    <td>{bill.BANK}</td>
                                    <td>{bill.DUE}</td>
                                    <td>{bill.N_P}</td>
                                    <td>{bill.TCS}</td>
                                    <td>{bill.TDS}</td>
                                    <td>{bill.S_TDS}</td>
                                    <td>{bill.ATD}</td>
                                    <td><b>{bill.PWT + bill.CASH + bill.BANK + bill.DUE + bill.N_P + bill.TCS + bill.TDS + bill.S_TDS + bill.ATD}</b></td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan={3}><b>Total N/P</b></td>
                                <td><b>{totalNP}</b></td>
                            </tr>
                            <tr>
                                <td colSpan={3}><b>Total</b></td>
                                <td><b>{totalPayment}</b></td>
                                <td>{totalPWT}</td>
                                <td>{totalCASH}</td>
                                <td>{totalBANK}</td>
                                <td>{totalDUE}</td>
                                <td>{totalN_P}</td>
                                <td>{totalTCS}</td>
                                <td>{totalTDS}</td>
                                <td>{totalS_TDS}</td>
                                <td>{totalATD}</td>
                                <td><b>{totalAllTotals}</b></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div style={{height:'30px'}}>
            </div>
        </>
    );
}

export default ViewYearlyBill;
