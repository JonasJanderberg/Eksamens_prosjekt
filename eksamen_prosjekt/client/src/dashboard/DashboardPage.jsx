import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Badge, Spinner } from "react-bootstrap";

function DashboardPage() {
  const [data, setData] = useState(null);
  const [laster, setLaster] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard")
      .then((res) => res.json())
      .then((d) => { setData(d); setLaster(false); })
      .catch(() => setLaster(false));
  }, []);

  if (laster) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Laster dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Dashboard</h2>

      {/* Statistikkort */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="text-center border-primary shadow-sm">
            <Card.Body>
              <Card.Title>Totalt</Card.Title>
              <h1 className="display-4 text-primary">{data?.totalt ?? 0}</h1>
              <Card.Text>Henvendelser</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-success shadow-sm">
            <Card.Body>
              <Card.Title>Løste</Card.Title>
              <h1 className="display-4 text-success">{data?.loste ?? 0}</h1>
              <Card.Text>Henvendelser</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-danger shadow-sm">
            <Card.Body>
              <Card.Title>Uløste</Card.Title>
              <h1 className="display-4 text-danger">{data?.uloste ?? 0}</h1>
              <Card.Text>Henvendelser</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Siste henvendelser */}
      <Card className="shadow-sm">
        <Card.Header><strong>Siste 5 henvendelser</strong></Card.Header>
        <Card.Body>
          {data?.sisteHenvendelser?.length === 0 ? (
            <p className="text-muted">Ingen henvendelser ennå.</p>
          ) : (
            <Table striped hover responsive size="sm">
              <thead>
                <tr>
                  <th>Navn</th>
                  <th>E-post</th>
                  <th>Type</th>
                  <th>Dato</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.sisteHenvendelser?.map((h) => (
                  <tr key={h.id}>
                    <td>{h.name}</td>
                    <td>{h.email}</td>
                    <td>{h.problem_type}</td>
                    <td>{new Date(h.created_at).toLocaleDateString("nb-NO")}</td>
                    <td>
                      <Badge bg={h.is_resolved ? "success" : "danger"}>
                        {h.is_resolved ? "Løst" : "Uløst"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default DashboardPage;