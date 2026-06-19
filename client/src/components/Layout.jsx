import { NAV } from './BottomNav';

export default function Layout({ active, onNavigate, children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-surface font-bold text-sm">
              WC
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">World Cup 2026</h1>
              <p className="text-[10px] text-slate-400 leading-tight">Predictions Platform</p>
            </div>
          </div>

          <nav className="hidden md:flex gap-1">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  active === item.id
                    ? 'bg-accent/15 text-accent'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
