import TeamBadge from './TeamBadge';
import { formatDate } from '../lib/api';

export default function MatchCard({ match, onPredict, showH2H }) {
  const hasScore = match.score1 != null && match.score2 != null;
  const isUpcoming = !hasScore;

  return (
    <div className="card hover:border-accent/30 transition-colors">
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="text-xs text-slate-400 font-medium">
          {match.group || match.stage || `WC ${match.year}`}
        </span>
        <span className="text-xs text-slate-500">{formatDate(match.date)}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <TeamBadge name={match.team1} code={match.team1Code} />
        </div>

        <div className="text-center shrink-0 px-2">
          {hasScore ? (
            <div className="text-xl font-bold tabular-nums">
              {match.score1} – {match.score2}
            </div>
          ) : (
            <div className="text-sm font-semibold text-accent">VS</div>
          )}
          {match.time && <div className="text-xs text-slate-500 mt-0.5">{match.time}</div>}
        </div>

        <div className="flex-1 min-w-0 flex justify-end">
          <TeamBadge name={match.team2} code={match.team2Code} />
        </div>
      </div>

      {match.venue && (
        <p className="text-xs text-slate-500 mt-3 truncate">{match.venue}</p>
      )}

      {(onPredict || showH2H) && (
        <div className="flex gap-2 mt-4">
          {showH2H && (
            <button
              type="button"
              className="btn-secondary flex-1 text-sm"
              onClick={() => showH2H(match)}
            >
              H2H History
            </button>
          )}
          {onPredict && isUpcoming && (
            <button
              type="button"
              className="btn-primary flex-1 text-sm"
              onClick={() => onPredict(match)}
            >
              Predict
            </button>
          )}
        </div>
      )}
    </div>
  );
}
