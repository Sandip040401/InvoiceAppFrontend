import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { Table, Button, Spinner, Modal, Container, Row, Col, Alert } from 'react-bootstrap';
import './ManageParty.css';

function ManageParty() {
    const { user, isAuthenticated } = useAuth0();
    const [partyNames, setPartyNames] = useState([]);
    const [codes, setCodes] = useState([]);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [partyToDelete, setPartyToDelete] = useState({ name: '', code: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const backendUrl = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        if (isAuthenticated && user?.email) {
          fetchPartyNamesAndCodes(user.email);
        }
      }, [isAuthenticated, user]);

    const fetchPartyNamesAndCodes = async (email) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${backendUrl}/api/party/${email}`);
            const { codes, partyNames } = response.data;
            // Sort party names and codes in ascending order
            // const sortedParties = partyNames.map((name, index) => ({ name, code: codes[index] }))
            //                                 .sort((a, b) => a.name.localeCompare(b.name));
            // setPartyNames(sortedParties.map(party => party.name));
            // setCodes(sortedParties.map(party => party.code));
            setPartyNames(partyNames);
            setCodes(codes);
        } catch (error) {
            setError('Error fetching party names and codes');
            console.error('Error fetching party names and codes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteParty = async () => {
        try {
            const email = user.email;
            const { name, code } = partyToDelete;
            await axios.delete(`${backendUrl}/api/party/${name}/${code}`, { params: { email } });
            fetchPartyNamesAndCodes(email);
        } catch (error) {
            setError('Error deleting party');
            console.error('Error deleting party:', error);
        } finally {
            setShowDeleteConfirmation(false);
        }
    };

    const onCancelDelete = () => {
        setShowDeleteConfirmation(false);
    };

    return (
        <>
        <Container>
            <Row className="justify-content-center">
                <Col md={8}>
                    <h3 className="text-center my-4">Manage Parties</h3>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Modal show={showDeleteConfirmation} onHide={onCancelDelete}>
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: 'red' }}>Confirm Delete</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Are you sure you want to delete the party "<span style={{ fontSize: '20px' }}>{partyToDelete.name}</span>" with code "<span style={{ fontSize: '20px' }}>{partyToDelete.code}</span>"?
                            <br /><span style={{ color: 'red', fontWeight: 'bold' }}>Note: This action cannot be reversed</span>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={onCancelDelete}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleDeleteParty}>
                                Delete
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {loading ? (
                        <div className="spinner-container">
                            <Spinner animation="border" role="status">
                                <span className="sr-only">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <Table striped bordered hover className="table-container">
                            <thead>
                                <tr>
                                    <th>Serial No</th>
                                    <th>Code</th>
                                    <th>Party Name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(partyNames) && partyNames.map((partyName, index) => (
                                    <tr key={index}>
                                        <td className="font-weight-bold">{index + 1}</td>
                                        <td className="font-weight-bold">{codes[index]}</td>
                                        <td className="font-weight-bold">{partyName}</td>
                                        <td className="table-actions">
                                            <Button
                                                variant="danger"
                                                onClick={() => {
                                                    setPartyToDelete({ name: partyName, code: codes[index] });
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
                    )}
                </Col>
            </Row>
            <div className="extra"></div>
        </Container>
        <div style={{height:'30px'}}>
        </div>
        </>
    );
}

export default ManageParty;
