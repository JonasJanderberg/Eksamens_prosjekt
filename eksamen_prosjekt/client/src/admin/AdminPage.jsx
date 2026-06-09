import React, { useState } from "react";
import {
  Container, Table, Form, Button, Alert, Badge, Modal, InputGroup
} from "react-bootstrap";

function AdminPage() {
  const [statusFilter, setStatusFilter] = useState("alle");
  const [auth, setAuth] = useState({ username: "", password: "" });
  const [data, setData] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState({});
  const [melding, setMelding] = useState(null);
  const [sok, setSok] = useState("");

  // Slett modal
  const [visSlettModal, setVisSlettModal] = useState(false);
  const [slettId, setSlettId] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/support", {
        headers: {
          Authorization: "Basic " + btoa(`${auth.username}:${auth.password}`),
        },
      });
      if (!res.ok) throw new Error("Ugyldig brukernavn eller passord");
      const result = await res.json();
      setData(result);
      setLoggedIn(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleResolve = async (id, currentStatus) => {
    await fetch(`http://localhost:5000/api/support/${id}/resolve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved: !currentStatus }),
    });
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_resolved: !currentStatus } : item
      )
    );
  };

  const bekreftSlett = (id) => {
    setSlettId(id);
    setVisSlettModal(true);
  };

  const slettHenvendelse = async () => {
    const res = await fetch(`http://localhost:5000/api/support/${slettId}`, {
      method: "DELETE",
    });
    setVisSlettModal(false);
    if (res.ok) {
      setData((prev) => prev.filter((item) => item.id !== slettId));
      setMelding("Henvendelse slettet.");
    }
  };

  const handleTypeChange = (id, type) => {
    setSelectedTypes((prev) => ({ ...prev, [id]: type }));
  };

  const handleADCreation = async (item) => {
    const type = selectedTypes[item.id];
    if (!type) return alert("Velg brukertype først");

    const username = item.name.toLowerCase().replace(" ", ".");
    const res = await fetch(`http://localhost:5000/api/support/${item.id}/ad`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, name: item.name, type }),
    });

    if (res.ok) {
      setMelding(`AD-bruker for ${item.name} er opprettet som ${type}`);
    } else {
      const data = await res.json();
      setError(`Feil: ${data.error}`);
    }
  };

  const filtrert = data.filter(item => {
  const matcherSok = item.name.toLowerCase().includes(sok.toLowerCase()) ||
                     item.email.toLowerCase().includes(sok.toLowerCase());

  const matcherStatus =
    statusFilter === "alle" ||
    (statusFilter === "loste" && item.is_resolved) ||
    (statusFilter === "uloste" && !item.is_resolved);

  return matcherSok && matcherStatus;
});

  const totalt = data.length;
  const loste = data.filter((d) => d.is_resolved).length;
  const uloste = data.filter((d) => !d.is_resolved).length;

  if (!loggedIn) {
    return (
      <Container className="mt-5" style={{ maxWidth: "400px" }}>
        <div className="text-center mb-4">
          <h2>Admin Login</h2>
          <p className="text-muted">Logg inn for å se henvendelser</p>
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={(e) => { e.preventDefault(); fetchData(); }}>
          <Form.Group className="mb-3">
            <Form.Label>Brukernavn</Form.Label>
            <Form.Control
              placeholder="admin"
              value={auth.username}
              onChange={(e) => setAuth({ ...auth, username: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Passord</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={auth.password}
              onChange={(e) => setAuth({ ...auth, password: e.target.value })}
            />
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100">
            Logg inn
          </Button>
        </Form>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Supporthenvendelser</h2>
        <Button variant="outline-secondary" size="sm" onClick={fetchData}>
          Oppdater
        </Button>
      </div>

      {melding && <Alert variant="success" dismissible onClose={() => setMelding(null)}>{melding}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      {/* Statistikk */}
      <div className="d-flex gap-3 mb-3">
        <Badge bg="secondary" style={{ fontSize: "0.95rem", padding: "0.5rem 1rem" }}>
          Totalt: {totalt}
        </Badge>
        <Badge bg="success" style={{ fontSize: "0.95rem", padding: "0.5rem 1rem" }}>
          Løste: {loste}
        </Badge>
        <Badge bg="danger" style={{ fontSize: "0.95rem", padding: "0.5rem 1rem" }}>
          Uløste: {uloste}
        </Badge>
      </div>

      {/* Søk */}
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Søk på navn, e-post eller problemtype..."
          value={sok}
          onChange={(e) => setSok(e.target.value)}
        />
        <Button variant="outline-secondary" onClick={() => setSok("")}>Tøm</Button>
      </InputGroup>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Navn</th>
            <th>E-post</th>
            <th>Type</th>
            <th>Beskrivelse</th>
            <th>Dato</th>
            <th>Status</th>
            <th>Handlinger</th>
          </tr>
        </thead>
        <tbody>
          {filtrert.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.email}</td>
              <td><Badge bg="info" text="dark">{item.problem_type}</Badge></td>
              <td style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.description}
              </td>
                <td>
                  {new Date(item.created_at).toLocaleString("nb-NO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </td>              
                <td>
                <Badge bg={item.is_resolved ? "success" : "danger"}>
                  {item.is_resolved ? "Løst" : "Uløst"}
                </Badge>
              </td>
              <td>
                <div className="d-flex flex-column gap-1">
                  <Button
                    variant={item.is_resolved ? "outline-danger" : "outline-success"}
                    size="sm"
                    onClick={() => toggleResolve(item.id, item.is_resolved)}
                  >
                    {item.is_resolved ? "Angre" : "Marker løst"}
                  </Button>

                  <Form.Select
                    size="sm"
                    value={selectedTypes[item.id] || ""}
                    onChange={(e) => handleTypeChange(item.id, e.target.value)}
                  >
                    <option value="">Velg type</option>
                    <option value="ny_ansatt">Ny ansatt</option>
                    <option value="ekstern">Ekstern</option>
                    <option value="student">Student</option>
                  </Form.Select>

                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={!selectedTypes[item.id]}
                    onClick={() => handleADCreation(item)}
                  >
                    Opprett AD-bruker
                  </Button>

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => bekreftSlett(item.id)}
                  >
                    Slett
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {filtrert.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-muted py-3">
                Ingen henvendelser funnet.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Slett modal */}
      <Modal show={visSlettModal} onHide={() => setVisSlettModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Bekreft sletting</Modal.Title>
        </Modal.Header>
        <Modal.Body>Er du sikker på at du vil slette denne henvendelsen? Dette kan ikke angres.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setVisSlettModal(false)}>Avbryt</Button>
          <Button variant="danger" onClick={slettHenvendelse}>Slett</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminPage;