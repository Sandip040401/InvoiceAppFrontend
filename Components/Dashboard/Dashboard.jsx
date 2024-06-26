import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

function Dashboard() {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [totalPayments, setTotalPayments] = useState(0);
    const [paymentDistribution, setPaymentDistribution] = useState({ CASH: 0, BANK: 0 });
    const [outstandingDues, setOutstandingDues] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [highestPayments, setHighestPayments] = useState([]); // Ensure this line is present
    const backendUrl = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        if (isAuthenticated && user) {
            // Fetch data from API
            const fetchData = async () => {
                try {
                    const response = await fetch(`${backendUrl}/api/dashboard?email=${user.email}`);
                    const data = await response.json();
                    setTotalPayments(data.totalPayments);
                    setPaymentDistribution(data.paymentDistribution);
                    setOutstandingDues(data.outstandingDues);
                    setRecentTransactions(data.recentTransactions);
                    setHighestPayments(data.highestPayments); // Ensure this is handled
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };

            fetchData();
        }
    }, [isAuthenticated, user]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <div>Please log in to view your dashboard.</div>;
    }

    return (
        <>
        <div className="container mt-4">
            <style>
                {`
                    .card-custom {
                        border-radius: 10px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    }
                    .card-header-custom {
                        font-weight: bold;
                        font-size: 1.2rem;
                    }
                    .card-body-custom h5 {
                        font-size: 1.5rem;
                    }
                    .table-custom {
                        margin-top: 20px;
                    }
                    .watermark-container {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
                        font-weight: bold;
                        font-size: 30px;
                        color: #555;
                        text-align: center;
                    }
                    
                    
                `}
            </style>

            <div className="row">
                {/* Total Payments Summary */}
                <div className="col-md-6 col-lg-3 mb-3">
                    <div className="card text-white bg-primary card-custom">
                        <div className="card-header card-header-custom">Total Payments</div>
                        <div className="card-body card-body-custom">
                            <h5 className="card-title">${totalPayments}</h5>
                        </div>
                    </div>
                </div>

                {/* Payment Method Distribution */}
                <div className="col-md-6 col-lg-3 mb-3">
                    <div className="card text-white bg-success card-custom">
                        <div className="card-header card-header-custom">Payment Distribution</div>
                        <div className="card-body card-body-custom">
                            <h5 className="card-title">CASH: ${paymentDistribution.CASH}</h5>
                            <h5 className="card-title">BANK: ${paymentDistribution.BANK}</h5>
                        </div>
                    </div>
                </div>

                {/* Outstanding Dues */}
                <div className="col-md-6 col-lg-3 mb-3">
                    <div className="card text-white bg-warning card-custom">
                        <div className="card-header card-header-custom">Outstanding Dues</div>
                        <div className="card-body card-body-custom">
                            {outstandingDues.length > 0 ? (
                                <ul className="list-group">
                                    {outstandingDues.map((due, index) => (
                                        <li key={index} className="list-group-item bg-warning">
                                            {due.partyName}: ${due.DUE}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="card-text">No outstanding dues</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Highest Payments This Week */}
                <div className="col-md-6 col-lg-3 mb-3">
                    <div className="card text-white bg-info card-custom">
                        <div className="card-header card-header-custom">Highest Payments This Week</div>
                        <div className="card-body card-body-custom">
                            {highestPayments.length > 0 ? (
                                <ul className="list-group">
                                    {highestPayments.map((payment, index) => (
                                        <li key={index} className="list-group-item bg-info">
                                            {payment.partyName}: ${payment.payment}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="card-text">No payments recorded</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="row">
                <div className="col-12">
                    <div className="card mb-3 card-custom">
                        <div className="card-header card-header-custom">Recent Transactions</div>
                        <div className="card-body card-body-custom">
                            {recentTransactions.length > 0 ? (
                                <table className="table table-custom">
                                    <thead>
                                        <tr>
                                            <th>Party Name</th>
                                            <th>Payment</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                        recentTransactions.map((transaction, index) => (
                                            <tr key={index}>
                                                <td>{transaction.partyName}</td>
                                                <td>₹{transaction.payment}</td>
                                                <td>{transaction.endDate}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        ) : (
                            <p>No recent transactions</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div className="watermark-container">
                Coming Soon Feature
                <br />
                Under Maintenance
            </div>
    </>
);
}

export default Dashboard;
