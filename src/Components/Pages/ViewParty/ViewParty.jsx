import React, { useState, useEffect } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import ExcelJS from 'exceljs';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import './ViewParty.css';

const NEW_STRUCTURE_CUTOFF = '2026-04-01';

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
        // old structure
        totalTCS: 0,
        totalTDS: 0,
        totalS_TDS: 0,
        totalATD: 0,
        // new structure
        totalNpD_Return: 0,
        totalNpS_TDS: 0,
        totalNpP_ATD: 0,
        totalNpC_ATD: 0,
        totalAllTotals: 0
    });
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const backendUrl = import.meta.env.VITE_BASE_URL;

    // date-level flag based on startDate
    const isNewStructure = startDate >= NEW_STRUCTURE_CUTOFF;

    useEffect(() => {
        if (isAuthenticated && user?.email) {
            fetchPartyNames(user.email);
        }
    }, [isAuthenticated, user]);

    const fetchPartyNames = async (email) => {
        try {
            const response = await fetch(`${backendUrl}/api/party/withcode/${email}`);
            if (!response.ok) throw new Error('Error fetching party names');
            const partyNamesData = await response.json();

            if (!partyNamesData.codes || !partyNamesData.partyNames)
                throw new Error('Invalid party names data format');

            const { codes, partyNames } = partyNamesData;

            if (!Array.isArray(codes) || !Array.isArray(partyNames))
                throw new Error('Codes or party names data is not an array');

            if (codes.length === 0 || partyNames.length === 0)
                throw new Error('No codes or party names data received');

            setPartyNames([...partyNames].sort((a, b) => a.localeCompare(b)));
            setCodes([...codes].sort((a, b) => a.localeCompare(b)));
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

            const url = new URL(`${backendUrl}/api/bills`);
            const params = {
                email: user.email,
                code: selectedCode,
                partyName: selectedParty,
                startDate,
                endDate
            };
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error('Failed to fetch bills');

            const data = await response.json();
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

    // ViewParty fetches raw Mongoose docs — each bill HAS isNewStructure field
    // so we use bill.isNewStructure per row (unlike /year which strips it)
    const calculateTotals = (bills) => {
        const totals = bills.reduce((acc, bill) => {
            acc.totalPayment += bill.payment   || 0;
            acc.totalPWT     += bill.PWT       || 0;
            acc.totalCASH    += bill.CASH      || 0;
            acc.totalBANK    += bill.BANK      || 0;
            acc.totalDUE     += bill.DUE       || 0;
            acc.totalN_P     += bill.N_P       || 0;
            acc.totalAllTotals += calculateRowTotal(bill);

            if (bill.isNewStructure) {
                const e = (bill.npEntries || [])[0] || {};
                acc.totalNpD_Return += e.D_Return || 0;
                acc.totalNpS_TDS += e.S_TDS || 0;
                acc.totalNpP_ATD += e.P_ATD || 0;
                acc.totalNpC_ATD += e.C_ATD || 0;
            } else {
                acc.totalTCS   += bill.TCS   || 0;
                acc.totalTDS   += bill.TDS   || 0;
                acc.totalS_TDS += bill.S_TDS || 0;
                acc.totalATD   += bill.ATD   || 0;
            }
            return acc;
        }, {
            totalPayment: 0, totalPWT: 0, totalCASH: 0, totalBANK: 0,
            totalDUE: 0, totalN_P: 0,
            totalTCS: 0, totalTDS: 0, totalS_TDS: 0, totalATD: 0,
            totalNpD_Return: 0, totalNpS_TDS: 0, totalNpP_ATD: 0, totalNpC_ATD: 0,
            totalAllTotals: 0
        });

        setTotals(totals);
    };

    // uses bill.isNewStructure — raw docs from /api/bills have this field
    const calculateRowTotal = (bill) => {
        if (bill.isNewStructure) {
            const e = (bill.npEntries || [])[0] || {};
            return (bill.PWT || 0) + (bill.CASH || 0) + (bill.BANK || 0) +
                   (bill.DUE || 0) + (bill.N_P || 0) +
                   (e.D_Return || 0) + (e.S_TDS || 0) + (e.P_ATD || 0) + (e.C_ATD || 0);
        }
        return (bill.PWT || 0) + (bill.CASH || 0) + (bill.BANK || 0) +
               (bill.DUE || 0) + (bill.N_P || 0) + (bill.TCS || 0) +
               (bill.TDS || 0) + (bill.S_TDS || 0) + (bill.ATD || 0);
    };

    const handleDownloadExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Bills');

        if (isNewStructure) {
            worksheet.addRow(['Serial No', 'Date Range', 'P_Name', 'Payment', 'PWT', 'CASH', 'BANK', 'DUE', 'N/P', "D-Return", 'STDS', 'P-ATD', 'C-ATD', 'Total']);
        } else {
            worksheet.addRow(['Serial No', 'Date Range', 'P_Name', 'Payment', 'PWT', 'CASH', 'BANK', 'DUE', 'N_P', 'TCS', 'TDS', 'S_TDS', 'ATD', 'Total']);
        }

        bills.forEach((bill, index) => {
            if (bill.isNewStructure) {
                const e = (bill.npEntries || [])[0] || {};
                worksheet.addRow([
                    index + 1, `${bill.startDate}/${bill.endDate}`, bill.partyName, bill.payment,
                    bill.PWT, bill.CASH, bill.BANK, bill.DUE, bill.N_P,
                    e.D_Return || 0, e.S_TDS || 0, e.P_ATD || 0, e.C_ATD || 0,
                    calculateRowTotal(bill)
                ]);
            } else {
                worksheet.addRow([
                    index + 1, `${bill.startDate}/${bill.endDate}`, bill.partyName, bill.payment,
                    bill.PWT, bill.CASH, bill.BANK, bill.DUE, bill.N_P,
                    bill.TCS, bill.TDS, bill.S_TDS, bill.ATD,
                    calculateRowTotal(bill)
                ]);
            }
        });

        worksheet.addRow(['', '', 'Total NP:', totals.totalN_P]);

        if (isNewStructure) {
            worksheet.addRow(['', '', 'Total:',
                totals.totalPayment + totals.totalN_P,
                totals.totalPWT, totals.totalCASH, totals.totalBANK, totals.totalDUE, totals.totalN_P,
                totals.totalNpD_Return, totals.totalNpS_TDS, totals.totalNpP_ATD, totals.totalNpC_ATD,
                totals.totalAllTotals
            ]);
        } else {
            worksheet.addRow(['', '', 'Total:',
                totals.totalPayment + totals.totalN_P,
                totals.totalPWT, totals.totalCASH, totals.totalBANK, totals.totalDUE, totals.totalN_P,
                totals.totalTCS, totals.totalTDS, totals.totalS_TDS, totals.totalATD,
                totals.totalAllTotals
            ]);
        }

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

        const tableColumn = isNewStructure
            ? ["S.No", "Date Range", "P_Name", "Payment", "PWT", "CASH", "BANK", "DUE", "N/P","D-Return", "STDS", "P-ATD", "C-ATD", "Total"]
            : ["S.No", "Date Range", "P_Name", "Payment", "PWT", "CASH", "BANK", "DUE", "N_P", "TCS", "TDS", "S_TDS", "ATD", "Total"];

        const tableRows = bills.map((bill, index) => {
            if (bill.isNewStructure) {
                const e = (bill.npEntries || [])[0] || {};
                return [
                    index + 1, `${bill.startDate}/${bill.endDate}`, bill.partyName, bill.payment,
                    bill.PWT, bill.CASH, bill.BANK, bill.DUE, bill.N_P,
                    e.D_Return || 0, e.S_TDS || 0, e.P_ATD || 0, e.C_ATD || 0,
                    calculateRowTotal(bill)
                ];
            }
            return [
                index + 1, `${bill.startDate}/${bill.endDate}`, bill.partyName, bill.payment,
                bill.PWT, bill.CASH, bill.BANK, bill.DUE, bill.N_P,
                bill.TCS, bill.TDS, bill.S_TDS, bill.ATD,
                calculateRowTotal(bill)
            ];
        });

        tableRows.push(["", "", "Total NP:", totals.totalN_P, "", "", "", "", "", "", "", "", "", ""]);

        if (isNewStructure) {
            tableRows.push(["", "", "Total:",
                totals.totalPayment + totals.totalN_P,
                totals.totalPWT, totals.totalCASH, totals.totalBANK, totals.totalDUE, totals.totalN_P,
                totals.totalNpD_Return, totals.totalNpS_TDS, totals.totalNpP_ATD, totals.totalNpC_ATD,
                totals.totalAllTotals
            ]);
        } else {
            tableRows.push(["", "", "Total:",
                totals.totalPayment + totals.totalN_P,
                totals.totalPWT, totals.totalCASH, totals.totalBANK, totals.totalDUE, totals.totalN_P,
                totals.totalTCS, totals.totalTDS, totals.totalS_TDS, totals.totalATD,
                totals.totalAllTotals
            ]);
        }

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 15,
            theme: 'grid',
            styles: { fontSize: 5, cellPadding: 0.5, overflow: 'linebreak' },
            headStyles: { fillColor: [200, 200, 200], fontSize: 6, halign: "center" },
            columnStyles: {
                0: { cellWidth: 8 },
                1: { cellWidth: "auto" }, 2: { cellWidth: "auto" },
                3: { cellWidth: "auto" }, 4: { cellWidth: "auto" },
                5: { cellWidth: "auto" }, 6: { cellWidth: "auto" },
                7: { cellWidth: "auto" }, 8: { cellWidth: "auto" },
                9: { cellWidth: "auto" }, 10: { cellWidth: "auto" },
                11: { cellWidth: "auto" }, 12: { cellWidth: "auto" },
                13: { cellWidth: "auto" }
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
                                            <select id="selectCode" className="form-control"
                                                value={selectedCode} onChange={(e) => setSelectedCode(e.target.value)}>
                                                <option value="">Select Code</option>
                                                {codes.map((code, index) => (
                                                    <option key={index} value={code}>{code}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group mt-3">
                                            <label htmlFor="selectParty">Select Party</label>
                                            <select id="selectParty" className="form-control"
                                                value={selectedParty} onChange={(e) => setSelectedParty(e.target.value)}>
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
                                            <input type="date" id="startDate" className="form-control"
                                                value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                        </div>
                                        <div className="form-group mt-3">
                                            <label htmlFor="endDate">Select End Date</label>
                                            <input type="date" id="endDate" className="form-control"
                                                value={endDate} onChange={(e) => setEndDate(e.target.value)} />
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
                                                        <th>N/P</th>
                                                        {isNewStructure ? (
                                                            <>
                                                                <th>D-Return</th>
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
                                                            <td>{bill.startDate} to {bill.endDate}</td>
                                                            <td>{bill.partyName}</td>
                                                            <td>{bill.payment}</td>
                                                            <td>{bill.PWT}</td>
                                                            <td>{bill.CASH}</td>
                                                            <td>{bill.BANK}</td>
                                                            <td>{bill.DUE}</td>
                                                            <td>{bill.N_P}</td>
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
                                                        <td>{totals.totalPayment + totals.totalN_P}</td>
                                                        <td>{totals.totalPWT}</td>
                                                        <td>{totals.totalCASH}</td>
                                                        <td>{totals.totalBANK}</td>
                                                        <td>{totals.totalDUE}</td>
                                                        <td>{totals.totalN_P}</td>
                                                        {isNewStructure ? (
                                                            <>
                                                                <td>{totals.totalNpD_Return}</td>
                                                                <td>{totals.totalNpS_TDS}</td>
                                                                <td>{totals.totalNpP_ATD}</td>
                                                                <td>{totals.totalNpC_ATD}</td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td>{totals.totalTCS}</td>
                                                                <td>{totals.totalTDS}</td>
                                                                <td>{totals.totalS_TDS}</td>
                                                                <td>{totals.totalATD}</td>
                                                            </>
                                                        )}
                                                        <td>{totals.totalAllTotals}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                        <div className="d-flex justify-content-center mt-3 gap-3">
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
            <div style={{ height: '100px' }}></div>
        </>
    );
}

export default ViewParty;