const fs = require('fs');
const path = require('path');

const DATA_ROOT = path.join(__dirname, '..', 'data');

let matchesCache = null;
let teamsCache = null;
let tournamentsCache = null;
const fixturesCache = {};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function getTournaments() {
  if (!tournamentsCache) {
    tournamentsCache = readJson(path.join(DATA_ROOT, 'tournaments.json'));
  }
  return tournamentsCache;
}

function getHistoricalMatches() {
  if (!matchesCache) {
    matchesCache = readJson(path.join(DATA_ROOT, 'history', 'matches.json'));
  }
  return matchesCache;
}

function getTeams() {
  if (!teamsCache) {
    teamsCache = readJson(path.join(DATA_ROOT, 'history', 'teams.json'));
  }
  return teamsCache;
}

function getFixtures(year) {
  if (!fixturesCache[year]) {
    const file = path.join(DATA_ROOT, 'fixtures', `${year}.json`);
    if (!fs.existsSync(file)) return [];
    fixturesCache[year] = readJson(file);
  }
  return fixturesCache[year];
}

function normalizeTeam(name) {
  return (name || '').trim().toLowerCase();
}

function teamMatches(name) {
  const n = normalizeTeam(name);
  return getHistoricalMatches().filter(
    (m) => normalizeTeam(m.team1) === n || normalizeTeam(m.team2) === n,
  );
}

function headToHead(team1, team2) {
  const a = normalizeTeam(team1);
  const b = normalizeTeam(team2);
  return getHistoricalMatches().filter((m) => {
    const t1 = normalizeTeam(m.team1);
    const t2 = normalizeTeam(m.team2);
    return (t1 === a && t2 === b) || (t1 === b && t2 === a);
  });
}

function getTeamProfile(name) {
  const teams = getTeams();
  return teams.find((t) => normalizeTeam(t.name) === normalizeTeam(name)) || null;
}

function getMatchesByYear(year) {
  const y = Number(year);
  if ([2018, 2022, 2026].includes(y)) {
    return getFixtures(y);
  }
  return getHistoricalMatches().filter((m) => m.year === y);
}

function getUpcomingMatches() {
  return getFixtures(2026).sort((a, b) => a.date.localeCompare(b.date));
}

function getStatsSummary() {
  const matches = getHistoricalMatches();
  const teams = getTeams();
  const tournaments = getTournaments();
  const goals = matches.reduce((sum, m) => sum + m.score1 + m.score2, 0);
  const upsets = matches.filter((m) => {
    if (!m.winner) return false;
    const favorite = m.team1;
    return m.winner !== favorite && m.winner !== m.team2;
  }).length;

  const topScorers = [...teams]
    .sort((a, b) => b.goalsFor - a.goalsFor)
    .slice(0, 5)
    .map((t) => ({ name: t.name, code: t.code, goalsFor: t.goalsFor, played: t.played }));

  return {
    totalMatches: matches.length,
    totalTournaments: tournaments.length,
    totalTeams: teams.length,
    totalGoals: goals,
    avgGoalsPerMatch: (goals / matches.length).toFixed(2),
    upcoming2026: getFixtures(2026).length,
    topScoringTeams: topScorers,
    sources: ['fjelstul', 'openfootball', 'worldcups.ai'],
  };
}

function searchTeams(query) {
  const q = normalizeTeam(query);
  if (!q) return getTeams().slice(0, 20);
  return getTeams().filter((t) => normalizeTeam(t.name).includes(q)).slice(0, 20);
}

module.exports = {
  getTournaments,
  getHistoricalMatches,
  getTeams,
  getFixtures,
  teamMatches,
  headToHead,
  getTeamProfile,
  getMatchesByYear,
  getUpcomingMatches,
  getStatsSummary,
  searchTeams,
};
