import React, { useState, useEffect } from "react";
import { Container, Card, Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import SupportPage from "../support/SupportPage";


function EvaluationPage() {
  const navigate = useNavigate();

  const questions = [
    "Hvor fornøyd er du med innholdet?",
    "Hvor tydelig var forklaringen?",
    "Hvor nyttig var oppgavene?",
    "Hvor godt passet tempoet for deg?",
    "Hvor sannsynlig er det at du vil anbefale dette til andre?"
  ];

  const [scores, setScores] = useState(Array(questions.length).fill(null));
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/feedback")
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          const last = data[data.length - 1];
          setScores(last.scores);
        }
      });
  }, []);

  const updateScore = (index, value) => {
    const newScores = [...scores];
    newScores[index] = value;
    setScores(newScores);
  };

  const handleSubmit = () => {
    fetch("http://localhost:5000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scores })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("DATA:", data);
        setShowModal(true); 
      })
      .catch((err) => console.error("FETCH ERROR:", err));
  };

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow-sm">
        <h2 className="mb-4">Evalueringsskjema</h2>

        {questions.map((q, i) => (
          <div key={i} className="mb-3">
            <p><strong>{q}</strong></p>

            {[1, 2, 3, 4, 5].map((num) => (
              <Button
                key={num}
                variant={scores[i] === num ? "success" : "secondary"}
                className="me-2"
                onClick={() => updateScore(i, num)}
              >
                {num}
              </Button>
            ))}
          </div>
        ))}

        <Button variant="primary" onClick={handleSubmit}>
          Send inn
        </Button>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Takk for tilbakemeldingen!</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Din evaluering er sendt inn.
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              setShowModal(false);
                navigate("/SupportPage");
            }}
          >
            Gå tilbake
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default EvaluationPage;
