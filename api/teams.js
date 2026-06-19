const { getTeamProfile, teamMatches, searchTeams } = require('../lib/history');

module.exports = async (req, res) => {
  const { name, q } = req.query;

  if (q) {
    return res.status(200).json(searchTeams(q));
  }

  if (!name) {
    return res.status(400).json({ error: 'name query param is required' });
  }

  const profile = getTeamProfile(name);
  if (!profile) {
    return res.status(404).json({ error: 'Team not found' });
  }

  const recentMatches = teamMatches(name)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return res.status(200).json({ profile, recentMatches });
};
