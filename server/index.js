const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const history = require('../lib/history');

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

app.get('/api/tournaments', (req, res) => {
  const { year, upcoming } = req.query;
  if (upcoming === 'true') return res.json(history.getUpcomingMatches());
  if (year) return res.json(history.getMatchesByYear(year));
  res.json(history.getTournaments());
});

app.get('/api/head-to-head', (req, res) => {
  const { team1, team2 } = req.query;
  if (!team1 || !team2) return res.status(400).json({ error: 'team1 and team2 required' });
  const matches = history.headToHead(team1, team2).sort((a, b) => b.date.localeCompare(a.date));
  res.json({
    team1, team2,
    total: matches.length,
    team1Wins: matches.filter((m) => m.winner?.toLowerCase() === team1.toLowerCase()).length,
    team2Wins: matches.filter((m) => m.winner?.toLowerCase() === team2.toLowerCase()).length,
    draws: matches.filter((m) => !m.winner).length,
    matches: matches.slice(0, 10),
  });
});

app.get('/api/teams', (req, res) => {
  const { name, q } = req.query;
  if (q) return res.json(history.searchTeams(q));
  if (!name) return res.status(400).json({ error: 'name required' });
  const profile = history.getTeamProfile(name);
  if (!profile) return res.status(404).json({ error: 'Team not found' });
  const recentMatches = history.teamMatches(name).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  res.json({ profile, recentMatches });
});

app.get('/api/stats', (_req, res) => {
  res.json(history.getStatsSummary());
});

app.listen(PORT, () => {
  console.log(`WCP API running on http://localhost:${PORT}`);
});
