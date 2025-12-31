import { useState, useRef, useEffect, useCallback } from 'react';
import { Hero } from '@/components/Hero';
import { FilterBar } from '@/components/FilterBar';
import { ChannelGrid } from '@/components/ChannelGrid';
import { VideoPlayer } from '@/components/VideoPlayer';
import { TvModeHint } from '@/components/TvModeHint';
import { Footer } from '@/components/Footer';
import { useChannels } from '@/hooks/useChannels';
import { Channel, ViewMode } from '@/types/channel';

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

  // TV Mode keyboard navigation
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

  return (
    <>
      <title>Watch Indian Live TV - Fast, Simple, Free | IPTV Stream</title>
      <meta name="description" content="Stream Indian live TV channels for free. Watch Hindi, Tamil, Telugu, Malayalam, and regional channels. Fast, simple, and completely free IPTV streaming." />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <Hero
          onBrowse={scrollToChannels}
          onTvMode={handleTvMode}
          onFilterChange={setFilterType}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Channel Section */}
        <section ref={channelSectionRef} className="min-h-screen">
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

        {/* Footer */}
        <Footer />

        {/* Video Player Modal */}
        <VideoPlayer
          channel={selectedChannel}
          onClose={() => setSelectedChannel(null)}
        />

        {/* TV Mode Navigation Hint */}
        <TvModeHint isVisible={viewMode === 'tv' && !selectedChannel} />
      </div>
    </>
  );
};

export default Index;
