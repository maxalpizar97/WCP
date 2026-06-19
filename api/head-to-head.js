const { headToHead } = require('../lib/history');

module.exports = async (req, res) => {
  const { team1, team2 } = req.query;

  if (!team1 || !team2) {
    return res.status(400).json({ error: 'team1 and team2 query params are required' });
  }

  const matches = headToHead(team1, team2).sort((a, b) => b.date.localeCompare(a.date));
  const team1Wins = matches.filter((m) => m.winner && m.winner.toLowerCase() === team1.toLowerCase()).length;
  const team2Wins = matches.filter((m) => m.winner && m.winner.toLowerCase() === team2.toLowerCase()).length;
  const draws = matches.filter((m) => !m.winner).length;

  return res.status(200).json({
    team1,
    team2,
    total: matches.length,
    team1Wins,
    team2Wins,
    draws,
    matches: matches.slice(0, 10),
  });
};
