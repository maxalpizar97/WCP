import { useEffect, useState } from 'react';
import MatchCard from '../components/MatchCard';
import { getTournaments, getMatchesByYear, getHeadToHead } from '../lib/api';

export default function Matches({ onPredict }) {
  const [tournaments, setTournaments] = useState([]);
  const [year, setYear] = useState(2026);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [h2h, setH2h] = useState(null);
  const [groupFilter, setGroupFilter] = useState('all');

  useEffect(() => {
    getTournaments().then(setTournaments).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    getMatchesByYear(year)
      .then(setMatches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  const groups = ['all', ...new Set(matches.map((m) => m.group).filter(Boolean))];

  const filtered = groupFilter === 'all'
    ? matches
    : matches.filter((m) => m.group === groupFilter);

  async function showH2H(match) {
    try {
      const data = await getHeadToHead(match.team1, match.team2);
      setH2h({ ...data, currentMatch: match });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-1">Match Explorer</h2>
        <p className="text-sm text-slate-400">Browse fixtures and results by tournament year</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {[2026, 2022, 2018, 2014, 2010, 2006, 2002, 1998, 1994, 1990, 1986, 1982, 1978, 1974, 1970, 1966, 1962, 1958, 1954, 1950, 1938, 1934, 1930]
          .filter((y) => tournaments.some((t) => t.year === y) || [2018, 2022, 2026].includes(y))
          .map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => { setYear(y); setGroupFilter('all'); }}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                year === y ? 'bg-accent text-surface' : 'bg-surface-elevated text-slate-300 hover:bg-surface-border'
              }`}
            >
              {y}
            </button>
          ))}
      </div>

      {groups.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroupFilter(g)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                groupFilter === g ? 'bg-accent/20 text-accent' : 'bg-surface-elevated text-slate-400'
              }`}
            >
              {g === 'all' ? 'All Groups' : g}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 animate-pulse">
          {[1, 2, 3, 4].map((i) => <div key={i} className="card h-36 bg-surface-elevated" />)}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((m) => (
            <MatchCard key={m.id} match={m} onPredict={onPredict} showH2H={showH2H} />
          ))}
        </div>
      )}

      {h2h && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-4" onClick={() => setH2h(null)}>
          <div className="card w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{h2h.team1} vs {h2h.team2}</h3>
                <p className="text-sm text-slate-400">Head-to-head at World Cups</p>
              </div>
              <button type="button" className="text-slate-400 hover:text-white text-xl" onClick={() => setH2h(null)}>×</button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="bg-surface-elevated rounded-lg p-2">
                <div className="text-lg font-bold text-accent">{h2h.team1Wins}</div>
                <div className="text-xs text-slate-400">{h2h.team1} wins</div>
              </div>
              <div className="bg-surface-elevated rounded-lg p-2">
                <div className="text-lg font-bold">{h2h.draws}</div>
                <div className="text-xs text-slate-400">Draws</div>
              </div>
              <div className="bg-surface-elevated rounded-lg p-2">
                <div className="text-lg font-bold text-accent-gold">{h2h.team2Wins}</div>
                <div className="text-xs text-slate-400">{h2h.team2} wins</div>
              </div>
            </div>
            {h2h.matches.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No previous World Cup meetings</p>
            ) : (
              <ul className="space-y-2">
                {h2h.matches.map((m) => (
                  <li key={m.id} className="flex justify-between items-center text-sm bg-surface-elevated rounded-lg px-3 py-2">
                    <span className="text-slate-400">WC {m.year}</span>
                    <span className="font-medium">{m.score1} – {m.score2}</span>
                    <span className="text-slate-400">{m.winner || 'Draw'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
