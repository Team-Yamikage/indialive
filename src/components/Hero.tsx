import { ArrowRight, Globe2, Headphones, MonitorPlay, Play, Star, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterType, ViewMode } from '@/types/channel';

interface HeroProps {
  onBrowse: () => void;
  onTvMode: () => void;
  onFilterChange: (filter: FilterType) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export function Hero({ onBrowse, onTvMode, onFilterChange, setViewMode }: HeroProps) {
  const stats = [
    { value: '1,200+', label: 'channels' },
    { value: '20+', label: 'languages' },
    { value: '24/7', label: 'live coverage' },
  ];

  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(239,131,84,0.22),transparent_27%),radial-gradient(circle_at_88%_8%,rgba(39,104,98,0.16),transparent_26%),linear-gradient(120deg,#fffaf5_0%,#f5eee7_55%,#edf2ef_100%)]" />
      <div className="hero-grid absolute inset-0 opacity-60" />
      <div className="relative z-10 container mx-auto px-4 pb-16 pt-5 sm:pt-8 lg:pb-24">
        <header className="mb-16 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3" aria-label="Indialive home">
            <img src="/indialive-logo.svg" alt="" className="h-11 w-11 rounded-xl shadow-lg" />
            <div>
              <div className="font-display text-lg font-bold tracking-tight text-slate-900">indialive</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-slate-500">your world, live</div>
            </div>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#channels" className="transition hover:text-primary">Browse channels</a>
            <a href="#explore" className="transition hover:text-primary">Popular today</a>
            <a href="#features" className="transition hover:text-primary">Why Indialive</a>
          </nav>
          <Button variant="hero" size="sm" onClick={onBrowse}>Start watching <ArrowRight className="h-4 w-4" /></Button>
        </header>

        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> On air across India
            </div>
            <h1 className="mb-6 text-5xl font-bold leading-[0.95] tracking-[-0.065em] text-slate-900 sm:text-6xl lg:text-8xl">
              Stories that<br /><span className="text-gradient">feel like home.</span>
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Live news, cinema, sport and culture from every corner of India. Find your next channel, press play, and stay close to what matters.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button variant="hero" size="lg" onClick={onBrowse} className="group">
                <Tv className="h-4 w-4" /> Explore live TV <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => { setViewMode('tv'); onTvMode(); }}>
                <MonitorPlay className="h-4 w-4" /> Open TV mode
              </Button>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {stats.map((stat) => <div key={stat.label} className="border-l-2 border-primary/40 pl-3"><div className="font-display text-xl font-bold text-slate-900">{stat.value}</div><div className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">{stat.label}</div></div>)}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-5 rounded-[2rem] bg-primary/10 blur-2xl" />
            <div className="relative rotate-1 rounded-[1.6rem] border border-white bg-slate-900 p-3 shadow-2xl">
              <div className="flex items-center justify-between px-3 py-3 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400"><span>Featured signal</span><span className="flex items-center gap-1.5 text-rose-300"><i className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Live</span></div>
              <div className="relative flex aspect-[1.15] items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_42%,rgba(239,131,84,0.45),transparent_18%),linear-gradient(145deg,#35445a,#172131)]">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(120deg, transparent 35%, rgba(255,255,255,.35) 36%, transparent 37%)', backgroundSize: '22px 22px' }} />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#fff9f3] text-primary shadow-[0_0_50px_rgba(239,131,84,.65)]"><Play className="ml-1 h-8 w-8" fill="currentColor" /></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between"><div><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-300">Now playing</p><h2 className="mt-1 font-display text-2xl font-bold text-white">Colors HD</h2></div><span className="rounded-full bg-white/10 px-2 py-1 font-mono text-[9px] text-slate-200">HINDI</span></div>
              </div>
              <div className="grid grid-cols-3 gap-2 p-2 pt-3">{['News', 'Cinema', 'Sport'].map((item, i) => <button key={item} onClick={() => onFilterChange(i === 0 ? 'all' : 'watchlist')} className="rounded-lg bg-white/5 px-2 py-3 text-left text-xs font-medium text-slate-300 transition hover:bg-primary hover:text-white"><span className="mb-2 block text-primary/80">{i === 0 ? <Globe2 className="h-4 w-4" /> : i === 1 ? <Headphones className="h-4 w-4" /> : <Star className="h-4 w-4" />}</span>{item}</button>)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
