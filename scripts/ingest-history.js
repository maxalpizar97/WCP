/**
 * Node.js version of ingest-history.ps1
 * Run: node scripts/ingest-history.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data', 'history');
const FIXTURES_DIR = path.join(ROOT, 'data', 'fixtures');

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.text();
}

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
  });
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });

  console.log('Downloading Fjelstul matches.csv...');
  const csv = await fetchText('https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv/matches.csv');
  const rows = parseCsv(csv);

  const matches = rows.map((r) => {
    const yearMatch = r.tournament_name?.match(/(\d{4})/);
    const year = yearMatch ? Number(yearMatch[1]) : 0;
    let winner = null;
    if (r.home_team_win === '1') winner = r.home_team_name;
    else if (r.away_team_win === '1') winner = r.away_team_name;

    return {
      id: r.match_id,
      year,
      date: r.match_date,
      team1: r.home_team_name,
      team2: r.away_team_name,
      team1Code: r.home_team_code,
      team2Code: r.away_team_code,
      score1: Number(r.home_team_score),
      score2: Number(r.away_team_score),
      group: r.group_name,
      stage: r.stage_name,
      venue: r.stadium_name,
      city: r.city_name,
      country: r.country_name,
      winner,
      extraTime: r.extra_time === '1',
      penalties: r.penalty_shootout === '1',
      source: 'fjelstul',
    };
  });

  fs.writeFileSync(path.join(DATA_DIR, 'matches.json'), JSON.stringify(matches));
  console.log(`Wrote ${matches.length} historical matches`);

  const teamStats = {};
  for (const m of matches) {
    for (const side of [
      { name: m.team1, code: m.team1Code, scored: m.score1, conceded: m.score2 },
      { name: m.team2, code: m.team2Code, scored: m.score2, conceded: m.score1 },
    ]) {
      if (!teamStats[side.name]) {
        teamStats[side.name] = { name: side.name, code: side.code, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, tournaments: new Set() };
      }
      const t = teamStats[side.name];
      t.played++;
      t.goalsFor += side.scored;
      t.goalsAgainst += side.conceded;
      if (m.winner === side.name) t.wins++;
      else if (!m.winner) t.draws++;
      else t.losses++;
      t.tournaments.add(m.year);
    }
  }

  const teams = Object.values(teamStats)
    .map((t) => ({ ...t, tournaments: [...t.tournaments].sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(path.join(DATA_DIR, 'teams.json'), JSON.stringify(teams));
  console.log(`Wrote ${teams.length} team profiles`);

  const yearCounts = {};
  for (const m of matches) {
    yearCounts[m.year] = (yearCounts[m.year] || 0) + 1;
  }
  for (const y of [2018, 2022, 2026]) {
    if (!yearCounts[y]) yearCounts[y] = 0;
  }
  const tournaments = Object.entries(yearCounts)
    .map(([year, count]) => ({ year: Number(year), matchCount: count, source: 'fjelstul+openfootball' }))
    .sort((a, b) => a.year - b.year);

  fs.writeFileSync(path.join(ROOT, 'data', 'tournaments.json'), JSON.stringify(tournaments));

  for (const year of [2018, 2022, 2026]) {
    console.log(`Downloading openfootball ${year}...`);
    const data = await fetchJson(`https://raw.githubusercontent.com/openfootball/worldcup.json/master/${year}/worldcup.json`);
    const fixtures = data.matches.map((m) => {
      const s1 = m.score?.ft?.[0] ?? null;
      const s2 = m.score?.ft?.[1] ?? null;
      let winner = null;
      if (s1 != null && s2 != null) {
        if (s1 > s2) winner = m.team1;
        else if (s2 > s1) winner = m.team2;
      }
      return {
        id: `${year}-${m.team1}-${m.team2}-${m.date}`,
        year,
        date: m.date,
        time: m.time,
        team1: m.team1,
        team2: m.team2,
        score1: s1,
        score2: s2,
        group: m.group,
        round: m.round,
        venue: m.ground,
        goals1: m.goals1,
        goals2: m.goals2,
        winner,
        source: 'openfootball',
      };
    });
    fs.writeFileSync(path.join(FIXTURES_DIR, `${year}.json`), JSON.stringify(fixtures));
    console.log(`Wrote ${fixtures.length} fixtures for ${year}`);
  }

  console.log('Done.');
}

main().catch(console.error);
