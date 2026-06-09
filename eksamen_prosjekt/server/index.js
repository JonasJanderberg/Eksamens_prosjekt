const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Midlertidig "database" i minnet
let feedbacks = [];

// GET /api/feedback – hent alle skjema
app.get("/api/feedback", (req, res) => {
  res.json(feedbacks);
});

// POST /api/feedback – lagre ett skjema
app.post("/api/feedback", (req, res) => {
  const feedback = {
    scores: req.body.scores,
    createdAt: new Date().toISOString()
  };

  feedbacks.push(feedback);
  res.status(201).json({ message: "Saved", feedback });
});

// Start server
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
