const {
  getTournaments,
  getMatchesByYear,
  getUpcomingMatches,
} = require('../lib/history');

module.exports = async (req, res) => {
  const { year, upcoming } = req.query;

  if (upcoming === 'true') {
    return res.status(200).json(getUpcomingMatches());
  }

  if (year) {
    return res.status(200).json(getMatchesByYear(year));
  }

  return res.status(200).json(getTournaments());
};
