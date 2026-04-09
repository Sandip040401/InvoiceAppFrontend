import React, { useState } from "react";
import ExcelJS from 'exceljs';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth0 } from '@auth0/auth0-react';
import './ViewBill.css';

const NEW_STRUCTURE_CUTOFF = '2026-04-01';

function ViewBill() {
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
    // old structure totals
    const [totalTCS, setTotalTCS] = useState(0);
    const [totalTDS, setTotalTDS] = useState(0);
    const [totalS_TDS, setTotalS_TDS] = useState(0);
    const [totalATD, setTotalATD] = useState(0);
    // new structure totals
    const [totalNpD_Return, setTotalNpD_Return] = useState(0);
    const [totalNpS_TDS, setTotalNpS_TDS] = useState(0);
    const [totalNpP_ATD, setTotalNpP_ATD] = useState(0);
    const [totalNpC_ATD, setTotalNpC_ATD] = useState(0);

    const [totalAllTotals, setTotalAllTotals] = useState(0);
    const [totalNP, setTotalNP] = useState(0);
    const [showDateRange, setShowDateRange] = useState(false);
    const backendUrl = import.meta.env.VITE_BASE_URL;

    // true if startDate is on/after 1 Apr 2026
    const isNewStructure = startDate >= NEW_STRUCTURE_CUTOFF;

    const handleStartDateChange = (e) => setStartDate(e.target.value);
    const handleEndDateChange   = (e) => setEndDate(e.target.value);

    // helper: get row total based on structure
    const getRowTotal = (bill) => {
        if (bill.isNewStructure) {
            const npTotal = (bill.npEntries || []).reduce(
                (sum, e) => sum + (e.D_Return || 0) + (e.S_TDS || 0) + (e.P_ATD || 0) + (e.C_ATD || 0), 0
            );
            return (bill.PWT || 0) + (bill.CASH || 0) + (bill.BANK || 0) +
                   (bill.DUE || 0) + (bill.N_P || 0) + npTotal;
        }
        return (bill.PWT || 0) + (bill.CASH || 0) + (bill.BANK || 0) +
               (bill.DUE || 0) + (bill.N_P || 0) + (bill.TCS || 0) +
               (bill.TDS || 0) + (bill.S_TDS || 0) + (bill.ATD || 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const email = user.email;
            const response = await fetch(`${backendUrl}/api/bills/week?email=${email}&startDate=${startDate}&endDate=${endDate}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();

            const tnp = data[0]?.totalNP || 0;
            setTotalNP(tnp);

            const sortedBills = data.sort((a, b) => a.code.localeCompare(b.code));
            setBills(sortedBills);
            setShowDateRange(true);

            let tPayment = 0, tPWT = 0, tCASH = 0, tBANK = 0, tDUE = 0, tN_P = 0;
            // old
            let tTCS = 0, tTDS = 0, tS_TDS = 0, tATD = 0;
            // new
            let  tNpS_TDS = 0, tNpP_ATD = 0, tNpC_ATD = 0, tNpD_Return = 0;
            let tAllTotals = 0;

            data.forEach(bill => {
                tPayment    += bill.payment || 0;
                tPWT        += bill.PWT     || 0;
                tCASH       += bill.CASH    || 0;
                tBANK       += bill.BANK    || 0;
                tDUE        += bill.DUE     || 0;
                tN_P        += bill.N_P     || 0;
                tAllTotals  += getRowTotal(bill);

                if (bill.isNewStructure) {
                    const e = (bill.npEntries || [])[0] || {};
                    tNpD_Return += e.D_Return || 0;
                    tNpS_TDS += e.S_TDS || 0;
                    tNpP_ATD += e.P_ATD || 0;
                    tNpC_ATD += e.C_ATD || 0;
                } else {
                    tTCS   += bill.TCS   || 0;
                    tTDS   += bill.TDS   || 0;
                    tS_TDS += bill.S_TDS || 0;
                    tATD   += bill.ATD   || 0;
                }
            });

            setTotalPWT(tPWT);
            setTotalCASH(tCASH);
            setTotalBANK(tBANK);
            setTotalDUE(tDUE);
            setTotalN_P(tN_P);
            setTotalTCS(tTCS);
            setTotalTDS(tTDS);
            setTotalS_TDS(tS_TDS);
            setTotalATD(tATD);
            setTotalNpD_Return(tNpD_Return);
            setTotalNpS_TDS(tNpS_TDS);
            setTotalNpP_ATD(tNpP_ATD);
            setTotalNpC_ATD(tNpC_ATD);
            setTotalAllTotals(tAllTotals);
            setTotalPayment(tPayment + tnp); // same as old: payment + totalNP

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleDownloadExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Bills');

        // headers switch by structure
        if (isNewStructure) {
            worksheet.addRow(['Sl no', 'Code', 'PartyName', 'Payment', 'PWT', 'CASH', 'BANK', 'DUE', 'N/P',"D-Return", 'STDS', 'P-ATD', 'C-ATD', 'Total']);
        } else {
            worksheet.addRow(['Sl no', 'Code', 'PartyName', 'Payment', 'PWT', 'CASH', 'BANK', 'DUE', 'N_P', 'TCS', 'TDS', 'S_TDS', 'ATD', 'Total']);
        }

        bills.forEach((bill, index) => {
            if (bill.isNewStructure) {
                const e = (bill.npEntries || [])[0] || {};
                worksheet.addRow([
                    index + 1, bill.code, bill.partyName, bill.payment,
                    bill.PWT, bill.CASH, bill.BANK, bill.DUE, bill.N_P,
                    e.S_TDS || 0, e.P_ATD || 0, e.C_ATD || 0, e.D_Return || 0,
                    getRowTotal(bill)
                ]);
            } else {
                worksheet.addRow([
                    index + 1, bill.code, bill.partyName, bill.payment,
                    bill.PWT, bill.CASH, bill.BANK, bill.DUE, bill.N_P,
                    bill.TCS, bill.TDS, bill.S_TDS, bill.ATD,
                    getRowTotal(bill)
                ]);
            }
        });

        worksheet.addRow(['']);
        worksheet.addRow(['', '', 'N/P:', totalNP]);

        if (isNewStructure) {
            worksheet.addRow(['', '', 'Total:', totalPayment, totalPWT, totalCASH, totalBANK, totalDUE, totalN_P, totalNpD_Return, totalNpS_TDS, totalNpP_ATD, totalNpC_ATD, totalAllTotals]);
        } else {
            worksheet.addRow(['', '', 'Total:', totalPayment, totalPWT, totalCASH, totalBANK, totalDUE, totalN_P, totalTCS, totalTDS, totalS_TDS, totalATD, totalAllTotals]);
        }

        worksheet.addRow(['']);
        worksheet.addRow(['', '', 'Date:', `${startDate} To ${endDate}`]);

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
        doc.setFontSize(9);
        doc.text(`Bill Report (${startDate} - ${endDate})`, 14, 10);

        // columns switch by structure
        const tableColumn = isNewStructure
            ? ["Sl no", "Code", "Party Name", "Payment", "PWT", "CASH", "BANK", "DUE", "N/P","D-Return", "STDS", "P-ATD", "C-ATD", "Total"]
            : ["Sl no", "Code", "Party Name", "Payment", "PWT", "CASH", "BANK", "DUE", "N_P", "TCS", "TDS", "S_TDS", "ATD", "Total"];

        const tableRows = bills.map((bill, index) => {
            if (bill.isNewStructure) {
                const e = (bill.npEntries || [])[0] || {};
                return [index + 1, bill.code, bill.partyName, bill.payment,
                        bill.PWT, bill.CASH, bill.BANK, bill.DUE, bill.N_P,
                        e.D_Return || 0, e.S_TDS || 0, e.P_ATD || 0, e.C_ATD || 0, getRowTotal(bill)];
            }
            return [index + 1, bill.code, bill.partyName, bill.payment,
                    bill.PWT, bill.CASH, bill.BANK, bill.DUE, bill.N_P,
                    bill.TCS, bill.TDS, bill.S_TDS, bill.ATD, getRowTotal(bill)];
        });

        tableRows.push(["", "", "N/P:", totalNP, "", "", "", "", "", "", "", "", "", ""]);

        if (isNewStructure) {
            tableRows.push(["", "", "Total:", totalPayment, totalPWT, totalCASH, totalBANK, totalDUE, totalN_P, totalNpD_Return, totalNpS_TDS, totalNpP_ATD, totalNpC_ATD, totalAllTotals]);
        } else {
            tableRows.push(["", "", "Total:", totalPayment, totalPWT, totalCASH, totalBANK, totalDUE, totalN_P, totalTCS, totalTDS, totalS_TDS, totalATD, totalAllTotals]);
        }

        tableRows.push(["", "", "Date:", `${startDate} To ${endDate}`, "", "", "", "", "", "", "", "", "", ""]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 15,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 0.5 },
            headStyles: { fillColor: [220, 220, 220], fontSize: 8, halign: "center" },
            columnStyles: {
                0: { cellWidth: 8  },
                1: { cellWidth: 15 },
                2: { cellWidth: 30 },
                3: { cellWidth: 15 },
                4: { cellWidth: 15 },
                5: { cellWidth: 15 },
                6: { cellWidth: 15 },
                7: { cellWidth: 15 },
                8: { cellWidth: 15 },
                9: { cellWidth: 15 },
                10: { cellWidth: 15 },
                11: { cellWidth: 15 },
                12: { cellWidth: 15 },
                13: { cellWidth: 18 },
            },
            margin: { top: 10, bottom: 5, left: 5, right: 5 },
            tableWidth: 'auto'
        });

        doc.save(`bills_${startDate}_${endDate}.pdf`);
    };

    return (
        <>
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <form onSubmit={handleSubmit} className="card p-4">
                            <h4 className="mb-3 d-flex justify-content-center">Enter Weekly Date</h4>
                            <div className="d-flex justify-content-around">
                                <div className="mb-3">
                                    <label htmlFor="start-date" className="form-label">Start Date:</label>
                                    <input type="date" id="start-date" className="form-control"
                                        value={startDate} onChange={handleStartDateChange} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="end-date" className="form-label">End Date:</label>
                                    <input type="date" id="end-date" className="form-control"
                                        value={endDate} onChange={handleEndDateChange} />
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
                                <th>N/P</th>
                                {/* switch headers by structure */}
                                {isNewStructure ? (
                                    <>
                                        <th>D_Return</th>
                                        <th>STDS</th>
                                        <th>P-ATD</th>
                                        <th>C-ATD</th>
                                    </>
                                ) : (
                                    <>
                                        <th>TCS</th>
                                        <th>TDS</th>
                                        <th>S_TDS</th>
                                        <th>ATD</th>
                                    </>
                                )}
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{bill.code}</td>
                                    <td>{bill.partyName}</td>
                                    <td><b>{bill.payment}</b></td>
                                    <td>{bill.PWT}</td>
                                    <td>{bill.CASH}</td>
                                    <td>{bill.BANK}</td>
                                    <td>{bill.DUE}</td>
                                    <td>{bill.N_P}</td>
                                    {/* switch columns by structure */}
                                    {bill.isNewStructure ? (
                                        <>
                                            <td>{(bill.npEntries?.[0]?.D_Return) || 0}</td>
                                            <td>{(bill.npEntries?.[0]?.S_TDS) || 0}</td>
                                            <td>{(bill.npEntries?.[0]?.P_ATD) || 0}</td>
                                            <td>{(bill.npEntries?.[0]?.C_ATD) || 0}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{bill.TCS}</td>
                                            <td>{bill.TDS}</td>
                                            <td>{bill.S_TDS}</td>
                                            <td>{bill.ATD}</td>
                                        </>
                                    )}
                                    <td><b>{getRowTotal(bill)}</b></td>
                                </tr>
                            ))}

                            {/* Total N/P row — same as old */}
                            <tr>
                                <td colSpan={3}><b>Total N/P</b></td>
                                <td><b>{totalNP}</b></td>
                            </tr>

                            {/* Column totals row — switches by structure */}
                            <tr>
                                <td colSpan={3}><b>Total</b></td>
                                <td><b>{totalPayment}</b></td>
                                <td>{totalPWT}</td>
                                <td>{totalCASH}</td>
                                <td>{totalBANK}</td>
                                <td>{totalDUE}</td>
                                <td>{totalN_P}</td>
                                {isNewStructure ? (
                                    <>
                                        <td>{totalNpD_Return}</td>
                                        <td>{totalNpS_TDS}</td>
                                        <td>{totalNpP_ATD}</td>
                                        <td>{totalNpC_ATD}</td>
                                    </>
                                ) : (
                                    <>
                                        <td>{totalTCS}</td>
                                        <td>{totalTDS}</td>
                                        <td>{totalS_TDS}</td>
                                        <td>{totalATD}</td>
                                    </>
                                )}
                                <td><b>{totalAllTotals}</b></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div style={{ height: '30px' }}></div>
        </>
    );
}

export default ViewBill;