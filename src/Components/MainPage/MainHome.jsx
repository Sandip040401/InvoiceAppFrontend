import React from "react";
import { Container, Row, Col, Button, Card, Accordion } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileInvoice, faChartBar, faMoneyCheckAlt, faUserShield, faTools, faCogs, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import './MainHome.css';

function MainHome() {
  return (
    <div className="main-home">
      <header className="hero-section text-center bg-primary text-white py-5">
        <Container>
          <Row>
            <Col className="bg-primary text-white">
              <h1 className="mb-4 bg-primary text-white">Welcome to Dear Invoice</h1>
              <p className="lead bg-primary text-white">
                Simplify your billing process with our intuitive invoice management system.
              </p>
              <Link to='/pricing'><Button variant="light" size="lg">Get Started</Button></Link>
            </Col>
          </Row>
        </Container>
      </header>

      <section className="features-section py-5 bg-light">
        <Container>
          <Row>
            <Col className="text-center mb-5">
              <h2>Features</h2>
              <p className="text-muted">Discover the powerful features that make Dear Invoice the best choice for your business.</p>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md={4} className="mb-4">
              <Card className="text-center border-0 shadow-sm">
                <Card.Body>
                  <FontAwesomeIcon icon={faFileInvoice} className="feature-icon mb-3" size="3x"/>
                  <Card.Title>Manage Invoices</Card.Title>
                  <Card.Text>Effortlessly create, send, and track invoices online.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="text-center border-0 shadow-sm">
                <Card.Body>
                  <FontAwesomeIcon icon={faMoneyCheckAlt} className="feature-icon mb-3" size="3x" />
                  <Card.Title>Track Payments</Card.Title>
                  <Card.Text>Keep track of payments received and outstanding invoices.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="text-center border-0 shadow-sm">
                <Card.Body>
                  <FontAwesomeIcon icon={faChartBar} className="feature-icon mb-3" size="3x" />
                  <Card.Title>Generate Reports</Card.Title>
                  <Card.Text>Generate detailed reports to gain insights into your finances.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md={4} className="mb-4">
              <Card className="text-center border-0 shadow-sm">
                <Card.Body>
                  <FontAwesomeIcon icon={faUserShield} className="feature-icon mb-3" size="3x" />
                  <Card.Title>Data Security</Card.Title>
                  <Card.Text>Ensure your data is secure with our top-notch security features.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="text-center border-0 shadow-sm">
                <Card.Body>
                  <FontAwesomeIcon icon={faTools} className="feature-icon mb-3" size="3x" />
                  <Card.Title>Customizable Templates</Card.Title>
                  <Card.Text>Create invoices that match your brand with customizable templates.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="text-center border-0 shadow-sm">
                <Card.Body>
                  <FontAwesomeIcon icon={faCogs} className="feature-icon mb-3" size="3x" />
                  <Card.Title>Automation</Card.Title>
                  <Card.Text>Automate your billing process and save time with our advanced features.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="testimonial-section py-5">
        <Container>
          <Row>
            <Col className="text-center mb-5">
              <h2>What Our Users Say</h2>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md={4} className="mb-4">
              <Card className="text-center border-0 shadow-sm">
                <Card.Body>
                  <Card.Text>
                    "Dear Invoice has transformed our billing process. It's easy to use and has saved us so much time."
                  </Card.Text>
                  <footer className="blockquote-footer">John Doe, <cite title="Source Title">XYZ Corp</cite></footer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="text-center border-0 shadow-sm">
                <Card.Body>
                  <Card.Text>
                    "The best invoice management system out there. Highly recommended!"
                  </Card.Text>
                  <footer className="blockquote-footer">Jane Smith, <cite title="Source Title">ABC Ltd</cite></footer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="text-center border-0 shadow-sm">
                <Card.Body>
                  <Card.Text>
                    "A must-have tool for any business. Dear Invoice is simply amazing."
                  </Card.Text>
                  <footer className="blockquote-footer">Michael Brown, <cite title="Source Title">DEF Inc</cite></footer>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="faq-section py-5 bg-light">
        <Container>
          <Row>
            <Col className="text-center mb-5">
              <h2>Frequently Asked Questions</h2>
              <p className="text-muted">Get answers to the most commonly asked questions about our service.</p>
            </Col>
          </Row>
          <Row>
            <Col>
              <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>
                    <FontAwesomeIcon icon={faQuestionCircle} className="me-2" /> What is Dear Invoice?
                  </Accordion.Header>
                  <Accordion.Body>
                    Dear Invoice is an online invoice management system that helps you create, send, and track invoices effortlessly.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>
                    <FontAwesomeIcon icon={faQuestionCircle} className="me-2" /> How do I get started?
                  </Accordion.Header>
                  <Accordion.Body>
                    Getting started is simple! Just click on the "Get Started" button and follow the instructions to set up your account.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header>
                    <FontAwesomeIcon icon={faQuestionCircle} className="me-2" /> Is my data secure?
                  </Accordion.Header>
                  <Accordion.Body>
                    Yes, your data is secure with us. We use top-notch security features to ensure your data is protected.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3">
                  <Accordion.Header>
                    <FontAwesomeIcon icon={faQuestionCircle} className="me-2" /> Can I customize my invoices?
                  </Accordion.Header>
                  <Accordion.Body>
                    Absolutely! You can customize your invoices with our customizable templates to match your brand.
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}

export default MainHome;
