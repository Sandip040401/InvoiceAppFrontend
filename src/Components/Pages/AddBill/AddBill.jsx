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
    const [totalNP, setTotalNP] = useState(0); // New state variable for Total N/P input

    const backendUrl = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        fetchPartyNames();
    }, [user]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);


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

                const sortedPartyNames = partyNames;
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
                ATD: data.ATD
            }));
            const email = user.email;
            const response = await fetch(`${backendUrl}/api/bills`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bills, totalNP, email }) // Include totalNP in the submission
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
            nextIndex = currentIndex < 10 ? 0 : currentIndex - 10;
        } else if (e.key === "s" || e.key === "S") {
            e.preventDefault();
            nextIndex = currentIndex + 10 >= inputs.length ? currentIndex % 10 : currentIndex + 10;
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
                {message && (
                    <div className={`mt-3 alert ${isError ? 'alert-danger' : 'alert-success'}`} role="alert" style={{
                        position: 'fixed',
                        top: '20px',  // Adjust as necessary to position from top
                        right: '20px', // Adjust as necessary to position from right
                        width: '300px', // Adjust the width of the alert
                        zIndex: '1000', // Ensure the alert is above other content
                        padding: '10px', // Adjust padding for content spacing
                        textAlign: 'center', // Center align the text
                        transform: 'translateY(0)' // Ensure alert stays at the top of the viewport
                    }}>
                        {message}
                    </div>
                )}

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
                                        <th>N/P</th>
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
                                            <td>{data.partyName}</td>
                                            <td><input type="number" className="form-control" value={data.payment} onChange={(e) => handleChange(index, 'payment', e.target.value)} onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" className="form-control" value={data.PWT} onChange={(e) => handleChange(index, 'PWT', e.target.value)} onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" className="form-control" value={data.CASH} onChange={(e) => handleChange(index, 'CASH', e.target.value)} onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" className="form-control" value={data.BANK} onChange={(e) => handleChange(index, 'BANK', e.target.value)} onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" className="form-control" value={data.DUE} onChange={(e) => handleChange(index, 'DUE', e.target.value)} onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" className="form-control" value={data.N_P} onChange={(e) => handleChange(index, 'N_P', e.target.value)} onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" className="form-control" value={data.TCS} onChange={(e) => handleChange(index, 'TCS', e.target.value)} onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" className="form-control" value={data.TDS} onChange={(e) => handleChange(index, 'TDS', e.target.value)} onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" className="form-control" value={data.S_TDS} onChange={(e) => handleChange(index, 'S_TDS', e.target.value)} onKeyDown={handleKeyDown} /></td>
                                            <td><input type="number" className="form-control" value={data.ATD} onChange={(e) => handleChange(index, 'ATD', e.target.value)} onKeyDown={handleKeyDown} /></td>
                                            <td>{getTotal(data)}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan="2" className="text-right font-weight-bold">Total</td>
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
                                </tbody>
                            </table>
                        </div>
                        <div className="row mt-3">
                            <div className="col-md-12">
                                <label className="form-label">Total N/P:</label>
                                <input type="number" className="form-control" style={{width:'130px'}} value={totalNP} onChange={(e) => setTotalNP(e.target.value)} />
                            </div>
                        </div>
                        <div className="d-flex justify-content-center">
                            <button type="submit" className="btn btn-primary mt-3">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div style={{height:'100px'}}>

        </div>
        </>
    );
}

export default AddBill;
