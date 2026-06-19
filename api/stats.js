const { getStatsSummary } = require('../lib/history');

module.exports = async (_req, res) => {
  res.status(200).json(getStatsSummary());
};
