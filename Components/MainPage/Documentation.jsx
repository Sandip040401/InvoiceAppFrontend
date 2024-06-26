import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function Documentation() {
  return (
    <Container className="py-5">
      <Row>
        <Col>
          <h1 className="text-center mb-4">Documentation</h1>
          <p className="lead text-center mb-4">
            Welcome to our comprehensive documentation. Here you'll find everything you need to get started with our product.
          </p>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-4">
          <h3>Getting Started</h3>
          <p>Learn how to set up your account and get started with our product.</p>
        </Col>
        <Col md={6} className="mb-4">
          <h3>Features</h3>
          <p>Explore the powerful features of our product and how to use them effectively.</p>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mb-4">
          <h3>FAQs</h3>
          <p>Find answers to commonly asked questions about our product and its usage.</p>
        </Col>
        <Col md={6} className="mb-4">
          <h3>Advanced Topics</h3>
          <p>Dive into advanced topics and learn how to make the most out of our product.</p>
        </Col>
      </Row>
    </Container>
  );
}

export default Documentation;
