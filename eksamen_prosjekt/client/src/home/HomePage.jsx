import React from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #0d6efd, #0dcaf0)",
          color: "white",
          padding: "4rem 2rem",
          textAlign: "center",
          borderRadius: "0 0 1rem 1rem",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ fontWeight: "bold", fontSize: "2.5rem" }}>
          Velkommen til IT-Supportportalen
        </h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "1rem auto" }}>
          Her kan du sende inn henvendelser, administrere AD-brukere og følge opp saker — raskt og enkelt.
        </p>
        <Button as={Link} to="/SupportPage" variant="light" size="lg" className="me-3">
          Send henvendelse
        </Button>
        <Button as={Link} to="/dashboard" variant="outline-light" size="lg">
          Se dashboard
        </Button>
      </div>

      {/* Kort */}
      <Row className="g-4 mb-5">
        <Col md={4}>
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <div style={{ fontSize: "3rem" }}>🎫</div>
              <Card.Title className="mt-2">Støttehenvendelser</Card.Title>
              <Card.Text>Send inn en IT-henvendelse og få hjelp fra supportteamet.</Card.Text>
              <Button as={Link} to="/SupportPage" variant="primary">Gå til skjema</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <div style={{ fontSize: "3rem" }}>👥</div>
              <Card.Title className="mt-2">AD-brukere</Card.Title>
              <Card.Text>Administrer Active Directory-brukere — opprett, deaktiver og flytt.</Card.Text>
              <Button as={Link} to="/adbrukere" variant="primary">Administrer</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <div style={{ fontSize: "3rem" }}>📊</div>
              <Card.Title className="mt-2">Dashboard</Card.Title>
              <Card.Text>Få oversikt over status, statistikk og siste henvendelser.</Card.Text>
              <Button as={Link} to="/dashboard" variant="primary">Åpne dashboard</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}