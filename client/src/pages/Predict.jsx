import { useEffect, useState } from 'react';
import TeamBadge from '../components/TeamBadge';
import { getUpcomingMatches, getHeadToHead, createPrediction, getPredictions } from '../lib/api';

export default function Predict({ preselectedMatch, onClearPreselect }) {
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(preselectedMatch || null);
  const [step, setStep] = useState(preselectedMatch ? 2 : 1);
  const [winner, setWinner] = useState('');
  const [confidence, setConfidence] = useState(65);
  const [h2h, setH2h] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    getUpcomingMatches().then(setMatches).catch(console.error);
    getPredictions().then(setPredictions).catch(console.error);
  }, []);

  useEffect(() => {
    if (preselectedMatch) {
      setSelected(preselectedMatch);
      setStep(2);
      onClearPreselect?.();
    }
  }, [preselectedMatch, onClearPreselect]);

  useEffect(() => {
    if (selected) {
      getHeadToHead(selected.team1, selected.team2)
        .then(setH2h)
        .catch(console.error);
    }
  }, [selected]);

  function selectMatch(m) {
    setSelected(m);
    setWinner('');
    setStep(2);
    setSuccess(false);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selected || !winner) return;
    setSubmitting(true);
    setError('');
    try {
      await createPrediction({
        matchId: selected.id,
        homeTeam: selected.team1,
        awayTeam: selected.team2,
        predictedWinner: winner,
        confidence: confidence / 100,
      });
      setSuccess(true);
      setStep(1);
      setSelected(null);
      const updated = await getPredictions();
      setPredictions(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold mb-1">Make a Prediction</h2>
        <p className="text-sm text-slate-400">Pick a 2026 fixture, review history, then submit your pick</p>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full ${step >= s ? 'bg-accent' : 'bg-surface-elevated'}`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-300">Step 1 — Select a match</h3>
          <div className="grid gap-2 max-h-[50vh] overflow-y-auto">
            {matches.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => selectMatch(m)}
                className="card text-left hover:border-accent/40 transition-colors"
              >
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>{m.group}</span>
                  <span>{m.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <TeamBadge name={m.team1} />
                  <span className="text-slate-500 font-medium">vs</span>
                  <TeamBadge name={m.team2} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && selected && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-sm font-medium text-slate-300">Step 2 — Review & predict</h3>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <TeamBadge name={selected.team1} size="lg" />
              <span className="text-slate-500">vs</span>
              <TeamBadge name={selected.team2} size="lg" />
            </div>
            <p className="text-xs text-slate-400">{selected.group} · {selected.date} · {selected.venue}</p>
          </div>

          {h2h && (
            <div className="card">
              <h4 className="text-sm font-medium mb-2">Head-to-Head at World Cups</h4>
              {h2h.total === 0 ? (
                <p className="text-sm text-slate-400">First World Cup meeting</p>
              ) : (
                <p className="text-sm">
                  <span className="text-accent font-semibold">{h2h.team1}</span> {h2h.team1Wins} – {h2h.draws} – {h2h.team2Wins}{' '}
                  <span className="text-accent-gold font-semibold">{h2h.team2}</span>
                  <span className="text-slate-400"> ({h2h.total} meetings)</span>
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">Predicted winner</label>
            <div className="grid grid-cols-2 gap-2">
              {[selected.team1, selected.team2, 'Draw'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setWinner(opt)}
                  className={`py-3 rounded-lg font-medium text-sm min-h-[44px] transition-colors ${
                    winner === opt
                      ? 'bg-accent text-surface'
                      : 'bg-surface-elevated border border-surface-border text-slate-300 hover:border-accent/40'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">
              Confidence: {confidence}%
            </label>
            <input
              type="range"
              min="10"
              max="95"
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-accent text-sm">Prediction saved!</p>}

          <div className="flex gap-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => { setStep(1); setSelected(null); }}>
              Back
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={!winner || submitting}>
              {submitting ? 'Saving…' : 'Save Prediction'}
            </button>
          </div>
        </form>
      )}

      {predictions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Your Predictions ({predictions.length})</h3>
          <ul className="space-y-2">
            {predictions.map((p) => (
              <li key={p.id} className="card flex justify-between items-center text-sm">
                <span>{p.homeTeam} vs {p.awayTeam}</span>
                <span className="text-accent font-semibold">{p.predictedWinner}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
