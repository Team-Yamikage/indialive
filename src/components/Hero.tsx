import { Button } from '@/components/ui/button';
import { Tv, Star, Clock, ChevronDown } from 'lucide-react';
import { FilterType, ViewMode } from '@/types/channel';

interface HeroProps {
  onBrowse: () => void;
  onTvMode: () => void;
  onFilterChange: (filter: FilterType) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export function Hero({ onBrowse, onTvMode, onFilterChange, viewMode, setViewMode }: HeroProps) {
  return (
    <section className="relative min-h-[60vh] sm:min-h-[70vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden pt-12 pb-16 sm:pt-0 sm:pb-0">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient" />
      
      {/* Animated gradient orbs - reduced on mobile */}
      <div className="absolute top-1/4 left-1/4 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-40 sm:w-60 lg:w-80 h-40 sm:h-60 lg:h-80 bg-neon-purple/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] lg:w-[600px] h-[300px] sm:h-[450px] lg:h-[600px] bg-gradient-radial from-primary/10 to-transparent rounded-full" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
        backgroundSize: '30px 30px sm:50px sm:50px'
      }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass-card px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs sm:text-sm text-muted-foreground">Live Streaming</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-3 sm:mb-6 animate-slide-up">
          <span className="text-foreground">Watch Indian</span>
          <br />
          <span className="bg-clip-text text-transparent bg-neon-gradient neon-text">
            Live TV
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-2 sm:mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Fast, Simple, Free
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground/70 max-w-xl mx-auto mb-6 sm:mb-10 animate-fade-in px-4" style={{ animationDelay: '0.3s' }}>
          Automatically curated from the IPTV-Org community playlists
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in px-4" style={{ animationDelay: '0.4s' }}>
          <Button
            variant="hero"
            size="lg"
            onClick={onBrowse}
            className="group w-full sm:w-auto"
          >
            <Tv className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-pulse" />
            Browse Channels
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
            <span className="font-mono text-sm sm:text-base">📺</span>
            TV Mode
          </Button>
        </div>

        {/* Quick filters */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <Button
            variant="glass"
            size="sm"
            onClick={() => onFilterChange('favorites')}
            className="text-xs sm:text-sm"
          >
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
            Favorites
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={() => onFilterChange('watchlist')}
            className="text-xs sm:text-sm"
          >
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            Watchlist
          </Button>
        </div>

        {/* Scroll indicator - hidden on mobile */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 animate-float hidden sm:block">
          <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/50" />
        </div>
      </div>
    </section>
  );
}
