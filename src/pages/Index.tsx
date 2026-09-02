import { useState, useRef, useEffect, useCallback } from 'react';
import { Hero } from '@/components/Hero';
import { FilterBar } from '@/components/FilterBar';
import { ChannelGrid } from '@/components/ChannelGrid';
import { VideoPlayer } from '@/components/VideoPlayer';
import { TvModeHint } from '@/components/TvModeHint';
import { Footer } from '@/components/Footer';
import { useChannels } from '@/hooks/useChannels';
import { Channel, ViewMode } from '@/types/channel';
import { Helmet } from 'react-helmet';
import { ArrowRight, Clapperboard, PlayCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const {
    channels,
    allChannels,
    isLoading,
    error,
    checkProgress,
    showHidden,
    setShowHidden,
    toggleFavorite,
    toggleWatchlist,
    refetch,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    languageFilter,
    setLanguageFilter,
    hdOnly,
    setHdOnly,
    filterType,
    setFilterType,
    categories,
    languages,
  } = useChannels();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const channelSectionRef = useRef<HTMLDivElement>(null);
  const spotlightChannels = channels.slice(0, 4);

  const scrollToChannels = useCallback(() => {
    channelSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleTvMode = useCallback(() => {
    setViewMode('tv');
    setFocusedIndex(0);
    scrollToChannels();
  }, [scrollToChannels]);

  const handlePlay = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
  }, []);

  useEffect(() => {
    if (viewMode !== 'tv') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const cols = window.innerWidth >= 1024 ? 4 : window.innerWidth >= 768 ? 3 : 2;
      const maxIndex = channels.length - 1;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(prev + 1, maxIndex));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(prev + cols, maxIndex));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - cols, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < channels.length) {
            handlePlay(channels[focusedIndex]);
          }
          break;
        case 'Escape':
          setViewMode('grid');
          setFocusedIndex(-1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, channels, focusedIndex, handlePlay]);

  const featureCards = [
    { icon: PlayCircle, title: 'Instant playback', description: 'Jump straight into live programming with a clean, low-friction experience.' },
    { icon: ShieldCheck, title: 'Reliable discovery', description: 'Curated channels, HD tags, and favorites make the right stream easy to find.' },
    { icon: Clapperboard, title: 'Regional coverage', description: 'From Hindi to Malayalam, follow the channels you care about without sorting noise.' },
  ];

  return (
    <>
      <Helmet>
        <title>Intelligence Designed To Evolve</title>
        <meta name="description" content="Stream Indian live TV channels for free. Discover Hindi, Tamil, Telugu, Malayalam, and regional broadcasts in a premium streaming experience." />
        <meta name="keywords" content="Indian TV, IPTV, live streaming, Hindi channels, Tamil TV, Telugu TV, free TV, live TV India" />
        <link rel="canonical" href="/" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <Hero
          onBrowse={scrollToChannels}
          onTvMode={handleTvMode}
          onFilterChange={setFilterType}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        <section id="features" className="relative -mt-8 pb-14">
          <div className="container mx-auto px-4">
            <div className="grid gap-4 md:grid-cols-3">
              {featureCards.map(({ icon: Icon, title, description }) => (
                <div key={title} className="glass-panel p-6">
                  <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="explore" className="container mx-auto px-4 pb-12">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-primary">Trending now</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Popular live picks</h2>
            </div>
            <Button variant="ghost" onClick={scrollToChannels} className="hidden sm:inline-flex text-slate-200">
              Explore all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {spotlightChannels.map((channel, index) => (
              <button
                key={channel.id || index}
                onClick={() => handlePlay(channel)}
                className="glass-panel group overflow-hidden p-4 text-left transition hover:-translate-y-1 hover:border-primary/50"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-black text-primary">
                    {channel.name.substring(0, 1)}
                  </div>
                  {channel.isHD && (
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
                      HD
                    </span>
                  )}
                </div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{channel.name}</h3>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{channel.language || 'Regional'}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary group-hover:bg-primary/15">
                    <PlayCircle className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    {channel.isWorking ? 'Live now' : 'Checking'}
                  </span>
                  <span>{channel.group || 'General'}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section ref={channelSectionRef} id="channels" className="min-h-screen pb-10">
          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            languageFilter={languageFilter}
            setLanguageFilter={setLanguageFilter}
            hdOnly={hdOnly}
            setHdOnly={setHdOnly}
            filterType={filterType}
            setFilterType={setFilterType}
            viewMode={viewMode}
            setViewMode={setViewMode}
            showHidden={showHidden}
            setShowHidden={setShowHidden}
            categories={categories}
            languages={languages}
            totalChannels={allChannels.length}
            visibleChannels={channels.length}
            checkProgress={checkProgress}
          />

          <div className="container mx-auto">
            <ChannelGrid
              channels={channels}
              isLoading={isLoading}
              error={error}
              viewMode={viewMode}
              onPlay={handlePlay}
              onToggleFavorite={toggleFavorite}
              onToggleWatchlist={toggleWatchlist}
              onRetry={refetch}
              focusedIndex={focusedIndex}
            />
          </div>
        </section>

        <Footer />

        <VideoPlayer
          channel={selectedChannel}
          onClose={() => setSelectedChannel(null)}
        />

        <TvModeHint isVisible={viewMode === 'tv' && !selectedChannel} />
      </div>
    </>
  );
};

export default Index;
