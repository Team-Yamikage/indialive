import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';

const stats = [
  { icon: '<', target: 120, suffix: 'ms', decimals: 0, label: 'Inference Time' },
  { icon: '%', target: 99.99, suffix: '%', decimals: 2, label: 'Platform Uptime' },
  { icon: '*', target: 24, suffix: '/7', decimals: 0, label: 'Autonomous Runtime' },
  { icon: '#', target: 2.4, suffix: 'M', decimals: 1, label: 'Context Windows' },
];

const links = ['Home', 'Product', 'Case Studies', 'Contact'];

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const statsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const started = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - started) / 1500, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCounts(stats.map((stat) => stat.target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.25 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && close();
    window.addEventListener('resize', close);
    window.addEventListener('keydown', onKeyDown);
    document.body.classList.toggle('menu-open', menuOpen);
    return () => {
      window.removeEventListener('resize', close);
      window.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen]);

  return (
    <>
      <Helmet><title>Intelligence Designed To Evolve</title></Helmet>
      <div className="landing">
        <video className="bg-video" autoPlay muted loop playsInline aria-hidden="true">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4" type="video/mp4" />
        </video>
        <div className="bg" aria-hidden="true" />
        <div className="page">
          <header className="header">
            <a className="logo" href="/" aria-label="Home"><img src="/indialive-logo.svg" alt="" width="52" height="52" /></a>
            <nav className="nav-pill" aria-label="Primary navigation">
              {links.map((link, index) => <a className={index === 0 ? 'active' : ''} href={index === 0 ? '/' : `#${link.toLowerCase().replace(' ', '-')}`} key={link}>{link}</a>)}
            </nav>
            <a className="sign-in" href="#sign-in">Sign in</a>
            <button className={`burger ${menuOpen ? 'open' : ''}`} aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              <span /><span /><span />
            </button>
          </header>

          {menuOpen && <button className="overlay" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
          {menuOpen && <nav className="mobile-menu" aria-label="Mobile navigation">
            {links.map((link, index) => <a className={index === 0 ? 'active' : ''} href={index === 0 ? '/' : `#${link.toLowerCase().replace(' ', '-')}`} onClick={() => setMenuOpen(false)} key={link}>{link}</a>)}
            <a className="mobile-sign-in" href="#sign-in" onClick={() => setMenuOpen(false)}>Sign in</a>
          </nav>}

          <main className="hero">
            <div className="trust anim"><div className="avatars"><span><i className="fa-brands fa-microsoft" /></span><span><i className="fa-brands fa-amazon" /></span><span><i className="fa-brands fa-google" /></span></div><div className="trust-pill">Trusted by 2000+ Enterprises</div></div>
            <h1 className="headline"><span>Intelligence</span><span>Designed To Evolve</span></h1>
            <p className="subhead anim">Build applications that reason, adapt and collaborate using a modular AI platform designed for production.</p>
            <a className="cta anim" href="#get-started">Get Started <span aria-hidden="true">→</span></a>
          </main>

          <footer className="stats" ref={statsRef}>
            {stats.map((stat, index) => <div className="stat anim" style={{ '--d': `${0.5 + index * 0.08}s` } as React.CSSProperties} key={stat.label}>
              <span className="stat-icon">{stat.icon}</span><div><strong>{counts[index].toFixed(stat.decimals)}<small>{stat.suffix}</small></strong><span>{stat.label}</span></div>
            </div>)}
          </footer>
        </div>
      </div>
    </>
  );
}
