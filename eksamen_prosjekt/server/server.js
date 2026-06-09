const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const { exec } = require("child_process");
const path = require("path");

const app = express();
const PORT = 5000;

const PYTHON = "C:\\Users\\Administrator\\Documents\\REACT_ISS-main\\.venv\\Scripts\\python.exe";

app.use(cors());
app.use(express.json());

// ─── Database ────────────────────────────────────────────────────────────────

const db = new sqlite3.Database("./support.db", (err) => {
  if (err) {
    console.error("Kunne ikke koble til SQLite:", err);
  } else {
    console.log("Tilkoblet SQLite-database");
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS support_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    problem_type TEXT NOT NULL,
    description TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS profiler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    navn TEXT NOT NULL,
    epost TEXT NOT NULL,
    rolle TEXT NOT NULL DEFAULT 'Admin',
    opprettet TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  INSERT OR IGNORE INTO profiler (id, navn, epost, rolle) VALUES (1, 'Administrator', 'admin@bjornholt.local', 'Admin')
`);

// ─── Hjelpefunksjon: kjør Python-script ──────────────────────────────────────

function kjorPython(scriptNavn, args, res, onSuccess) {
  const script = path.join(__dirname, scriptNavn);
  const argStr = args.map(a => `"${a}"`).join(" ");
  const cmd = `"${PYTHON}" "${script}" ${argStr}`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(`Feil i ${scriptNavn}:`, stderr);
      return res.status(500).json({ error: stderr.toString() || err.message });
    }
    onSuccess(stdout.trim());
  });
}

// ─── Support ─────────────────────────────────────────────────────────────────

app.post("/api/support", (req, res) => {
  const { name, email, problem_type, description } = req.body;
  db.run(
    `INSERT INTO support_requests (name, email, problem_type, description) VALUES (?, ?, ?, ?)`,
    [name, email, problem_type, description],
    function (err) {
      if (err) return res.status(500).json({ error: "Database insert error" });
      res.status(201).json({ message: "Henvendelse sendt", id: this.lastID });
    }
  );
});

app.get("/api/support", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin Area"');
    return res.status(401).send("Authentication required.");
  }
  const [user, pass] = Buffer.from(auth.split(" ")[1], "base64").toString().split(":");
  if (user !== "admin" || pass !== "admin123") return res.status(403).send("Forbidden");

  db.all(`SELECT * FROM support_requests ORDER BY created_at DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database query error" });
    res.json(rows);
  });
});

app.put("/api/support/:id/resolve", (req, res) => {
  const { resolved } = req.body;
  db.run(
    `UPDATE support_requests SET is_resolved = ? WHERE id = ?`,
    [resolved ? 1 : 0, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: "Database update error" });
      res.json({ message: "Status oppdatert" });
    }
  );
});

app.delete("/api/support/:id", (req, res) => {
  db.run(`DELETE FROM support_requests WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: "Sletting feilet" });
    res.json({ message: "Henvendelse slettet" });
  });
});

app.put("/api/support/:id", (req, res) => {
  const { name, email, problem_type, description } = req.body;
  db.run(
    `UPDATE support_requests SET name=?, email=?, problem_type=?, description=? WHERE id=?`,
    [name, email, problem_type, description, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: "Oppdatering feilet" });
      res.json({ message: "Henvendelse oppdatert" });
    }
  );
});

// ─── AD: Opprett / slett bruker ───────────────────────────────────────────────

app.post("/api/support/:id/ad", (req, res) => {
  const { username, name, type } = req.body;
  if (!username) return res.status(400).json({ error: "Mangler brukernavn" });

  console.log(`Oppretter AD-bruker: ${username} (${name})`);
  kjorPython("create_ad_user.py", [
    "--action", "create",
    "--username", username,
    "--password", "Temp123!",
    "--type", type || "student"
  ], res, (output) => {
    res.json({ message: "Bruker opprettet i AD", output });
  });
});

// ─── AD: Slett bruker ────────────────────────────────────────────────────────

app.delete("/api/ad/brukere/:username", (req, res) => {
  kjorPython("create_ad_user.py", [
    "--action", "delete",
    "--username", req.params.username
  ], res, (output) => {
    res.json({ message: output });
  });
});

// ─── AD: Hent alle brukere ───────────────────────────────────────────────────

app.get("/api/ad/brukere", (req, res) => {
  const script = path.join(__dirname, "get_ad_users.py");
  exec(`"${PYTHON}" "${script}"`, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr.toString() });
    try {
      const brukere = JSON.parse(stdout);
      res.json(brukere);
    } catch {
      res.status(500).json({ error: "Kunne ikke lese AD-data" });
    }
  });
});

// ─── AD: Deaktiver / Aktiver bruker ─────────────────────────────────────────

app.put("/api/ad/brukere/:username/toggle", (req, res) => {
  const { action } = req.body;
  if (!action) return res.status(400).json({ error: "Mangler action (enable/disable)" });

  kjorPython("toggle_ad_user.py", [
    "--username", req.params.username,
    "--action", action
  ], res, (output) => {
    res.json({ message: output });
  });
});

// ─── AD: Tilbakestill passord ────────────────────────────────────────────────

app.put("/api/ad/brukere/:username/passord", (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "Mangler passord" });

  kjorPython("reset_ad_password.py", [
    "--username", req.params.username,
    "--password", password
  ], res, (output) => {
    res.json({ message: output });
  });
});

// ─── AD: Flytt bruker til annen OU ──────────────────────────────────────────

app.put("/api/ad/brukere/:username/flytt", (req, res) => {
  const { ou } = req.body;
  if (!ou) return res.status(400).json({ error: "Mangler OU" });

  kjorPython("move_ad_user.py", [
    "--username", req.params.username,
    "--ou", ou
  ], res, (output) => {
    res.json({ message: output });
  });
});

// ─── Dashboard ───────────────────────────────────────────────────────────────

app.get("/api/dashboard", (req, res) => {
  db.get(`SELECT COUNT(*) AS totalt FROM support_requests`, (err, totalt) => {
    if (err) return res.status(500).json({ error: "DB-feil" });
    db.get(`SELECT COUNT(*) AS loste FROM support_requests WHERE is_resolved = 1`, (err, loste) => {
      if (err) return res.status(500).json({ error: "DB-feil" });
      db.get(`SELECT COUNT(*) AS uloste FROM support_requests WHERE is_resolved = 0`, (err, uloste) => {
        if (err) return res.status(500).json({ error: "DB-feil" });
        db.all(`SELECT * FROM support_requests ORDER BY created_at DESC LIMIT 5`, (err, siste) => {
          if (err) return res.status(500).json({ error: "DB-feil" });
          res.json({
            totalt: totalt.totalt,
            loste: loste.loste,
            uloste: uloste.uloste,
            sisteHenvendelser: siste
          });
        });
      });
    });
  });
});

// ─── Profil ──────────────────────────────────────────────────────────────────

app.get("/api/profil", (req, res) => {
  db.get(`SELECT * FROM profiler WHERE id = 1`, (err, row) => {
    if (err) return res.status(500).json({ error: "DB-feil" });
    res.json(row);
  });
});

app.put("/api/profil", (req, res) => {
  const { navn, epost, rolle } = req.body;
  db.run(
    `UPDATE profiler SET navn=?, epost=?, rolle=? WHERE id=1`,
    [navn, epost, rolle],
    function (err) {
      if (err) return res.status(500).json({ error: "Oppdatering feilet" });
      res.json({ message: "Profil oppdatert" });
    }
  );
});

// ─── Start server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server kjører på http://localhost:${PORT}`);
});