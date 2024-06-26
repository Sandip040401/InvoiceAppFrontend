import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";

function ContactUs() {
  return (
    <Container className="py-5">
      <Row>
        <Col>
          <h1 className="text-center mb-4">Contact Us</h1>
          <p className="lead text-center mb-4">
            Have a question or feedback? Reach out to us. We'd love to hear from you.
          </p>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={8}>
          <Form>
            <Form.Group controlId="formName">
              <Form.Label>Your Name</Form.Label>
              <Form.Control type="text" placeholder="Enter your name" />
            </Form.Group>
            <Form.Group controlId="formEmail">
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="email" placeholder="Enter your email" />
            </Form.Group>
            <Form.Group controlId="formMessage">
              <Form.Label>Message</Form.Label>
              <Form.Control as="textarea" rows={5} placeholder="Enter your message" />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default ContactUs;
