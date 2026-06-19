const { kv } = require('@vercel/kv');

const KEY = 'wcp:predictions';
let memoryStore = [];

function useKv() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getPredictions() {
  if (useKv()) {
    const data = await kv.get(KEY);
    return Array.isArray(data) ? data : [];
  }
  return memoryStore;
}

async function addPrediction(prediction) {
  const predictions = await getPredictions();
  predictions.push(prediction);

  if (useKv()) {
    await kv.set(KEY, predictions);
  } else {
    memoryStore = predictions;
  }

  return prediction;
}

module.exports = { getPredictions, addPrediction, useKv };
