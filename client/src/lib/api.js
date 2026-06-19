const API = '/api';

export async function fetchJson(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${path}`);
  }
  return res.json();
}

export function getStats() {
  return fetchJson('/stats');
}

export function getTournaments() {
  return fetchJson('/tournaments');
}

export function getUpcomingMatches() {
  return fetchJson('/tournaments?upcoming=true');
}

export function getMatchesByYear(year) {
  return fetchJson(`/tournaments?year=${year}`);
}

export function getHeadToHead(team1, team2) {
  return fetchJson(`/head-to-head?team1=${encodeURIComponent(team1)}&team2=${encodeURIComponent(team2)}`);
}

export function getTeamProfile(name) {
  return fetchJson(`/teams?name=${encodeURIComponent(name)}`);
}

export function searchTeams(q) {
  return fetchJson(`/teams?q=${encodeURIComponent(q)}`);
}

export function getPredictions() {
  return fetchJson('/predictions');
}

export async function createPrediction(data) {
  const res = await fetch(`${API}/predictions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save prediction');
  }
  return res.json();
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function teamInitials(name) {
  return (name || '??').split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase();
}
