import React, { useEffect, useState } from "react";
import {
  Container, Table, Button, Form, Badge, Modal, Alert, Spinner, InputGroup
} from "react-bootstrap";

function ADBrukerePage() {
  const [brukere, setBrukere] = useState([]);
  const [filtrert, setFiltrert] = useState([]);
  const [sok, setSok] = useState("");
  const [laster, setLaster] = useState(true);
  const [melding, setMelding] = useState(null);
  const [feil, setFeil] = useState(null);

  // Passord modal
  const [visPassordModal, setVisPassordModal] = useState(false);
  const [valgtBruker, setValgtBruker] = useState(null);
  const [nyttPassord, setNyttPassord] = useState("");

  // Flytt OU modal
  const [visFlyttModal, setVisFlyttModal] = useState(false);
  const [valgtOU, setValgtOU] = useState("ansatte");

  // Slett modal
  const [visSlettModal, setVisSlettModal] = useState(false);

  const hentBrukere = () => {
    setLaster(true);
    fetch("http://localhost:5000/api/ad/brukere")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBrukere(data);
          setFiltrert(data);
        } else {
          setFeil(data.error || "Ukjent feil fra AD.");
          setBrukere([]);
          setFiltrert([]);
        }
        setLaster(false);
      })
      .catch(() => {
        setFeil("Kunne ikke hente AD-brukere. Sjekk at serveren kjører og AD er tilgjengelig.");
        setBrukere([]);
        setFiltrert([]);
        setLaster(false);
      });
  };

  useEffect(() => { hentBrukere(); }, []);

  useEffect(() => {
    const q = sok.toLowerCase();
    setFiltrert(brukere.filter(
      (b) => b.cn.toLowerCase().includes(q) || b.username.toLowerCase().includes(q) || b.email.toLowerCase().includes(q)
    ));
  }, [sok, brukere]);

  const visInfo = (tekst) => { setMelding(tekst); setFeil(null); };
  const visFeil = (tekst) => { setFeil(tekst); setMelding(null); };

  const toggleBruker = async (bruker) => {
    const action = bruker.aktiv ? "disable" : "enable";
    const res = await fetch(`http://localhost:5000/api/ad/brukere/${bruker.username}/toggle`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (res.ok) { visInfo(data.message); hentBrukere(); }
    else visFeil(data.error);
  };

  const apnePassordModal = (bruker) => {
    setValgtBruker(bruker);
    setNyttPassord("");
    setVisPassordModal(true);
  };

  const resetPassord = async () => {
    const res = await fetch(`http://localhost:5000/api/ad/brukere/${valgtBruker.username}/passord`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: nyttPassord }),
    });
    const data = await res.json();
    setVisPassordModal(false);
    if (res.ok) visInfo(data.message);
    else visFeil(data.error);
  };

  const apneSlettModal = (bruker) => {
    setValgtBruker(bruker);
    setVisSlettModal(true);
  };

  const slettBruker = async () => {
    const res = await fetch(`http://localhost:5000/api/ad/brukere/${valgtBruker.username}`, {
      method: "DELETE",
    });
    const data = await res.json();
    setVisSlettModal(false);
    if (res.ok) {
      visInfo(data.message);
      hentBrukere();
    } else {
      visFeil(data.error);
    }
  };

  const apneFlyttModal = (bruker) => {
    setValgtBruker(bruker);
    setValgtOU("ansatte");
    setVisFlyttModal(true);
  };

  const flyttBruker = async () => {
    const res = await fetch(`http://localhost:5000/api/ad/brukere/${valgtBruker.username}/flytt`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ou: valgtOU }),
    });
    const data = await res.json();
    setVisFlyttModal(false);
    if (res.ok) { visInfo(data.message); hentBrukere(); }
    else visFeil(data.error);
  };

  if (laster) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Henter AD-brukere...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-3">AD-brukere</h2>

      {melding && <Alert variant="success" dismissible onClose={() => setMelding(null)}>{melding}</Alert>}
      {feil && <Alert variant="danger" dismissible onClose={() => setFeil(null)}>{feil}</Alert>}

      {/* Søkefelt */}
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Søk på navn, brukernavn eller e-post..."
          value={sok}
          onChange={(e) => setSok(e.target.value)}
        />
        <Button variant="outline-secondary" onClick={() => setSok("")}>Tøm</Button>
        <Button variant="outline-primary" onClick={hentBrukere}>Oppdater</Button>
      </InputGroup>

      <p className="text-muted">Viser {filtrert.length} av {brukere.length} brukere</p>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Navn</th>
            <th>Brukernavn</th>
            <th>E-post</th>
            <th>Status</th>
            <th>Handlinger</th>
          </tr>
        </thead>
        <tbody>
          {filtrert.map((b) => (
            <tr key={b.username}>
              <td>{b.cn}</td>
              <td><code>{b.username}</code></td>
              <td>{b.email || "—"}</td>
              <td>
                <Badge bg={b.aktiv ? "success" : "danger"}>
                  {b.aktiv ? "Aktiv" : "Deaktivert"}
                </Badge>
              </td>
              <td className="d-flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={b.aktiv ? "outline-danger" : "outline-success"}
                  onClick={() => toggleBruker(b)}
                >
                  {b.aktiv ? "Deaktiver" : "Aktiver"}
                </Button>
                <Button size="sm" variant="outline-warning" onClick={() => apnePassordModal(b)}>
                  Reset passord
                </Button>
                <Button size="sm" variant="outline-secondary" onClick={() => apneFlyttModal(b)}>
                  Flytt OU
                </Button>
                <Button size="sm" variant="outline-danger" onClick={() => apneSlettModal(b)}>
                  Slett
                </Button>
              </td>
            </tr>
          ))}
          {filtrert.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted">Ingen brukere funnet.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Passord-modal */}
      <Modal show={visPassordModal} onHide={() => setVisPassordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Tilbakestill passord — {valgtBruker?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Nytt passord</Form.Label>
          <Form.Control
            type="password"
            placeholder="Minimum 8 tegn"
            value={nyttPassord}
            onChange={(e) => setNyttPassord(e.target.value)}
          />
          <Form.Text className="text-muted">
            Brukeren må bytte passord ved neste innlogging.
          </Form.Text>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setVisPassordModal(false)}>Avbryt</Button>
          <Button variant="warning" onClick={resetPassord} disabled={!nyttPassord}>
            Tilbakestill
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Slett-modal */}
      <Modal show={visSlettModal} onHide={() => setVisSlettModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Slett AD-bruker</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Er du sikker på at du vil slette <strong>{valgtBruker?.username}</strong> fra Active Directory? Dette kan ikke angres.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setVisSlettModal(false)}>Avbryt</Button>
          <Button variant="danger" onClick={slettBruker}>Slett</Button>
        </Modal.Footer>
      </Modal>

      {/* Flytt OU-modal */}
      <Modal show={visFlyttModal} onHide={() => setVisFlyttModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Flytt bruker — {valgtBruker?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Velg destinasjon</Form.Label>
          <Form.Select value={valgtOU} onChange={(e) => setValgtOU(e.target.value)}>
            <option value="ansatte">Ansatte</option>
            <option value="elever">Elever</option>
            <option value="ekstern">Ekstern</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setVisFlyttModal(false)}>Avbryt</Button>
          <Button variant="primary" onClick={flyttBruker}>Flytt</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ADBrukerePage;