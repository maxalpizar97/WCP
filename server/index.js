const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'predictions.json');

app.use(cors());
app.use(express.json());

function readPredictions() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writePredictions(predictions) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(predictions, null, 2));
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'wcp-api' });
});

app.get('/api/predictions', (_req, res) => {
  res.json(readPredictions());
});

app.post('/api/predictions', (req, res) => {
  const { matchId, homeTeam, awayTeam, predictedWinner, confidence } = req.body;

  if (!matchId || !homeTeam || !awayTeam || !predictedWinner) {
    return res.status(400).json({ error: 'matchId, homeTeam, awayTeam, and predictedWinner are required' });
  }

  const predictions = readPredictions();
  const prediction = {
    id: Date.now().toString(),
    matchId,
    homeTeam,
    awayTeam,
    predictedWinner,
    confidence: confidence ?? null,
    createdAt: new Date().toISOString(),
  };

  predictions.push(prediction);
  writePredictions(predictions);
  res.status(201).json(prediction);
});

app.listen(PORT, () => {
  console.log(`WCP API running on http://localhost:${PORT}`);
});
