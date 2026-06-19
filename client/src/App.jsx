import { useEffect, useState } from 'react';

const API = '/api';

export default function App() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    matchId: '',
    homeTeam: '',
    awayTeam: '',
    predictedWinner: '',
    confidence: '',
  });

  async function fetchPredictions() {
    try {
      const res = await fetch(`${API}/predictions`);
      if (!res.ok) throw new Error('Failed to load predictions');
      setPredictions(await res.json());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPredictions();
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API}/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          confidence: form.confidence ? parseFloat(form.confidence) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save prediction');
      }

      setForm({ matchId: '', homeTeam: '', awayTeam: '', predictedWinner: '', confidence: '' });
      await fetchPredictions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1>World Cup 2026 Predictions</h1>
      <p className="subtitle">Make and track your match outcome predictions.</p>

      <div className="card">
        <h2>New Prediction</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Match ID
            <input
              value={form.matchId}
              onChange={(e) => updateField('matchId', e.target.value)}
              placeholder="e.g. group-a-1"
              required
            />
          </label>
          <label>
            Home Team
            <input
              value={form.homeTeam}
              onChange={(e) => updateField('homeTeam', e.target.value)}
              placeholder="e.g. USA"
              required
            />
          </label>
          <label>
            Away Team
            <input
              value={form.awayTeam}
              onChange={(e) => updateField('awayTeam', e.target.value)}
              placeholder="e.g. Mexico"
              required
            />
          </label>
          <label>
            Predicted Winner
            <input
              value={form.predictedWinner}
              onChange={(e) => updateField('predictedWinner', e.target.value)}
              placeholder="e.g. USA"
              required
            />
          </label>
          <label>
            Confidence (0–1, optional)
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={form.confidence}
              onChange={(e) => updateField('confidence', e.target.value)}
              placeholder="e.g. 0.65"
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Prediction'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="card">
        <h2>Your Predictions</h2>
        {loading ? (
          <p className="empty">Loading…</p>
        ) : predictions.length === 0 ? (
          <p className="empty">No predictions yet. Add your first one above.</p>
        ) : (
          <ul className="prediction-list">
            {predictions.map((p) => (
              <li key={p.id} className="prediction-item">
                <div className="match">
                  {p.homeTeam} vs {p.awayTeam} → <strong>{p.predictedWinner}</strong>
                </div>
                <div className="meta">
                  Match: {p.matchId}
                  {p.confidence != null && ` · Confidence: ${(p.confidence * 100).toFixed(0)}%`}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
