import { useState } from 'react';
import { Channel } from '@/types/channel';
import { Star, Clock, Play, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChannelCardProps {
  channel: Channel;
  onPlay: (channel: Channel) => void;
  onToggleFavorite: (id: string) => void;
  onToggleWatchlist: (id: string) => void;
  isTvMode?: boolean;
  isFocused?: boolean;
}

export function ChannelCard({
  channel,
  onPlay,
  onToggleFavorite,
  onToggleWatchlist,
  isTvMode = false,
  isFocused = false,
}: ChannelCardProps) {
  const [imageError, setImageError] = useState(false);

  const handlePlay = () => {
    onPlay(channel);
  };

  return (
    <div
      className={cn(
        "group relative glass-card overflow-hidden transition-all duration-300",
        isTvMode ? "p-6" : "p-4",
        isFocused && "tv-focus scale-105",
        !isTvMode && "hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20",
        !channel.isWorking && "opacity-60"
      )}
      tabIndex={0}
      onClick={handlePlay}
      onKeyDown={(e) => e.key === 'Enter' && handlePlay()}
    >
      {/* Glow effect on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none",
        "bg-gradient-to-t from-primary/20 to-transparent",
        !isTvMode && "group-hover:opacity-100",
        isFocused && "opacity-100"
      )} />

      {/* Status indicators */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        {channel.isHD && (
          <span className="px-2 py-0.5 text-xs font-bold bg-primary/20 text-primary rounded-md border border-primary/30">
            HD
          </span>
        )}
        {channel.isWorking ? (
          <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-md">
            <Wifi className="w-3 h-3" />
            Live
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-md">
            <WifiOff className="w-3 h-3" />
            Offline
          </span>
        )}
      </div>

      {/* Logo/Thumbnail */}
      <div className={cn(
        "relative mb-4 flex items-center justify-center overflow-hidden rounded-lg bg-secondary/50",
        isTvMode ? "h-32" : "h-24"
      )}>
        {channel.logo && !imageError ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-contain p-3"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-secondary to-muted">
            <span className="text-3xl font-display font-bold text-muted-foreground/50">
              {channel.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Play overlay */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity duration-300",
          !isTvMode && "group-hover:opacity-100",
          isFocused && "opacity-100"
        )}>
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/50">
            <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Channel info */}
      <div className="relative z-10">
        <h3 className={cn(
          "font-display font-semibold text-foreground truncate mb-2",
          isTvMode ? "text-xl" : "text-base"
        )}>
          {channel.name}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {channel.group && (
            <span className="px-2 py-0.5 text-xs bg-secondary text-muted-foreground rounded-md">
              {channel.group}
            </span>
          )}
          {channel.language && (
            <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-md">
              {channel.language}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(channel.id);
            }}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              channel.isFavorite
                ? "bg-yellow-500/20 text-yellow-500"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            aria-label={channel.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className="w-4 h-4" fill={channel.isFavorite ? "currentColor" : "none"} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(channel.id);
            }}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              channel.isInWatchlist
                ? "bg-primary/20 text-primary"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            aria-label={channel.isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Clock className="w-4 h-4" fill={channel.isInWatchlist ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* HTTP warning for broken streams */}
      {!channel.isWorking && channel.url.startsWith('http://') && (
        <div className="absolute inset-x-0 bottom-0 p-2 bg-yellow-500/20 border-t border-yellow-500/30">
          <div className="flex items-center gap-2 text-xs text-yellow-500">
            <AlertTriangle className="w-3 h-3" />
            <span>HTTP stream may be blocked</span>
          </div>
        </div>
      )}
    </div>
  );
}
