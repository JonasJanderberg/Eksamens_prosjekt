import React, { useEffect, useState } from "react";
import { Container, Card, Form, Button, Alert, Row, Col } from "react-bootstrap";

function ProfilPage() {
  const [profil, setProfil] = useState({ navn: "", epost: "", rolle: "" });
  const [melding, setMelding] = useState(null);
  const [feil, setFeil] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/profil")
      .then((res) => res.json())
      .then((d) => setProfil({ navn: d.navn, epost: d.epost, rolle: d.rolle }));
  }, []);

  const lagre = async (e) => {
    e.preventDefault();
    setMelding(null);
    setFeil(null);
    const res = await fetch("http://localhost:5000/api/profil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profil),
    });
    if (res.ok) {
      setMelding("Profil oppdatert!");
    } else {
      setFeil("Noe gikk galt. Prøv igjen.");
    }
  };

  const initialer = profil.navn
    ? profil.navn.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <Container className="mt-4" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4">Min profil</h2>

      {/* Avatar */}
      <div className="text-center mb-4">
        <div
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            backgroundColor: "#0d6efd",
            color: "white",
            fontSize: "2rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          {initialer}
        </div>
        <p className="mt-2 text-muted">{profil.rolle}</p>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {melding && <Alert variant="success">{melding}</Alert>}
          {feil && <Alert variant="danger">{feil}</Alert>}

          <Form onSubmit={lagre}>
            <Form.Group className="mb-3">
              <Form.Label>Navn</Form.Label>
              <Form.Control
                value={profil.navn}
                onChange={(e) => setProfil({ ...profil, navn: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>E-post</Form.Label>
              <Form.Control
                type="email"
                value={profil.epost}
                onChange={(e) => setProfil({ ...profil, epost: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rolle</Form.Label>
              <Form.Select
                value={profil.rolle}
                onChange={(e) => setProfil({ ...profil, rolle: e.target.value })}
              >
                <option value="Admin">Admin</option>
                <option value="IT-støtte">IT-støtte</option>
                <option value="Leder">Leder</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col>
                <Button type="submit" variant="primary" className="w-100">
                  Lagre endringer
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ProfilPage;