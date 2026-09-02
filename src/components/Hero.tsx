import { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterType, ViewMode } from '@/types/channel';

interface HeroProps {
  onBrowse: () => void;
  onTvMode: () => void;
  onFilterChange: (filter: FilterType) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const stats = [
  { icon: '<', value: 120, suffix: 'ms', label: 'Inference Time', decimals: 0 },
  { icon: '%', value: 99.99, suffix: '%', label: 'Platform Uptime', decimals: 2 },
  { icon: '*', value: 24, suffix: '/7', label: 'Autonomous Runtime', decimals: 0 },
  { icon: '#', value: 2.4, suffix: 'M', label: 'Context Windows', decimals: 1 },
];

export function Hero({ onBrowse, onTvMode, setViewMode }: HeroProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const start = window.setTimeout(() => {
      const started = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - started) / 1500, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCounts(stats.map((stat) => stat.value * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 480);
    return () => window.clearTimeout(start);
  }, []);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  const openTv = () => {
    setViewMode('tv');
    onTvMode();
  };

  return (
    <section className="hero-viewport relative isolate overflow-hidden bg-black text-white">
      <video className="hero-video" autoPlay muted loop playsInline aria-hidden="true">
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4" type="video/mp4" />
      </video>
      <div className="hero-scrim" />
      <div className="hero-page">
        <header className="hero-header">
          <a href="/" className="hero-logo" aria-label="Indialive home"><img src="/indialive-logo.svg" alt="" width="52" height="52" /></a>
          <nav className="hero-nav" aria-label="Primary navigation">
            {['Home', 'Product', 'Case Studies', 'Contact'].map((item, index) => <a key={item} className={index === 0 ? 'active' : ''} href={index === 0 ? '/' : `#${item.toLowerCase().replace(' ', '-')}`}>{item}</a>)}
          </nav>
          <Button variant="default" className="hero-signin">Sign in</Button>
          <button className={`hero-burger ${menuOpen ? 'open' : ''}`} aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X /> : <Menu />}</button>
        </header>

        {menuOpen && <div className="hero-overlay" onClick={() => setMenuOpen(false)} />}
        {menuOpen && <nav className="hero-mobile-menu" aria-label="Mobile navigation">{['Home', 'Product', 'Case Studies', 'Contact'].map((item) => <a key={item} href={item === 'Home' ? '/' : `#${item.toLowerCase().replace(' ', '-')}`} onClick={() => setMenuOpen(false)}>{item}</a>)}<Button variant="default" className="hero-signin">Sign in</Button></nav>}

        <main className="hero-content">
          <div className="hero-trust anim"><div className="hero-avatars"><span><i className="fa-brands fa-microsoft" /></span><span><i className="fa-brands fa-amazon" /></span><span><i className="fa-brands fa-google" /></span></div><div className="hero-trust-pill">Trusted by 2000+ Enterprises</div></div>
          <h1 className="hero-headline"><span>Intelligence</span><span>Designed To Evolve</span></h1>
          <p className="hero-subhead anim">Build applications that reason, adapt and collaborate using a modular AI platform designed for production.</p>
          <Button variant="default" className="hero-cta anim" onClick={onBrowse}>Get Started <ArrowRight className="h-4 w-4" /></Button>
        </main>

        <footer className="hero-stats">{stats.map((stat, index) => <div className="hero-stat anim" style={{ '--d': `${0.5 + index * 0.08}s` } as React.CSSProperties} key={stat.label}><span className="hero-stat-icon">{stat.icon}</span><div><strong>{counts[index].toFixed(stat.decimals)}<small>{stat.suffix}</small></strong><span>{stat.label}</span></div></div>)}</footer>
      </div>
    </section>
  );
}
