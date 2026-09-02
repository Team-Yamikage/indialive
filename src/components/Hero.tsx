import { ArrowRight, Globe2, MonitorPlay, Star, Tv, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterType, ViewMode } from '@/types/channel';

interface HeroProps {
  onBrowse: () => void;
  onTvMode: () => void;
  onFilterChange: (filter: FilterType) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export function Hero({ onBrowse, onTvMode, onFilterChange, viewMode, setViewMode }: HeroProps) {
  const stats = [
    { value: '20+', label: 'languages' },
    { value: '4.9/5', label: 'viewer rating' },
    { value: '1.2K', label: 'live channels' },
  ];

  const quickPicks = [
    { name: 'Colors', accent: 'from-pink-500/50 to-orange-500/20' },
    { name: 'Sun TV', accent: 'from-cyan-500/50 to-blue-500/20' },
    { name: 'Zee', accent: 'from-yellow-500/50 to-orange-500/20' },
  ];

  return (
    <section className="relative isolate overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.18),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.18),transparent_26%),linear-gradient(135deg,#020817_0%,#0b1120_44%,#111827_100%)]" />
      <div className="hero-grid absolute inset-0 opacity-60" />
      <div className="absolute -left-20 top-24 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="absolute right-10 top-14 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 pb-12 pt-6 sm:pt-8 lg:pt-10">
        <header className="mb-10 flex items-center justify-between gap-4 rounded-full border border-white/10 bg-slate-950/40 px-4 py-3 shadow-[0_0_30px_rgba(14,165,233,0.08)] backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <img src="/indialive-logo.svg" alt="Indialive logo" className="h-9 w-9 rounded-full border border-white/10 bg-slate-950/60 object-cover" />
            <div>
              <div className="text-sm font-semibold tracking-[0.24em] text-slate-200 uppercase">Indialive</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#channels" className="transition hover:text-white">Channels</a>
            <a href="#explore" className="transition hover:text-white">Popular</a>
            <a href="#features" className="transition hover:text-white">Features</a>
          </nav>

          <Button variant="glass" size="sm" className="hidden sm:inline-flex">
            Start watching
          </Button>
        </header>

        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.9)]" />
              Live • Indian TV, always on
            </div>

            <h1 className="mb-5 text-4xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-5xl lg:text-7xl">
              Stream every
              <span className="text-gradient block">Indian story</span>
              in real time.
            </h1>

            <p className="max-w-xl text-base text-slate-300 sm:text-lg">
              Explore Hindi, Tamil, Telugu, Malayalam and regional channels with a premium streaming experience built for quick discovery and zero-friction viewing.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="hero"
                size="lg"
                onClick={onBrowse}
                className="group w-full sm:w-auto"
              >
                <Tv className="h-4 w-4 group-hover:animate-pulse" />
                Browse channels
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Button>

              <Button
                variant="neon"
                size="lg"
                onClick={() => {
                  setViewMode('tv');
                  onTvMode();
                }}
                className="w-full sm:w-auto"
              >
                <MonitorPlay className="h-4 w-4" />
                TV mode
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="glass" size="sm" onClick={() => onFilterChange('favorites')} className="text-xs sm:text-sm">
                <Star className="h-3.5 w-3.5 text-yellow-400" />
                Favorites
              </Button>
              <Button variant="glass" size="sm" onClick={() => onFilterChange('watchlist')} className="text-xs sm:text-sm">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                Watchlist
              </Button>
              <Button variant="glass" size="sm" onClick={() => onFilterChange('all')} className="text-xs sm:text-sm">
                <Globe2 className="h-3.5 w-3.5 text-violet-400" />
                All languages
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="glass-panel px-4 py-3">
                  <div className="text-2xl font-black tracking-tight text-white">{stat.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="glass-panel relative overflow-hidden p-4 shadow-[0_30px_80px_rgba(14,165,233,0.2)]">
              <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-300">
                <span>Now playing</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] text-rose-200">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  LIVE
                </span>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.25),transparent_30%),linear-gradient(135deg,#111827_0%,#0f172a_32%,#111827_100%)] p-5">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Featured</p>
                    <h2 className="mt-2 text-2xl font-black text-white">Colors</h2>
                  </div>
                  <div className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-200">HD</div>
                </div>

                <div className="relative mb-6 flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.25),transparent_48%)]" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-2xl font-black text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.7)]">
                    C
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {quickPicks.map((pick) => (
                    <div
                      key={pick.name}
                      className={`rounded-xl border border-white/10 bg-gradient-to-br ${pick.accent} p-3 text-sm font-medium text-slate-100`}
                    >
                      {pick.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
