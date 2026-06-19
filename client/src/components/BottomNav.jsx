const NAV = [
  { id: 'dashboard', label: 'Home', icon: '⌂' },
  { id: 'matches', label: 'Matches', icon: '⚽' },
  { id: 'predict', label: 'Predict', icon: '◎' },
  { id: 'history', label: 'History', icon: '◷' },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-card border-t border-surface-border md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] rounded-lg transition-colors ${
              active === item.id ? 'text-accent' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export { NAV };
