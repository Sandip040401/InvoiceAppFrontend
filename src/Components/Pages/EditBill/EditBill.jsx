import React, { useState, useEffect } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const NEW_STRUCTURE_CUTOFF = '2026-04-01';

function EditBill() {
    const { user } = useAuth0();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [bills, setBills] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [totalNP, setTotalNP] = useState(0);
    const backendUrl = import.meta.env.VITE_BASE_URL;

    const isNewStructure = startDate >= NEW_STRUCTURE_CUTOFF;

    useEffect(() => {
        fetchBills();
    }, [startDate, endDate]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchBills = async () => {
        try {
            const email = user.email;
            const response = await fetch(`${backendUrl}/api/bills/week?email=${email}&startDate=${startDate}&endDate=${endDate}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            const updatedBills = data.map(bill => ({
                ...bill,
                total: calculateRowTotal(bill),
            })).sort((a, b) => a.code.localeCompare(b.code));
            setBills(updatedBills);
            if (data.length > 0) {
                setTotalNP(data[0].totalNP);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // old: sums flat fields | new: sums flat fields + npEntries
    const calculateRowTotal = (bill) => {
        if (bill.isNewStructure) {
            const npTotal = (bill.npEntries || []).reduce(
                (sum, e) => sum +  (parseFloat(e.D_Return) || 0) + (parseFloat(e.S_TDS) || 0) + (parseFloat(e.P_ATD) || 0) + (parseFloat(e.C_ATD) || 0),
                0
            );
            const fieldsToSum = ['PWT', 'CASH', 'BANK', 'DUE', 'N_P'];
            return fieldsToSum.reduce((acc, key) => acc + (parseFloat(bill[key]) || 0), 0) + npTotal;
        }
        // old structure — unchanged
        const fieldsToSum = ['PWT', 'CASH', 'BANK', 'DUE', 'N_P', 'TCS', 'TDS', 'S_TDS', 'ATD'];
        return fieldsToSum.reduce((acc, key) => acc + (parseFloat(bill[key]) || 0), 0);
    };

    const handleStartDateChange = (e) => setStartDate(e.target.value);
    const handleEndDateChange   = (e) => setEndDate(e.target.value);

    // same as old — totalNP saved separately, bills saved individually
    const handleSaveClick = async () => {
        try {
            await handleSaveTotalNP(); // save totalNP first (no fetchBills inside)

            const updatedBills = await Promise.all(
                bills.map(async (bill) => {
                    const { totalNP: _tnp, ...billWithoutTotalNP } = bill;
                    const response = await fetch(`${backendUrl}/api/bills/${bill._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(billWithoutTotalNP),
                    });
                    if (!response.ok) throw new Error('Failed to update bill');
                    return response.json();
                })
            );

            setBills(updatedBills);
            setIsEditing(false);
            setMessage('Bills updated successfully!');
            setIsError(false);
            fetchBills(); // single refresh at the end
        } catch (error) {
            console.error('Error updating bills:', error);
            setMessage('Failed to update bills. Please try again.');
            setIsError(true);
        }
    };

    // same as old — handles flat field changes
    const handleInputChange = (e, field, index) => {
        const { value } = e.target;
        setBills(prevBills => {
            const updatedBills = [...prevBills];
            updatedBills[index] = {
                ...updatedBills[index],
                [field]: value,
                total: calculateRowTotal({ ...updatedBills[index], [field]: value }),
            };
            return updatedBills;
        });
    };

    // new structure only — handles npEntries sub-field changes
    const handleNpEntryChange = (e, field, index) => {
        const { value } = e.target;
        setBills(prevBills => {
            const updatedBills = [...prevBills];
            const updatedEntries = [...(updatedBills[index].npEntries || [{}])];
            updatedEntries[0] = { ...updatedEntries[0], [field]: value };
            updatedBills[index] = {
                ...updatedBills[index],
                npEntries: updatedEntries,
                total: calculateRowTotal({ ...updatedBills[index], npEntries: updatedEntries }),
            };
            return updatedBills;
        });
    };

    // same as old
    const handleTotalNPChange = (e) => {
        const newTotalNP = parseFloat(e.target.value) || 0;
        setTotalNP(newTotalNP);
        setBills(prevBills => prevBills.map(bill => ({
            ...bill,
            total: calculateRowTotal(bill),
        })));
    };

    // fixed: removed fetchBills() from here to avoid overwriting edited state mid-save
    const handleSaveTotalNP = async () => {
        try {
            const email = user.email;
            const response = await fetch(`${backendUrl}/api/bills/update/TotalNP`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ totalNP, startDate, endDate, email }),
            });
            if (!response.ok) throw new Error('Failed to update totalNP');
            setMessage('Total N/P updated successfully!');
            setIsError(false);
            // fetchBills() intentionally removed — called once at end of handleSaveClick
        } catch (error) {
            console.error('Error updating totalNP:', error);
        }
    };

    const calculateColumnTotal = (columnName) =>
        bills.reduce((acc, bill) => acc + parseFloat(bill[columnName] || 0), 0);

    // new structure: sum npEntries[0] sub-field across all bills
    const calculateNpEntryTotal = (field) =>
        bills.reduce((acc, bill) => {
            const entry = (bill.npEntries || [{}])[0] || {};
            return acc + (parseFloat(entry[field]) || 0);
        }, 0);

    // column totals — same as old
    const totalPayment = calculateColumnTotal('payment') + parseFloat(totalNP || 0);
    const totalPWT     = calculateColumnTotal('PWT');
    const totalCASH    = calculateColumnTotal('CASH');
    const totalBANK    = calculateColumnTotal('BANK');
    const totalDUE     = calculateColumnTotal('DUE');
    const totalN_P     = calculateColumnTotal('N_P');
    const totalTotal   = calculateColumnTotal('total');

    // old structure totals
    const totalTCS   = calculateColumnTotal('TCS');
    const totalTDS   = calculateColumnTotal('TDS');
    const totalS_TDS = calculateColumnTotal('S_TDS');
    const totalATD   = calculateColumnTotal('ATD');

    // new structure totals
    const totalNpD_Return = calculateNpEntryTotal('D_Return');
    const totalNpS_TDS = calculateNpEntryTotal('S_TDS');
    const totalNpP_ATD = calculateNpEntryTotal('P_ATD');
    const totalNpC_ATD = calculateNpEntryTotal('C_ATD');

    const COLS = isNewStructure ? 9 : 10;

    const handleKeyDown = (e) => {
        const inputs = document.getElementsByTagName('input');
        const currentIndex = Array.from(inputs).findIndex(input => document.activeElement === input);
        let nextIndex;

        if (e.key === "a" || e.key === "A") {
            e.preventDefault();
            nextIndex = currentIndex === 0 ? inputs.length - 1 : currentIndex - 1;
        } else if (e.key === "d" || e.key === "D") {
            e.preventDefault();
            nextIndex = currentIndex === inputs.length - 1 ? 0 : currentIndex + 1;
        } else if (e.key === "w" || e.key === "W") {
            e.preventDefault();
            nextIndex = currentIndex < COLS ? 0 : currentIndex - COLS;
        } else if (e.key === "s" || e.key === "S") {
            e.preventDefault();
            nextIndex = currentIndex + COLS >= inputs.length ? currentIndex % COLS : currentIndex + COLS;
        }

        inputs[nextIndex]?.focus();
    };

    return (
        <>
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card p-4">
                            <h4 className="mb-3 text-center">Enter Weekly Date Range</h4>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label htmlFor="start-date" className="form-label">Start Date:</label>
                                    <input
                                        type="date"
                                        id="start-date"
                                        className="form-control"
                                        value={startDate}
                                        onChange={handleStartDateChange}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="end-date" className="form-label">End Date:</label>
                                    <input
                                        type="date"
                                        id="end-date"
                                        className="form-control"
                                        value={endDate}
                                        onChange={handleEndDateChange}
                                    />
                                </div>
                            </div>
                            <button type="button" className="btn btn-primary" onClick={fetchBills}>View Bills</button>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`mt-3 alert ${isError ? 'alert-danger' : 'alert-success'}`} role="alert" style={{
                        position: 'fixed', top: '20px', right: '20px',
                        width: '300px', zIndex: '1000', padding: '10px',
                        textAlign: 'center', transform: 'translateY(0)'
                    }}>
                        {message}
                    </div>
                )}

                {bills.length > 0 && (
                    <div className="table-responsive mt-4">
                        <h5 className="text-center">Bills from {startDate} to {endDate}</h5>
                        <div className="d-flex justify-content-end">
                            <button
                                type="button"
                                className={`btn btn-${isEditing ? 'secondary' : 'warning'} mb-3`}
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? 'Cancel' : 'Edit'}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    className="btn btn-success mb-3"
                                    style={{ marginLeft: '10px' }}
                                    onClick={handleSaveClick}
                                >
                                    Save
                                </button>
                            )}
                        </div>

                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Sl no.</th>
                                    <th>Code</th>
                                    <th>PartyName</th>
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
                                            <th>S/TDS</th>
                                            <th>ATD</th>
                                        </>
                                    )}
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map((bill, index) => (
                                    <tr key={bill._id}>
                                        <td>{index + 1}</td>
                                        <td>{bill.code}</td>
                                        <td>{bill.partyName}</td>

                                        {/* Payment — same as old */}
                                        <td>
                                            <b>{isEditing ? (
                                                <input type="number" value={bill.payment}
                                                    className="form-control" onKeyDown={handleKeyDown}
                                                    onChange={(e) => handleInputChange(e, 'payment', index)} />
                                            ) : bill.payment}</b>
                                        </td>

                                        {/* PWT — same as old */}
                                        <td>{isEditing ? (
                                            <input type="number" value={bill.PWT}
                                                className="form-control" onKeyDown={handleKeyDown}
                                                onChange={(e) => handleInputChange(e, 'PWT', index)} />
                                        ) : bill.PWT}</td>

                                        {/* CASH — same as old */}
                                        <td>{isEditing ? (
                                            <input type="number" value={bill.CASH}
                                                className="form-control" onKeyDown={handleKeyDown}
                                                onChange={(e) => handleInputChange(e, 'CASH', index)} />
                                        ) : bill.CASH}</td>

                                        {/* BANK — same as old */}
                                        <td>{isEditing ? (
                                            <input type="number" value={bill.BANK}
                                                className="form-control" onKeyDown={handleKeyDown}
                                                onChange={(e) => handleInputChange(e, 'BANK', index)} />
                                        ) : bill.BANK}</td>

                                        {/* DUE — same as old */}
                                        <td>{isEditing ? (
                                            <input type="number" value={bill.DUE}
                                                className="form-control" onKeyDown={handleKeyDown}
                                                onChange={(e) => handleInputChange(e, 'DUE', index)} />
                                        ) : bill.DUE}</td>

                                        {/* N_P — same as old */}
                                        <td>{isEditing ? (
                                            <input type="number" value={bill.N_P}
                                                className="form-control" onKeyDown={handleKeyDown}
                                                onChange={(e) => handleInputChange(e, 'N_P', index)} />
                                        ) : bill.N_P}</td>

                                        {/* structure-dependent columns */}
                                        {isNewStructure ? (
                                            <>
                                              <td>{isEditing ? (
                                                    <input type="number"
                                                        value={bill.npEntries?.[0]?.D_Return ?? 0}
                                                        className="form-control" onKeyDown={handleKeyDown}
                                                        onChange={(e) => handleNpEntryChange(e, 'D_Return', index)} />
                                                ) : (bill.npEntries?.[0]?.D_Return ?? 0)}</td>

                                                <td>{isEditing ? (
                                                    <input type="number"
                                                        value={bill.npEntries?.[0]?.S_TDS ?? 0}
                                                        className="form-control" onKeyDown={handleKeyDown}
                                                        onChange={(e) => handleNpEntryChange(e, 'S_TDS', index)} />
                                                ) : (bill.npEntries?.[0]?.S_TDS ?? 0)}</td>

                                                <td>{isEditing ? (
                                                    <input type="number"
                                                        value={bill.npEntries?.[0]?.P_ATD ?? 0}
                                                        className="form-control" onKeyDown={handleKeyDown}
                                                        onChange={(e) => handleNpEntryChange(e, 'P_ATD', index)} />
                                                ) : (bill.npEntries?.[0]?.P_ATD ?? 0)}</td>

                                                <td>{isEditing ? (
                                                    <input type="number"
                                                        value={bill.npEntries?.[0]?.C_ATD ?? 0}
                                                        className="form-control" onKeyDown={handleKeyDown}
                                                        onChange={(e) => handleNpEntryChange(e, 'C_ATD', index)} />
                                                ) : (bill.npEntries?.[0]?.C_ATD ?? 0)}</td>
                                            </>
                                        ) : (
                                            <>
                                                {/* old structure — unchanged */}
                                                <td>{isEditing ? (
                                                    <input type="number" value={bill.TCS}
                                                        className="form-control" onKeyDown={handleKeyDown}
                                                        onChange={(e) => handleInputChange(e, 'TCS', index)} />
                                                ) : bill.TCS}</td>

                                                <td>{isEditing ? (
                                                    <input type="number" value={bill.TDS}
                                                        className="form-control" onKeyDown={handleKeyDown}
                                                        onChange={(e) => handleInputChange(e, 'TDS', index)} />
                                                ) : bill.TDS}</td>

                                                <td>{isEditing ? (
                                                    <input type="number" value={bill.S_TDS}
                                                        className="form-control" onKeyDown={handleKeyDown}
                                                        onChange={(e) => handleInputChange(e, 'S_TDS', index)} />
                                                ) : bill.S_TDS}</td>

                                                <td>{isEditing ? (
                                                    <input type="number" value={bill.ATD}
                                                        className="form-control" onKeyDown={handleKeyDown}
                                                        onChange={(e) => handleInputChange(e, 'ATD', index)} />
                                                ) : bill.ATD}</td>
                                            </>
                                        )}

                                        <td>{bill.total}</td>
                                    </tr>
                                ))}

                                {/* Total N/P row — same as old */}
                                <tr>
                                    <td colSpan="3" className="text-end"><b>Total N/P:</b></td>
                                    <td>
                                        <b>{isEditing ? (
                                            <input type="number" value={totalNP}
                                                className="form-control"
                                                onChange={handleTotalNPChange} />
                                        ) : totalNP}</b>
                                    </td>
                                </tr>

                                {/* Column totals row — switches by structure */}
                                <tr>
                                    <td colSpan="3" className="text-end fw-bold">Total:</td>
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
                                    <td>{totalTotal}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div style={{ height: '100px' }}></div>
        </>
    );
}

export default EditBill;