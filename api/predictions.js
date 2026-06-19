const { getPredictions, addPrediction } = require('../lib/storage');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const predictions = await getPredictions();
    return res.status(200).json(predictions);
  }

  if (req.method === 'POST') {
    const { matchId, homeTeam, awayTeam, predictedWinner, confidence } = req.body || {};

    if (!matchId || !homeTeam || !awayTeam || !predictedWinner) {
      return res.status(400).json({
        error: 'matchId, homeTeam, awayTeam, and predictedWinner are required',
      });
    }

    const prediction = await addPrediction({
      id: Date.now().toString(),
      matchId,
      homeTeam,
      awayTeam,
      predictedWinner,
      confidence: confidence ?? null,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json(prediction);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
