import { teamInitials } from '../lib/api';

export default function TeamBadge({ name, code, size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className={`${sizes[size]} rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center font-bold text-accent shrink-0`}
      >
        {code || teamInitials(name)}
      </div>
      <span className="font-medium truncate">{name}</span>
    </div>
  );
}
