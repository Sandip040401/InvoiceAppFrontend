import React, { useState, useEffect } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import ExcelJS from 'exceljs';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import './ViewParty.css';

function ViewParty() {
    const { user, isAuthenticated } = useAuth0();
    const [selectedParty, setSelectedParty] = useState('');
    const [selectedCode, setSelectedCode] = useState('');
    const [partyNames, setPartyNames] = useState([]);
    const [codes, setCodes] = useState([]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [totals, setTotals] = useState({
        totalPayment: 0,
        totalPWT: 0,
        totalCASH: 0,
        totalBANK: 0,
        totalDUE: 0,
        totalN_P: 0,
        totalTCS: 0,
        totalTDS: 0,
        totalS_TDS: 0,
        totalATD: 0,
        totalAllTotals: 0
    });
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const backendUrl = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        if (isAuthenticated && user?.email) {
            fetchPartyNames(user.email);
        }
    }, [isAuthenticated, user]);

    const fetchPartyNames = async (email) => {
        try {
            const response = await fetch(`${backendUrl}/api/party/withcode/${email}`);
            if (!response.ok) {
                throw new Error('Error fetching party names');
            }
            const partyNamesData = await response.json();

            if (!partyNamesData.codes || !partyNamesData.partyNames) {
                throw new Error('Invalid party names data format');
            }

            const { codes, partyNames } = partyNamesData;

            if (!Array.isArray(codes) || !Array.isArray(partyNames)) {
                throw new Error('Codes or party names data is not an array');
            }

            if (codes.length === 0 || partyNames.length === 0) {
                throw new Error('No codes or party names data received');
            }

            const sortedPartyNames = partyNames.sort((a, b) => a.localeCompare(b));
            const sortedCodes = codes.sort((a, b) => a.localeCompare(b));

            setPartyNames(sortedPartyNames);
            setCodes(sortedCodes);
        } catch (error) {
            console.error('Error fetching code list:', error);
            setMessage('Error fetching code list. Please refresh to continue.');
            setIsError(true);
        }
    };

    const fetchBills = async () => {
        try {
            setLoading(true);
            setIsError(false);

            const userEmail = user.email;

            const url = new URL(`${backendUrl}/api/bills`);
            const params = {
                email: userEmail,
                code: selectedCode,
                partyName: selectedParty,
                startDate: startDate,
                endDate: endDate
            };

            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error('Failed to fetch bills');
            }

            const data = await response.json();
            console.log(data);
            setBills(data);
            calculateTotals(data);
        } catch (error) {
            console.error('Error fetching bills:', error);
            setMessage('Error fetching bills. Please refresh to continue.');
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = (bills) => {
        const totals = bills.reduce((acc, bill) => {
            acc.totalPayment += bill.payment;
            acc.totalPWT += bill.PWT;
            acc.totalCASH += bill.CASH;
            acc.totalBANK += bill.BANK;
            acc.totalDUE += bill.DUE;
            acc.totalN_P += bill.N_P;
            acc.totalTCS += bill.TCS;
            acc.totalTDS += bill.TDS;
            acc.totalS_TDS += bill.S_TDS;
            acc.totalATD += bill.ATD;
            acc.totalAllTotals += bill.PWT + bill.CASH + bill.BANK + bill.DUE + bill.N_P + bill.TCS + bill.TDS + bill.S_TDS + bill.ATD;
            return acc;
        }, {
            totalPayment: 0,
            totalPWT: 0,
            totalCASH: 0,
            totalBANK: 0,
            totalDUE: 0,
            totalN_P: 0,
            totalTCS: 0,
            totalTDS: 0,
            totalS_TDS: 0,
            totalATD: 0,
            totalAllTotals: 0
        });

        setTotals(totals);
    };

    const calculateRowTotal = (bill) => {
        return bill.PWT + bill.CASH + bill.BANK + bill.DUE + bill.N_P + bill.TCS + bill.TDS + bill.S_TDS + bill.ATD;
    };

    const handleDownloadExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Bills');

        worksheet.addRow(['Serial No', 'Date Range', 'P_Name', 'Payment', 'PWT', 'CASH', 'BANK', 'DUE', 'N_P', 'TCS', 'TDS', 'S_TDS', 'ATD', 'Total']);

        bills.forEach((bill, index) => {
            worksheet.addRow([
                index + 1,
                bill.startDate + '/' + bill.endDate,
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
                calculateRowTotal(bill)
            ]);
        });

        worksheet.addRow([
            '',
            '',
            'Total NP:',
            totals.totalN_P
        ]);
        worksheet.addRow([
            '',
            '',
            'Total:',
            totals.totalPayment + totals.totalN_P,
            totals.totalPWT,
            totals.totalCASH,
            totals.totalBANK,
            totals.totalDUE,
            totals.totalN_P,
            totals.totalTCS,
            totals.totalTDS,
            totals.totalS_TDS,
            totals.totalATD,
            totals.totalAllTotals
        ]);

        worksheet.addRow(['Date Range:', `${startDate} to ${endDate}`]);

        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'bills.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        });
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    
        doc.setFontSize(5);
        doc.text(`Bill Report (${startDate} - ${endDate})`, 14, 10);
    
        const tableColumn = [
            "S.No", "Date Range", "P_Name", "Payment", "PWT", "CASH", "BANK", "DUE", "N_P", "TCS", "TDS", "S_TDS", "ATD", "Total"
        ];
    
        const tableRows = bills.map((bill, index) => ([
            index + 1,
            `${bill.startDate}/${bill.endDate}`,
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
            calculateRowTotal(bill)
        ]));
    
        // Add Total NP row
        tableRows.push(["", "", "Total NP:", totals.totalN_P, "", "", "", "", "", "", "", "", "", ""]);
    
        // Add Grand Total row
        tableRows.push([
            "", "", "Total:", 
            totals.totalPayment + totals.totalN_P,
            totals.totalPWT,
            totals.totalCASH,
            totals.totalBANK,
            totals.totalDUE,
            totals.totalN_P,
            totals.totalTCS,
            totals.totalTDS,
            totals.totalS_TDS,
            totals.totalATD,
            totals.totalAllTotals
        ]);
    
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 15,
            theme: 'grid',
            styles: { fontSize: 5, cellPadding: 0.5, overflow: 'linebreak' },
            headStyles: { fillColor: [200, 200, 200], fontSize: 6, halign: "center" },
            columnStyles: {
                0: { cellWidth: 8 },   // Serial No
                1: { cellWidth: "auto" },  // Date Range
                2: { cellWidth: "auto" },  // P_Name
                3: { cellWidth: "auto" },
                4: { cellWidth: "auto" },
                5: { cellWidth: "auto" },
                6: { cellWidth: "auto" },
                7: { cellWidth: "auto" },
                8: { cellWidth: "auto" },
                9: { cellWidth: "auto" },
                10: { cellWidth: "auto" },
                11: { cellWidth: "auto" },
                12: { cellWidth: "auto" },
                13: { cellWidth: "auto" }  // Total
            },
            margin: { top: 10, bottom: 5, left: 5, right: 5 },
            tableWidth: 'wrap'
        });
    
        doc.save(`bills_${startDate}_${endDate}.pdf`);
    };
    
        

    return (
        <>
            <div className="container my-4">
                <div className="row justify-content-center">
                    <div className="col-md-10">
                        <div className="card">
                            <div className="card-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="selectCode">Select Code</label>
                                            <select id="selectCode" className="form-control" value={selectedCode} onChange={(e) => setSelectedCode(e.target.value)}>
                                                <option value="">Select Code</option>
                                                {codes.map((code, index) => (
                                                    <option key={index} value={code}>{code}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group mt-3">
                                            <label htmlFor="selectParty">Select Party</label>
                                            <select id="selectParty" className="form-control" value={selectedParty} onChange={(e) => setSelectedParty(e.target.value)}>
                                                <option value="">Select Party</option>
                                                {partyNames.map((party, index) => (
                                                    <option key={index} value={party}>{party}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="startDate">Select Start Date</label>
                                            <input type="date" id="startDate" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                        </div>
                                        <div className="form-group mt-3">
                                            <label htmlFor="endDate">Select End Date</label>
                                            <input type="date" id="endDate" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-center">
                                    <button onClick={fetchBills} className="btn btn-primary">Fetch Data</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {loading ? (
                    <div className="text-center my-4">Loading...</div>
                ) : (
                    <div className="row justify-content-center mt-4">
                        <div className="col-md-10">
                            {bills.length > 0 ? (
                                <div className="card">
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-striped">
                                                <thead className="thead-light">
                                                    <tr>
                                                        <th>Date Range</th>
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
                                                            <td>{bill.startDate} to {bill.endDate}</td>
                                                            <td>{bill.partyName}</td>
                                                            <td>{bill.payment}</td>
                                                            <td>{bill.PWT}</td>
                                                            <td>{bill.CASH}</td>
                                                            <td>{bill.BANK}</td>
                                                            <td>{bill.DUE}</td>
                                                            <td>{bill.N_P}</td>
                                                            <td>{bill.TCS}</td>
                                                            <td>{bill.TDS}</td>
                                                            <td>{bill.S_TDS}</td>
                                                            <td>{bill.ATD}</td>
                                                            <td>{calculateRowTotal(bill)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <td colSpan="2"><strong>Total NP:</strong></td>
                                                        <td>{totals.totalN_P}</td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="2"><strong>Total:</strong></td>
                                                        <td>{totals.totalPayment+totals.totalN_P}</td>
                                                        <td>{totals.totalPWT}</td>
                                                        <td>{totals.totalCASH}</td>
                                                        <td>{totals.totalBANK}</td>
                                                        <td>{totals.totalDUE}</td>
                                                        <td>{totals.totalN_P}</td>
                                                        <td>{totals.totalTCS}</td>
                                                        <td>{totals.totalTDS}</td>
                                                        <td>{totals.totalS_TDS}</td>
                                                        <td>{totals.totalATD}</td>
                                                        <td>{totals.totalAllTotals}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                        <div class="d-flex justify-content-center mt-3 gap-3">
                                            <button onClick={handleDownloadExcel} className="btn btn-success">Download Excel</button>
                                            <button onClick={handleDownloadPDF} className="btn btn-success">Download PDF</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center my-4">No bills found for the selected criteria.</div>
                            )}
                        </div>
                    </div>
                )}
                {isError && <div className="alert alert-danger mt-4">{message}</div>}
            </div>
            <div style={{height:'100px'}}></div>
        </>
    );
}

export default ViewParty;

