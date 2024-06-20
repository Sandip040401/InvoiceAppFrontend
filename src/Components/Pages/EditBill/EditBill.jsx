import React, { useState, useEffect } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import 'bootstrap/dist/css/bootstrap.min.css';

function EditBill() {
    const { user } = useAuth0();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [bills, setBills] = useState([]);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [totalNP, setTotalNP] = useState(0);
    const backendUrl = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        fetchBills();
    }, [startDate, endDate]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchBills = async () => {
        try {
            const email = user.email;
            const response = await fetch(`${backendUrl}/api/bills/week?email=${email}&startDate=${startDate}&endDate=${endDate}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            const updatedBills = data.map(bill => ({
                ...bill,
                total: calculateRowTotal(bill),
            }));
            setBills(updatedBills);
            if (data.length > 0) {
                setTotalNP(data[0].totalNP);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            // setMessage('Failed to fetch bills. Please try again.');
            // setIsError(true);
        }
    }

    const calculateRowTotal = (bill) => {
        const fieldsToSum = ['PWT', 'CASH', 'BANK', 'DUE', 'N_P', 'TCS', 'TDS', 'S_TDS', 'ATD'];
        return fieldsToSum.reduce((acc, key) => acc + (parseFloat(bill[key]) || 0), 0);
    }

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    }

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    }

    const handleEditClick = (index) => {
        setEditingIndex(index);
    }

    const handleCancelClick = () => {
        setEditingIndex(-1);
    }

    const handleSaveClick = async (index) => {
        try {
            const updatedBill = bills[index];
            const response = await fetch(`${backendUrl}/api/bills/${updatedBill._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedBill),
            });
            if (!response.ok) {
                throw new Error('Failed to update bill');
            }
            setEditingIndex(-1); // Exit editing mode
            setMessage('Bill updated successfully!');
            setIsError(false);
        } catch (error) {
            console.error('Error updating bill:', error);
            setMessage('Failed to update bill. Please try again.');
            setIsError(true);
        }
    }

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
    }

    const handleTotalNPChange = (e) => {
        setTotalNP(e.target.value);
    }

    const handleSaveTotalNP = async () => {
        try {
            const email = user.email;  // Fetch the user email
            const response = await fetch(`${backendUrl}/api/bills/update/TotalNP`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ totalNP, startDate, endDate, email }),
            });
            console.log(response);
            if (!response.ok) {
                throw new Error('Failed to update totalNP');
            }
            setMessage('Total N/P updated successfully!');
            setIsError(false);
            fetchBills(); // Refresh the bills after the update
        } catch (error) {
            console.error('Error updating totalNP:', error);
            setMessage('Failed to update total N/P. Please try again.');
            setIsError(true);
        }
    }
    
    

    const calculateColumnTotal = (columnName) => {
        return bills.reduce((acc, bill) => acc + parseFloat(bill[columnName] || 0), 0);
    }

    const totalPayment = calculateColumnTotal('payment');
    const totalPWT = calculateColumnTotal('PWT');
    const totalCASH = calculateColumnTotal('CASH');
    const totalBANK = calculateColumnTotal('BANK');
    const totalDUE = calculateColumnTotal('DUE');
    const totalN_P = calculateColumnTotal('N_P');
    const totalTCS = calculateColumnTotal('TCS');
    const totalTDS = calculateColumnTotal('TDS');
    const totalS_TDS = calculateColumnTotal('S_TDS');
    const totalATD = calculateColumnTotal('ATD');
    const totalTotal = calculateColumnTotal('total');

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
        } 
        inputs[nextIndex].focus();
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

            {bills.length > 0 && (
                <div className="table-responsive mt-4">
                    <h5 className="text-center">
                        Bills from {startDate} to {endDate}
                    </h5>
                    <table className="table table-bordered table-hover">
                        <thead className="table-light">
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
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill, index) => (
                                <tr key={bill._id}>
                                    <td>{bill.code}</td>
                                    <td>{bill.partyName}</td>
                                    <td>{editingIndex === index ? (
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={bill.payment}
                                            onChange={(e) => handleInputChange(e, 'payment', index)}
                                            onKeyDown={handleKeyDown} 
                                        />
                                    ) : (
                                        bill.payment
                                    )}</td>
                                    <td>{editingIndex === index ? (
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={bill.PWT}
                                            onChange={(e) => handleInputChange(e, 'PWT', index)}
                                            onKeyDown={handleKeyDown} 
                                        />
                                    ) : (
                                        bill.PWT
                                    )}</td>
                                    <td>{editingIndex === index ? (
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={bill.CASH}
                                            onChange={(e) => handleInputChange(e, 'CASH', index)}
                                            onKeyDown={handleKeyDown} 
                                        />
                                    ) : (
                                        bill.CASH
                                    )}</td>
                                    <td>{editingIndex === index ? (
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={bill.BANK}
                                            onChange={(e) => handleInputChange(e, 'BANK', index)}
                                            onKeyDown={handleKeyDown} 
                                        />
                                    ) : (
                                        bill.BANK
                                    )}</td>
                                    <td>{editingIndex === index ? (
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={bill.DUE}
                                            onChange={(e) => handleInputChange(e, 'DUE', index)}
                                            onKeyDown={handleKeyDown} 
                                        />
                                    ) : (
                                        bill.DUE
                                    )}</td>
                                    <td>{editingIndex === index ? (
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={bill.N_P}
                                            onChange={(e) => handleInputChange(e, 'N_P', index)}
                                            onKeyDown={handleKeyDown} 
                                        />
                                    ) : (
                                        bill.N_P
                                    )}</td>
                                    <td>{editingIndex === index ? (
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={bill.TCS}
                                            onChange={(e) => handleInputChange(e, 'TCS', index)}
                                            onKeyDown={handleKeyDown} 
                                        />
                                    ) : (
                                        bill.TCS
                                    )}</td>
                                    <td>{editingIndex === index ? (
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={bill.TDS}
                                            onChange={(e) => handleInputChange(e, 'TDS', index)}
                                            onKeyDown={handleKeyDown} 
                                        />
                                    ) : (
                                        bill.TDS
                                    )}</td>
                                    <td>{editingIndex === index ? (
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={bill.S_TDS}
                                            onChange={(e) => handleInputChange(e, 'S_TDS', index)}
                                            onKeyDown={handleKeyDown} 
                                        />
                                    ) : (
                                        bill.S_TDS
                                    )}</td>
                                    <td>{editingIndex === index ? (
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={bill.ATD}
                                            onChange={(e) => handleInputChange(e, 'ATD', index)}
                                            onKeyDown={handleKeyDown} 
                                        />
                                    ) : (
                                        bill.ATD
                                    )}</td>
                                    <td>{bill.total}</td>
                                    <td>
                                        {editingIndex === index ? (
                                            <>
                                            <div className="d-flex">
                                                <button
                                                    className="btn btn-success btn-sm me-2"
                                                    onClick={() => handleSaveClick(index)}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm me-2"
                                                    onClick={handleCancelClick}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            </>
                                        ) : (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleEditClick(index)}
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan="2">Total</td>
                                <td>{totalPayment}</td>
                                <td>{totalPWT}</td>
                                <td>{totalCASH}</td>
                                <td>{totalBANK}</td>
                                <td>{totalDUE}</td>
                                <td>{totalN_P}</td>
                                <td>{totalTCS}</td>
                                <td>{totalTDS}</td>
                                <td>{totalS_TDS}</td>
                                <td>{totalATD}</td>
                                <td>{totalTotal}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                    <div className=" mt-3">
                        <div className="col-md-2">
                            <label htmlFor="totalNP" className="form-label">Total N/P:</label>
                            <input
                                type="number"
                                id="totalNP"
                                className="form-control"
                                value={totalNP}
                                onChange={handleTotalNPChange}
                            />
                        </div>
                        <button type="button" className="btn btn-primary mt-2" onClick={handleSaveTotalNP}>Save Total N/P</button>
                    </div>
                </div>
            )}
        </div>
        <div style={{height:'100px'}}>
            
        </div>
        </>
    );
}

export default EditBill;
