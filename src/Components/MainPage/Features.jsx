import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faCalendarWeek, faUsers, faFileInvoice, faEye, faDownload, faFileExcel } from "@fortawesome/free-solid-svg-icons";

function Features() {
  const featureList = [
    { icon: faUserPlus, title: "Add Party", description: "Easily add new parties to your billing system." },
    { icon: faCalendarWeek, title: "Add Weekly Bill", description: "Create and manage weekly bills effortlessly." },
    { icon: faUsers, title: "Manage Party", description: "Manage all your parties in one place." },
    { icon: faFileInvoice, title: "Manage Bill", description: "Keep track of all your bills with ease." },
    { icon: faEye, title: "View Party", description: "View detailed information about each party." },
    { icon: faCalendarWeek, title: "View Weekly Bill", description: "Check all weekly bills in a single view." },
    { icon: faUsers, title: "View Party Wise Bill", description: "Get a detailed view of bills for each party." },
    { icon: faDownload, title: "Download Bills", description: "Download bills for offline access and records." },
    { icon: faFileExcel, title: "Excel Support", description: "Export your bills and reports to Excel." },
  ];

  return (
    <>
    <div>
      <style type="text/css">
        {`
          .feature-icon {
            color: #007bff;
          }

          .feature-card {
            transition: transform 0.3s;
          }

          .feature-card:hover {
            transform: scale(1.05);
          }

          .feature-card .card-title {
            font-size: 1.25rem;
            font-weight: bold;
          }

          .feature-card .card-text {
            font-size: 1rem;
            color: #6c757d;
          }
          .feature-heading {
            color: #007bff; /* Blue color */
            font-size: 2.5rem; /* Larger font size */
            font-weight: bold; /* Bold font weight */
            margin-bottom: 1rem; /* Increase bottom margin */
          }
          
        `}
      </style>

      <Container className="py-5">
        <Row>
            <Col className="text-center mb-5">
                <h2 className="feature-heading">Our Features</h2>
                <p className="text-muted">Explore the powerful features designed to make your billing process seamless and efficient.</p>
            </Col>
        </Row>

        <Row className="justify-content-center">
          {featureList.map((feature, index) => (
            <Col md={4} className="mb-4" key={index}>
              <Card className="text-center border-0 shadow-sm feature-card">
                <Card.Body>
                  <FontAwesomeIcon icon={feature.icon} className="feature-icon mb-3" size="3x" />
                  <Card.Title>{feature.title}</Card.Title>
                  <Card.Text>{feature.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
    <div style={{height:'30px'}}>

    </div>
    </>
  );
}

export default Features;
