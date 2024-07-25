import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { Table, Button, Spinner, Modal, Container, Row, Col, Alert, Form } from 'react-bootstrap';
import './ManageParty.css';

function ManageParty() {
    const { user, isAuthenticated } = useAuth0();
    const [partyNames, setPartyNames] = useState([]);
    const [codes, setCodes] = useState([]);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [partyToDelete, setPartyToDelete] = useState({ name: '', code: '' });
    const [partyToEdit, setPartyToEdit] = useState({ name: '', code: '' });
    const [newPartyName, setNewPartyName] = useState('');
    const [newPartyCode, setNewPartyCode] = useState('');
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

    const handleEditParty = (partyName, partyCode) => {
        setPartyToEdit({ name: partyName, code: partyCode });
        setNewPartyName(partyName);
        setNewPartyCode(partyCode);
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        try {
            const email = user.email;
            const { name, code } = partyToEdit;
            await axios.put(`${backendUrl}/api/party/${name}/${code}`, {
                newName: newPartyName,
                newCode: newPartyCode,
                email,
                oldName: name,
                oldCode: code
            });
            fetchPartyNamesAndCodes(email);
        } catch (error) {
            setError('Error updating party');
            console.error('Error updating party:', error);
        } finally {
            setShowEditModal(false);
        }
    };

    const onCancelDelete = () => {
        setShowDeleteConfirmation(false);
    };

    const onCancelEdit = () => {
        setShowEditModal(false);
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

                        <Modal show={showEditModal} onHide={onCancelEdit}>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit Party</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form>
                                    <Form.Group controlId="formPartyName">
                                        <Form.Label>Party Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={newPartyName}
                                            onChange={(e) => setNewPartyName(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="formPartyCode">
                                        <Form.Label>Party Code</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={newPartyCode}
                                            onChange={(e) => setNewPartyCode(e.target.value)}
                                        />
                                    </Form.Group>
                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={onCancelEdit}>
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={handleSaveEdit}>
                                    Save Changes
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
                                            <td className="table-actions d-flex justify-content-around">
                                                <Button
                                                    variant="success"
                                                    onClick={() => handleEditParty(partyName, codes[index])}
                                                    className=""
                                                >
                                                    Edit
                                                </Button>
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
            <div style={{ height: '100px' }}>
            </div>
        </>
    );
}

export default ManageParty;
