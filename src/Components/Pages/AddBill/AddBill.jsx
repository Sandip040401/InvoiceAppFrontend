import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/react";
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
    const [totalNP, setTotalNP] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const backendUrl = import.meta.env.VITE_BASE_URL;

    console.log("=== COMPONENT RENDER ===");
    console.log("Auth Status:", { isAuthenticated, userEmail: user?.email });
    console.log("Backend URL:", backendUrl);
    console.log("Form Data Length:", formData.length);
    console.log("Party Names Length:", partyNames.length);
    console.log("Codes Length:", codes.length);
    console.log("Dates:", { startDate, endDate });
    console.log("isSubmitting:", isSubmitting);
    console.log("Message:", message);

    useEffect(() => {
        console.log("=== USER EFFECT TRIGGERED ===");
        console.log("User changed:", user?.email);
        fetchPartyNames();
    }, [user]);

    useEffect(() => {
        if (message) {
            console.log("=== MESSAGE TIMER SET ===", message);
            const timer = setTimeout(() => {
                setMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        console.log("=== BOOTSTRAP TOOLTIP INIT ===");
        const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            new window.bootstrap.Tooltip(tooltipTriggerEl);
        });
    }, []);

    useEffect(() => {
        console.log("=== TOTAL NP CHANGED ===", totalNP);
        updateColumnTotals(formData);
    }, [totalNP]);

    const fetchPartyNames = async () => {
        console.log("=== FETCH PARTY NAMES START ===");
        console.log("Is Authenticated:", isAuthenticated);
        console.log("User Email:", user?.email);
        
        try {
            if (isAuthenticated && user) {
                const fetchUrl = `${backendUrl}/api/party/${user.email}`;
                console.log("Fetching from URL:", fetchUrl);
                
                const response = await fetch(fetchUrl);
                console.log("Response status:", response.status);
                console.log("Response ok:", response.ok);
                
                if (!response.ok) {
                    throw new Error('Error fetching party names');
                }
                
                const partyNamesData = await response.json();
                console.log("Party Names Data:", partyNamesData);
                
                if (!partyNamesData.codes || !partyNamesData.partyNames) {
                    throw new Error('Invalid party names data format');
                }
                
                const { codes, partyNames } = partyNamesData;
                console.log("Codes:", codes);
                console.log("Party Names:", partyNames);
                
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
                
                console.log("Initial Form Data Created:", initialFormData.length, "entries");
                setFormData(initialFormData);
            } else {
                console.log("Not authenticated or no user - skipping fetch");
            }
        } catch (error) {
            console.error('=== ERROR FETCHING PARTY NAMES ===');
            console.error('Error:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
    };

    const handleChange = (index, name, value) => {
        console.log("=== HANDLE CHANGE ===", { index, name, value });
        const updatedFormData = [...formData];
        updatedFormData[index][name] = value || '0';
        setFormData(updatedFormData);
        updateColumnTotals(updatedFormData);
    };

    const getTotal = (data) => {
        const numbers = Object.entries(data)
            .filter(([key]) => !['payment', 'code', 'partyName'].includes(key))
            .map(([key, value]) => parseFloat(value || 0));
        const total = numbers.reduce((acc, curr) => acc + curr, 0).toFixed(2);
        return total;
    };

    const updateColumnTotals = (data) => {
        console.log("=== UPDATE COLUMN TOTALS ===");
        console.log("Data length:", data.length);
        
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

        totals.payment += parseFloat(totalNP || 0);
        console.log("Calculated Totals:", totals);
        setColumnTotals(totals);
    };

    const handleSubmit = async (e) => {
        console.log("=== HANDLE SUBMIT CALLED ===");
        console.log("Event:", e);
        console.log("Event type:", e.type);
        
        e.preventDefault();
        console.log("preventDefault called");
        
        console.log("Start Date:", startDate);
        console.log("End Date:", endDate);
        
        if (!startDate || !endDate) {
            console.log("=== DATE VALIDATION FAILED ===");
            setMessage('Both start date and end date are required.');
            setIsError(true);
            return;
        }
        
        console.log("=== API CALL STARTING ===");
        console.log("Current isSubmitting before set:", isSubmitting);
        
        setIsSubmitting(true);
        console.log("isSubmitting set to true");
        
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
            
            console.log("Bills prepared:", bills.length, "bills");
            console.log("Sample bill (first):", bills[0]);
            
            const email = user.email;
            console.log("User email:", email);
            console.log("Total NP:", totalNP);
            
            const requestBody = { bills, totalNP, email };
            console.log("Request body:", requestBody);
            
            const submitUrl = `${backendUrl}/api/bills`;
            console.log("Submit URL:", submitUrl);
            
            const fetchOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            };
            console.log("Fetch options:", fetchOptions);
            
            console.log("=== MAKING FETCH REQUEST ===");
            const response = await fetch(submitUrl, fetchOptions);
            
            console.log("=== RESPONSE RECEIVED ===");
            console.log("Response status:", response.status);
            console.log("Response ok:", response.ok);
            console.log("Response headers:", Object.fromEntries(response.headers.entries()));
            
            const responseText = await response.text();
            console.log("Response text:", responseText);

            if (!response.ok) {
                console.log("=== RESPONSE NOT OK ===");
                throw new Error(responseText || 'bills already exist');
            }
            
            console.log("=== SUCCESS ===");
            setMessage("Bills added successfully");
            setIsError(false);
        } catch (error) {
            console.error("=== ERROR IN SUBMIT ===");
            console.error("Error:", error);
            console.error("Error name:", error.name);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
            
            setMessage('Error adding bills: ' + error.message);
            setIsError(true);
        } finally {
            console.log("=== FINALLY BLOCK ===");
            setIsSubmitting(false);
            console.log("isSubmitting set to false");
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

    console.log("=== ABOUT TO RENDER JSX ===");
    console.log("Form will render with", formData.length, "rows");

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
                        top: '20px',
                        right: '20px',
                        zIndex: 1000,
                        maxWidth: '80%',
                        textAlign: 'center',
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="card-body">
                    <div className="d-flex justify-content-around">
                        <div className="form-group mx-4"style={{width:"400px"}}>
                            <label htmlFor="startDate">Start Date:</label>
                            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-control" required />
                        </div>
                        <div className="form-group mx-4" style={{width:"400px"}}>
                            <label htmlFor="endDate">End Date:</label>
                            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control" required />
                        </div>
                    </div>
                    <table className="table table-bordered mt-4">
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
                                    <td><input type="number" className="form-control" value={data.payment} onChange={(e) => handleChange(index, "payment", e.target.value)} onKeyDown={handleKeyDown} /></td>
                                    <td><input type="number" className="form-control" value={data.PWT} onChange={(e) => handleChange(index, "PWT", e.target.value)} onKeyDown={handleKeyDown} /></td>
                                    <td><input type="number" className="form-control" value={data.CASH} onChange={(e) => handleChange(index, "CASH", e.target.value)} onKeyDown={handleKeyDown} /></td>
                                    <td><input type="number" className="form-control" value={data.BANK} onChange={(e) => handleChange(index, "BANK", e.target.value)} onKeyDown={handleKeyDown} /></td>
                                    <td><input type="number" className="form-control" value={data.DUE} onChange={(e) => handleChange(index, "DUE", e.target.value)} onKeyDown={handleKeyDown} /></td>
                                    <td><input type="number" className="form-control" value={data.N_P} onChange={(e) => handleChange(index, "N_P", e.target.value)} onKeyDown={handleKeyDown} /></td>
                                    <td><input type="number" className="form-control" value={data.TCS} onChange={(e) => handleChange(index, "TCS", e.target.value)} onKeyDown={handleKeyDown} /></td>
                                    <td><input type="number" className="form-control" value={data.TDS} onChange={(e) => handleChange(index, "TDS", e.target.value)} onKeyDown={handleKeyDown} /></td>
                                    <td><input type="number" className="form-control" value={data.S_TDS} onChange={(e) => handleChange(index, "S_TDS", e.target.value)} onKeyDown={handleKeyDown} /></td>
                                    <td><input type="number" className="form-control" value={data.ATD} onChange={(e) => handleChange(index, "ATD", e.target.value)} onKeyDown={handleKeyDown} /></td>
                                    <td>{getTotal(data)}</td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan="2"><b>Total N/P:</b></td>
                                <td colSpan="1"><input type="number" className="form-control" value={totalNP} onChange={(e) => setTotalNP(e.target.value)} /></td>
                            </tr>
                            <tr>
                                <td colSpan="2"><b>Total:</b></td>
                                <td><b>{columnTotals.payment.toFixed(2)}</b></td>
                                <td><b>{columnTotals.PWT.toFixed(2)}</b></td>
                                <td><b>{columnTotals.CASH.toFixed(2)}</b></td>
                                <td><b>{columnTotals.BANK.toFixed(2)}</b></td>
                                <td><b>{columnTotals.DUE.toFixed(2)}</b></td>
                                <td><b>{columnTotals.N_P.toFixed(2)}</b></td>
                                <td><b>{columnTotals.TCS.toFixed(2)}</b></td>
                                <td><b>{columnTotals.TDS.toFixed(2)}</b></td>
                                <td><b>{columnTotals.S_TDS.toFixed(2)}</b></td>
                                <td><b>{columnTotals.ATD.toFixed(2)}</b></td>
                                <td><b>{columnTotals.Total.toFixed(2)}</b></td>
                            </tr>
                        </tbody>    
                    </table>
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={isSubmitting}
                        onClick={() => console.log("=== BUTTON CLICKED ===")}
                        style={{height:"40px",paddingTop:'10px'}}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
        </>
    );
}

export default AddBill;
