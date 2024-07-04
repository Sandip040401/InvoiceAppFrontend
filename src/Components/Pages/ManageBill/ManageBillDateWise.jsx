import React, { useState, useEffect } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import { Container, Row, Col, Form, Button, Table, Spinner, Modal, Alert } from 'react-bootstrap';
import './ManageBill.css';

function ManageBillDateWise() {
    const { user, isAuthenticated } = useAuth0();
    const [partyList, setPartyList] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [billToDelete, setBillToDelete] = useState(null);
    const [error, setError] = useState('');
    const backendUrl = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        if (isAuthenticated && user?.email) {
            fetchPartyList(user.email);
        }
    }, [isAuthenticated, user]);

    const fetchPartyList = async (email) => {
        try {
            const response = await fetch(`${backendUrl}/api/party/${email}`);
            if (!response.ok) {
                throw new Error('Failed to fetch party list');
            }
            const { codes, partyNames } = await response.json();
            // Sort party names and codes in ascending order
            const sortedParties = partyNames.map((name, index) => ({ name, code: codes[index] }))
                .sort((a, b) => a.name.localeCompare(b.name));
            setPartyList(sortedParties);
        } catch (error) {
            setError('Error fetching party list');
            console.error('Error fetching party list:', error);
        }
    };

    const fetchBills = async () => {
        if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${backendUrl}/api/bills/date-range/${user.email}?start=${startDate}&end=${endDate}`);
            if (!response.ok) {
                throw new Error('Failed to fetch bills');
            }
            const data = await response.json();
            setBills(data);
        } catch (error) {
            setError('Error fetching bills');
            console.error('Error fetching bills:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBill = async () => {
        if (!billToDelete) return;
        try {
            const response = await fetch(`${backendUrl}/api/bills/${billToDelete._id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete bill');
            }
            // Remove the deleted bill from the bills state
            setBills(bills.filter(bill => bill._id !== billToDelete._id));
            // Close the delete confirmation modal
            setShowDeleteConfirmation(false);
            // Reset the billToDelete state
            setBillToDelete(null);
        } catch (error) {
            setError('Error deleting bill');
            console.error('Error deleting bill:', error);
        }
    };

    return (
        <Container className="manage-bill-container">
            <Row className="select-date-container">
                <Col md={4}>
                    <h2>Select Date Range</h2>
                </Col>
                <Col md={3}>
                    <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </Col>
                <Col md={3}>
                    <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </Col>
                <Col md={2}>
                    <Button variant="primary" onClick={fetchBills}>Fetch Bills</Button>
                </Col>
            </Row>
            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? (
                <div className="spinner-container">
                    <Spinner animation="border" role="status">
                        <span className="sr-only">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                <div className="bills-container">
                    {bills.length > 0 ? (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Sl No</th>
                                    <th>Code</th>
                                    <th>Start Date - End Date</th>
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
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map((bill) => (
                                    <tr key={bill._id}>
                                        <td>{bill.index+1}</td>
                                        <td>{bill.code}</td>
                                        <td>{bill.startDate} / {bill.endDate}</td>
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
                                        <td>{bill.total}</td>
                                        <td>
                                            <Button 
                                                variant="danger"
                                                onClick={() => {
                                                    setBillToDelete(bill);
                                                    setShowDeleteConfirmation(true);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="no-bills">No bills found for the selected date range.</div>
                    )}
                </div>
            )}
            <Modal show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the bill?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteBill}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ManageBillDateWise;
