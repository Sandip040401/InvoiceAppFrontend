import React, { useState, useEffect } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import 'bootstrap/dist/css/bootstrap.min.css';

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
                // serialNo: index + 1,
                total: calculateRowTotal(bill),
            })).sort((a, b) => a.code.localeCompare(b.code));
            setBills(updatedBills);
            if (data.length > 0) {
                setTotalNP(data[0].totalNP);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
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

    const handleSaveClick = async () => {
        try {
            await handleSaveTotalNP();
    
            const updatedBills = await Promise.all(
                bills.map(async (bill) => {
                    // Create a copy of the bill object without the totalNP property
                    const { totalNP, ...billWithoutTotalNP } = bill;
    
                    const response = await fetch(`${backendUrl}/api/bills/${bill._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(billWithoutTotalNP),
                    });
                    if (!response.ok) {
                        throw new Error('Failed to update bill');
                    }
                    return response.json();
                })
            );
    
            setBills(updatedBills);
            setIsEditing(false); // Exit editing mode
            setMessage('Bills updated successfully!');
            setIsError(false);
        } catch (error) {
            console.error('Error updating bills:', error);
            setMessage('Failed to update bills. Please try again.');
            setIsError(true);
        }
    };
    

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
        const newTotalNP = parseFloat(e.target.value) || 0;
        setTotalNP(newTotalNP);
        setBills(prevBills => prevBills.map(bill => ({
            ...bill,
            total: calculateRowTotal(bill)
        })));
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
            if (!response.ok) {
                throw new Error('Failed to update totalNP');
            }
            setMessage('Total N/P updated successfully!');
            setIsError(false);
            fetchBills(); // Refresh the bills after the update
        } catch (error) {
            console.error('Error updating totalNP:', error);
            // setMessage('Failed to update total N/P. Please try again.');
            // setIsError(true);
        }
    }

    const calculateColumnTotal = (columnName) => {
        return bills.reduce((acc, bill) => acc + parseFloat(bill[columnName] || 0), 0);
    }

    const totalPayment = calculateColumnTotal('payment') + parseFloat(totalNP || 0);
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
                                className="btn btn-success mb-3 ml-2"
                                style={{marginLeft:'10px'}}
                                onClick={handleSaveClick}
                            >
                                Save
                            </button>
                        )}
                        </div>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">Sl no.</th>
                                    <th scope="col">Code</th>
                                    <th scope="col">PartyName</th>
                                    <th scope="col">Payment</th>
                                    <th scope="col">PWT</th>
                                    <th scope="col">CASH</th>
                                    <th scope="col">BANK</th>
                                    <th scope="col">DUE</th>
                                    <th scope="col">N/P</th>
                                    <th scope="col">TCS</th>
                                    <th scope="col">TDS</th>
                                    <th scope="col">S/TDS</th>
                                    <th scope="col">ATD</th>
                                    <th scope="col">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map((bill, index) => (
                                    <tr key={bill._id}>
                                        <td>{index+1}</td>
                                        <td>{bill.code}</td>
                                        <td>{bill.partyName}</td>
                                        <td>
                                            <b>{isEditing ? (
                                                <input
                                                    type="number"
                                                    value={bill.payment}
                                                    className="form-control"
                                                    onKeyDown={handleKeyDown}
                                                    onChange={(e) => handleInputChange(e, 'payment', index)}
                                                />
                                            ) : (
                                                bill.payment
                                            )}</b>
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={bill.PWT}
                                                    className="form-control"
                                                    onKeyDown={handleKeyDown}
                                                    onChange={(e) => handleInputChange(e, 'PWT', index)}
                                                />
                                            ) : (
                                                bill.PWT
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={bill.CASH}
                                                    className="form-control"
                                                    onKeyDown={handleKeyDown}
                                                    onChange={(e) => handleInputChange(e, 'CASH', index)}
                                                />
                                            ) : (
                                                bill.CASH
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={bill.BANK}
                                                    className="form-control"
                                                    onKeyDown={handleKeyDown}
                                                    onChange={(e) => handleInputChange(e, 'BANK', index)}
                                                />
                                            ) : (
                                                bill.BANK
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={bill.DUE}
                                                    className="form-control"
                                                    onKeyDown={handleKeyDown}
                                                    onChange={(e) => handleInputChange(e, 'DUE', index)}
                                                />
                                            ) : (
                                                bill.DUE
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={bill.N_P}
                                                    className="form-control"
                                                    onKeyDown={handleKeyDown}
                                                    onChange={(e) => handleInputChange(e, 'N_P', index)}
                                                />
                                            ) : (
                                                bill.N_P
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={bill.TCS}
                                                    className="form-control"
                                                    onKeyDown={handleKeyDown}
                                                    onChange={(e) => handleInputChange(e, 'TCS', index)}
                                                />
                                            ) : (
                                                bill.TCS
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={bill.TDS}
                                                    className="form-control"
                                                    onKeyDown={handleKeyDown}
                                                    onChange={(e) => handleInputChange(e, 'TDS', index)}
                                                />
                                            ) : (
                                                bill.TDS
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={bill.S_TDS}
                                                    className="form-control"
                                                    onKeyDown={handleKeyDown}
                                                    onChange={(e) => handleInputChange(e, 'S_TDS', index)}
                                                />
                                            ) : (
                                                bill.S_TDS
                                            )}
                                        </td>
                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={bill.ATD}
                                                    className="form-control"
                                                    onKeyDown={handleKeyDown}
                                                    onChange={(e) => handleInputChange(e, 'ATD', index)}
                                                />
                                            ) : (
                                                bill.ATD
                                            )}
                                        </td>
                                        <td>{bill.total}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="3" className="text-end"><b>Total N/P:</b></td>
                                    <td>
                                        <b>{isEditing ? (
                                            <input
                                                type="number"
                                                value={totalNP}
                                                className="form-control"
                                                onChange={handleTotalNPChange}
                                            />
                                        ) : (
                                            totalNP
                                        )}</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="3" className="text-end fw-bold">Total:</td>
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
                                    <td>{totalTotal}</td>
                                </tr>
                                
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div style={{height:'100px'}}>

            </div>
        </>
    );
}

export default EditBill;
