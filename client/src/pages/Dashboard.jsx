import { useEffect, useState } from 'react';
import KpiCard from '../components/KpiCard';
import MatchCard from '../components/MatchCard';
import { getStats, getUpcomingMatches, getPredictions } from '../lib/api';

export default function Dashboard({ onNavigate, onPredict }) {
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getUpcomingMatches(), getPredictions()])
      .then(([s, u, p]) => {
        setStats(s);
        setUpcoming(u.slice(0, 5));
        setPredictions(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card h-24 bg-surface-elevated" />
          ))}
        </div>
        <div className="card h-48 bg-surface-elevated" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-1">Tournament Overview</h2>
        <p className="text-sm text-slate-400 mb-4">
          Historical data from 1930–2026 across {stats?.sources?.length} free sources
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Historical Matches" value={stats?.totalMatches?.toLocaleString()} />
          <KpiCard label="Nations" value={stats?.totalTeams} sub={`${stats?.totalTournaments} tournaments`} />
          <KpiCard label="Total Goals" value={stats?.totalGoals?.toLocaleString()} sub={`${stats?.avgGoalsPerMatch} avg/match`} />
          <KpiCard label="WC 2026 Fixtures" value={stats?.upcoming2026} sub={`${predictions.length} your picks`} />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upcoming 2026 Matches</h2>
          <button type="button" className="text-sm text-accent hover:underline" onClick={() => onNavigate('matches')}>
            View all →
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {upcoming.map((m) => (
            <MatchCard key={m.id} match={m} onPredict={onPredict} />
          ))}
        </div>
      </section>

      {stats?.topScoringTeams && (
        <section>
          <h2 className="text-lg font-semibold mb-4">All-Time Top Scoring Teams</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-surface-border">
                  <th className="pb-2 pr-4">Team</th>
                  <th className="pb-2 pr-4">Played</th>
                  <th className="pb-2">Goals</th>
                </tr>
              </thead>
              <tbody>
                {stats.topScoringTeams.map((t) => (
                  <tr key={t.name} className="border-b border-surface-border/50 last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{t.name}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{t.played}</td>
                    <td className="py-2.5 text-accent font-semibold">{t.goalsFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
