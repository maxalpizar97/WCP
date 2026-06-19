const { useKv } = require('../lib/storage');

module.exports = async (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'wcp-api',
    storage: useKv() ? 'vercel-kv' : 'memory',
  });
};
