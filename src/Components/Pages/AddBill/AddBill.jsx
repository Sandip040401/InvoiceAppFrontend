import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./AddBill.css";

function AddBill() {
    const { user, isAuthenticated } = useAuth0();
    const [formData, setFormData] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [partyNames, setPartyNames] = useState([]);
    const [codes, setCodes] = useState([]);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [columnTotals, setColumnTotals] = useState({
        payment: 0,
        PWT: 0,
        CASH: 0,
        BANK: 0,
        DUE: 0,
        N_P: 0,
        TCS: 0,
        TDS: 0,
        S_TDS: 0,
        ATD: 0,
        Total: 0
    });

    const backendUrl = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        fetchPartyNames();
    }, [user]);

    useEffect(() => {
        // Initialize Bootstrap tooltip
        const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            new window.bootstrap.Tooltip(tooltipTriggerEl);
        });
    }, []);

    const fetchPartyNames = async () => {
        try {
            if (isAuthenticated && user) {
                const response = await fetch(`${backendUrl}/api/party/${user.email}`);
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

                // const sortedPartyNames = partyNames.sort((a, b) => a.localeCompare(b));
                const sortedPartyNames = partyNames;
                // const sortedCodes = codes.sort((a, b) => a.localeCompare(b));
                const sortedCodes = codes;

                setPartyNames(sortedPartyNames);
                setCodes(sortedCodes);

                const initialFormData = sortedPartyNames.map((party, index) => ({
                    code: sortedCodes[index],
                    partyName: party,
                    payment: '',
                    PWT: '',
                    CASH: '',
                    BANK: '',
                    DUE: '',
                    N_P: '',
                    TCS: '',
                    TDS: '',
                    S_TDS: '',
                    ATD: ''
                }));
                setFormData(initialFormData);
            }
        } catch (error) {
            console.error('Error fetching party names: ', error);
        }
    };

    const handleChange = (index, name, value) => {
        const updatedFormData = [...formData];
        updatedFormData[index][name] = value || '0';
        setFormData(updatedFormData);
        updateColumnTotals(updatedFormData);
    };

    const getTotal = (data) => {
        const numbers = Object.entries(data)
            .filter(([key]) => !['payment', 'code', 'partyName'].includes(key))
            .map(([key, value]) => parseFloat(value || 0));
        return numbers.reduce((acc, curr) => acc + curr, 0).toFixed(2);
    };

    const updateColumnTotals = (data) => {
        const totals = data.reduce((acc, curr) => {
            acc.payment += parseFloat(curr.payment || 0);
            acc.PWT += parseFloat(curr.PWT || 0);
            acc.CASH += parseFloat(curr.CASH || 0);
            acc.BANK += parseFloat(curr.BANK || 0);
            acc.DUE += parseFloat(curr.DUE || 0);
            acc.N_P += parseFloat(curr.N_P || 0);
            acc.TCS += parseFloat(curr.TCS || 0);
            acc.TDS += parseFloat(curr.TDS || 0);
            acc.S_TDS += parseFloat(curr.S_TDS || 0);
            acc.ATD += parseFloat(curr.ATD || 0);
            acc.Total += parseFloat(getTotal(curr));
            return acc;
        }, {
            payment: 0,
            PWT: 0,
            CASH: 0,
            BANK: 0,
            DUE: 0,
            N_P: 0,
            TCS: 0,
            TDS: 0,
            S_TDS: 0,
            ATD: 0,
            Total: 0
        });
        setColumnTotals(totals);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            setMessage('Both start date and end date are required.');
            setIsError(true);
            return;
        }
        try {
            const bills = formData.map(data => ({
                code: data.code,
                startDate,
                endDate,
                partyName: data.partyName,
                payment: data.payment,
                PWT: data.PWT,
                CASH: data.CASH,
                BANK: data.BANK,
                DUE: data.DUE,
                N_P: data.N_P,
                TCS: data.TCS,
                TDS: data.TDS,
                S_TDS: data.S_TDS,
                ATD: data.ATD,
                email: user.email
            }));
            const response = await fetch(`${backendUrl}/api/bills`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bills)
            });

            if (!response.ok) {
                throw new Error('bills already exist');
            }
            setMessage("Bills added successfully");
            setIsError(false);
        } catch (error) {
            setMessage('Error adding bills: ' + error.message);
            setIsError(true);
        }
    };

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
            nextIndex = currentIndex < 11 ? 0 : currentIndex - 11;
        } else if (e.key === "s" || e.key === "S") {
            e.preventDefault();
            nextIndex = currentIndex + 11 >= inputs.length ? currentIndex % 11 : currentIndex + 11;
        }

        inputs[nextIndex].focus();
    };

    return (
        <>
        <div className="container mt-5">
            <div className="card shadow">
                <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between">
                    Add Weekly Bill
                    <i className="fas fa-info-circle" style={{color:'white',backgroundColor:"#0D6EFD"}} data-bs-toggle="tooltip" data-bs-placement="top" title="Use W, A, S, D to move between the cells"></i>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">Start Date:</label>
                                <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">End Date:</label>
                                <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                                <thead className="thead-dark">
                                    <tr>
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
                                    {formData.map((data, index) => (
                                        <tr key={index}>
                                            <td>{data.code}</td>
                                            <td>{partyNames[index]}</td>
                                            <td><input type="number" name="payment" className="form-control form-control-sm" value={data.payment} onChange={(e) => handleChange(index, e.target.name, e.target.value)} placeholder="0" onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" name="PWT" className="form-control form-control-sm" value={data.PWT} onChange={(e) => handleChange(index, e.target.name, e.target.value)} placeholder="0" onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" name="CASH" className="form-control form-control-sm" value={data.CASH} onChange={(e) => handleChange(index, e.target.name, e.target.value)} placeholder="0" onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" name="BANK" className="form-control form-control-sm" value={data.BANK} onChange={(e) => handleChange(index, e.target.name, e.target.value)} placeholder="0" onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" name="DUE" className="form-control form-control-sm" value={data.DUE} onChange={(e) => handleChange(index, e.target.name, e.target.value)} placeholder="0" onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" name="N_P" className="form-control form-control-sm" value={data.N_P} onChange={(e) => handleChange(index, e.target.name, e.target.value)} placeholder="0" onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" name="TCS" className="form-control form-control-sm" value={data.TCS} onChange={(e) => handleChange(index, e.target.name, e.target.value)} placeholder="0" onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" name="TDS" className="form-control form-control-sm" value={data.TDS} onChange={(e) => handleChange(index, e.target.name, e.target.value)} placeholder="0" onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" name="S_TDS" className="form-control form-control-sm" value={data.S_TDS} onChange={(e) => handleChange(index, e.target.name, e.target.value)} placeholder="0" onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" name="ATD" className="form-control form-control-sm" value={data.ATD} onChange={(e) => handleChange(index, e.target.name, e.target.value)} placeholder="0" onKeyDown={handleKeyDown} /></td>
                                            <td><input type="text" className="form-control form-control-sm" value={getTotal(data)} disabled /></td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="2"><strong>Total</strong></td>
                                        <td>{columnTotals.payment.toFixed(2)}</td>
                                        <td>{columnTotals.PWT.toFixed(2)}</td>
                                        <td>{columnTotals.CASH.toFixed(2)}</td>
                                        <td>{columnTotals.BANK.toFixed(2)}</td>
                                        <td>{columnTotals.DUE.toFixed(2)}</td>
                                        <td>{columnTotals.N_P.toFixed(2)}</td>
                                        <td>{columnTotals.TCS.toFixed(2)}</td>
                                        <td>{columnTotals.TDS.toFixed(2)}</td>
                                        <td>{columnTotals.S_TDS.toFixed(2)}</td>
                                        <td>{columnTotals.ATD.toFixed(2)}</td>
                                        <td>{columnTotals.Total.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="row mb-3">
                            <div className="col-md-6 d-flex">
                                <label className="form-label">Total N/P:</label>
                                <span style={{ marginLeft: '20px' }}>{columnTotals.N_P.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <button type="submit" className="btn btn-primary">Submit</button>
                        </div>
                    </form>
                    {message && (
                        <div className={`alert mt-3 ${isError ? "alert-danger" : "alert-success"}`} role="alert">
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
        <div style={{height:'100px'}}>
        </div>
        </>
    );
}

export default AddBill;
