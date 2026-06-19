import { useEffect, useState } from 'react';
import { getTournaments, getTeamProfile, searchTeams } from '../lib/api';

export default function History() {
  const [tournaments, setTournaments] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTournaments().then(setTournaments).catch(console.error);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      searchTeams(query).then(setResults).catch(console.error);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  async function loadTeam(name) {
    setLoading(true);
    setSelected(name);
    try {
      const data = await getTeamProfile(name);
      setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const winRate = profile
    ? ((profile.profile.wins / profile.profile.played) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Historical Explorer</h2>
        <p className="text-sm text-slate-400">
          Search 88 nations across {tournaments.length} World Cup tournaments (1930–2026)
        </p>
      </div>

      <div className="relative">
        <input
          type="search"
          className="input-field"
          placeholder="Search teams (e.g. Brazil, Germany, USA…)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {results.length > 0 && !selected && (
          <ul className="absolute z-10 w-full mt-1 card max-h-60 overflow-y-auto p-1">
            {results.map((t) => (
              <li key={t.name}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-surface-elevated text-sm min-h-[44px]"
                  onClick={() => { loadTeam(t.name); setQuery(t.name); setResults([]); }}
                >
                  <span className="font-medium">{t.name}</span>
                  <span className="text-slate-400 ml-2">({t.code}) · {t.played} matches</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && (
        <div className="card h-48 animate-pulse bg-surface-elevated" />
      )}

      {profile && !loading && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-xl font-bold mb-4">{profile.profile.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <div className="text-2xl font-bold">{profile.profile.played}</div>
                <div className="text-xs text-slate-400">Matches</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{profile.profile.wins}</div>
                <div className="text-xs text-slate-400">Wins</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{winRate}%</div>
                <div className="text-xs text-slate-400">Win Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent-gold">{profile.profile.goalsFor}</div>
                <div className="text-xs text-slate-400">Goals Scored</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Appearances: {profile.profile.tournaments?.join(', ')}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-3">Recent World Cup Matches</h4>
            <ul className="space-y-2">
              {profile.recentMatches.map((m) => (
                <li key={m.id} className="card flex flex-wrap justify-between items-center gap-2 text-sm">
                  <span className="text-slate-400">WC {m.year}</span>
                  <span className="font-medium">{m.team1} {m.score1}–{m.score2} {m.team2}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    m.winner ? 'bg-accent/15 text-accent' : 'bg-surface-elevated text-slate-400'
                  }`}>
                    {m.winner || 'Draw'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!profile && !loading && (
        <div className="card text-center py-12">
          <p className="text-slate-400 text-sm">Search for a team to explore their World Cup history</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['Brazil', 'Germany', 'Argentina', 'France', 'USA', 'Mexico'].map((t) => (
              <button
                key={t}
                type="button"
                className="btn-secondary text-xs"
                onClick={() => loadTeam(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h4 className="text-sm font-medium mb-3">Data Sources</h4>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• Fjelstul World Cup Database — 1,248 matches (1930–2022)</li>
          <li>• openfootball/worldcup.json — 2018, 2022, 2026 fixtures</li>
          <li>• WorldCups.ai — same Fjelstul dataset (CC-BY-NC-SA)</li>
        </ul>
      </div>
    </div>
  );
}
