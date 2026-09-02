import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Helmet } from 'react-helmet';
import { ArrowRight, Clapperboard, Menu, Play, Radio, X } from 'lucide-react';
import { ChannelGrid } from '@/components/ChannelGrid';
import { FilterBar } from '@/components/FilterBar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useChannels } from '@/hooks/useChannels';
import { Channel, ViewMode } from '@/types/channel';

const stats = [
  { icon: '●', target: 2000, suffix: '+', decimals: 0, label: 'Live Channels' },
  { icon: '◉', target: 24, suffix: '/7', decimals: 0, label: 'Always Streaming' },
  { icon: '▶', target: 4, suffix: 'K', decimals: 0, label: 'HD Ready' },
  { icon: '★', target: 15, suffix: '+', decimals: 0, label: 'Indian Languages' },
];
const links = ['Home', 'Live Channels', 'Categories', 'Watch Guide'];

export default function Index() {
  const {
    channels, allChannels, isLoading, error, checkProgress, showHidden, setShowHidden,
    toggleFavorite, toggleWatchlist, refetch, searchQuery, setSearchQuery,
    categoryFilter, setCategoryFilter, languageFilter, setLanguageFilter, hdOnly,
    setHdOnly, filterType, setFilterType, categories, languages,
  } = useChannels();
  const [menuOpen, setMenuOpen] = useState(false);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const statsRef = useRef<HTMLElement>(null);
  const channelsRef = useRef<HTMLElement>(null);

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

  const browseChannels = () => channelsRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <Helmet><title>IndiaLive | Watch Indian Live TV</title><meta name="description" content="Watch Indian live TV channels online for free. Discover news, sports, entertainment and regional channels in one place." /></Helmet>
      <div className="site">
        <section className="landing">
          <video className="bg-video" autoPlay muted loop playsInline aria-hidden="true">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4" type="video/mp4" />
          </video>
          <div className="bg" aria-hidden="true" />
          <div className="page">
            <header className="header">
              <a className="logo" href="/" aria-label="IndiaLive home"><img src="/indialive-logo.svg" alt="" width="52" height="52" /></a>
              <nav className="nav-pill" aria-label="Primary navigation">
                {links.map((link, index) => <a className={index === 0 ? 'active' : ''} href={index === 0 ? '/' : '#channels'} key={link}>{link}</a>)}
              </nav>
              <a className="sign-in" href="#channels">Watch now</a>
              <button className={`burger ${menuOpen ? 'open' : ''}`} aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
            </header>
            {menuOpen && <button className="overlay" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
            {menuOpen && <nav className="mobile-menu" aria-label="Mobile navigation">{links.map((link, index) => <a className={index === 0 ? 'active' : ''} href={index === 0 ? '/' : '#channels'} onClick={() => setMenuOpen(false)} key={link}>{link}</a>)}<a className="mobile-sign-in" href="#channels" onClick={() => setMenuOpen(false)}>Watch now</a></nav>}
            <main className="hero">
              <div className="trust anim"><div className="avatars"><span><Radio /></span><span><Clapperboard /></span><span><Play /></span></div><div className="trust-pill">India's live TV, all in one place</div></div>
              <h1 className="headline"><span>Live TV</span><span>From India To You</span></h1>
              <p className="subhead anim">Stream news, sports, movies and entertainment live. Find your favorite Indian channels and start watching instantly.</p>
              <a className="cta anim" href="#channels" onClick={browseChannels}>Browse Live Channels <ArrowRight aria-hidden="true" /></a>
            </main>
            <footer className="stats" ref={statsRef}>{stats.map((stat, index) => <div className="stat anim" style={{ '--d': `${0.5 + index * 0.08}s` } as CSSProperties} key={stat.label}><span className="stat-icon">{stat.icon}</span><div><strong>{counts[index].toFixed(stat.decimals)}<small>{stat.suffix}</small></strong><span>{stat.label}</span></div></div>)}</footer>
          </div>
        </section>

        <section className="channels-section" id="channels" ref={channelsRef}>
          <div className="channels-heading"><div><p className="eyebrow">Live now</p><h2>Choose a channel and start watching</h2></div><p>Fresh streams, familiar faces, and regional favorites in one easy-to-browse lineup.</p></div>
          <FilterBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} languageFilter={languageFilter} setLanguageFilter={setLanguageFilter} hdOnly={hdOnly} setHdOnly={setHdOnly} filterType={filterType} setFilterType={setFilterType} viewMode={viewMode} setViewMode={setViewMode} showHidden={showHidden} setShowHidden={setShowHidden} categories={categories} languages={languages} totalChannels={allChannels.length} visibleChannels={channels.length} checkProgress={checkProgress} />
          <ChannelGrid channels={channels} isLoading={isLoading} error={error} viewMode={viewMode} onPlay={setSelectedChannel} onToggleFavorite={toggleFavorite} onToggleWatchlist={toggleWatchlist} onRetry={refetch} />
        </section>
        <VideoPlayer channel={selectedChannel} onClose={() => setSelectedChannel(null)} />
      </div>
    </>
  );
}
