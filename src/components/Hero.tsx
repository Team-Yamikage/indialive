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
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-purple/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/10 to-transparent rounded-full" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8 animate-fade-in">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">Live Streaming</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-slide-up">
          <span className="text-foreground">Watch Indian</span>
          <br />
          <span className="bg-clip-text text-transparent bg-neon-gradient neon-text">
            Live TV
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Fast, Simple, Free
        </p>
        <p className="text-sm text-muted-foreground/70 max-w-xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Automatically curated from the IPTV-Org community playlists
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Button
            variant="hero"
            size="xl"
            onClick={onBrowse}
            className="group"
          >
            <Tv className="w-5 h-5 group-hover:animate-pulse" />
            Browse Channels
          </Button>
          
          <Button
            variant="neon"
            size="xl"
            onClick={() => {
              setViewMode('tv');
              onTvMode();
            }}
          >
            <span className="font-mono">📺</span>
            TV Mode
          </Button>
        </div>

        {/* Quick filters */}
        <div className="flex items-center justify-center gap-3 mt-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <Button
            variant="glass"
            size="sm"
            onClick={() => onFilterChange('favorites')}
          >
            <Star className="w-4 h-4 text-yellow-500" />
            Favorites
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={() => onFilterChange('watchlist')}
          >
            <Clock className="w-4 h-4 text-primary" />
            Watchlist
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <ChevronDown className="w-8 h-8 text-muted-foreground/50" />
        </div>
      </div>
    </section>
  );
}
