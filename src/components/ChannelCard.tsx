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
        'group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300',
        isTvMode ? 'p-4 sm:p-6' : 'p-3 sm:p-4',
        isFocused && 'tv-focus scale-[1.02] z-50',
        !isTvMode && 'hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_15px_40px_rgba(54,43,32,0.12)] active:scale-[0.99] hover:z-50',
        !channel.isWorking && 'opacity-70'
      )}
      tabIndex={0}
      onClick={handlePlay}
      onKeyDown={(e) => e.key === 'Enter' && handlePlay()}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300',
          !isTvMode && 'group-hover:opacity-100',
          isFocused && 'opacity-100'
        )}
        style={{
          background: 'linear-gradient(135deg, rgba(239,131,84,0.10), rgba(39,104,98,0.08), transparent)',
        }}
      />

      <div className="absolute right-2 top-2 z-20 flex items-center gap-1.5 sm:right-3 sm:top-3">
        {channel.isHD && (
          <span className="rounded-md border border-cyan-400/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200">
            HD
          </span>
        )}
        {channel.isWorking ? (
          <span className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-200">
            <Wifi className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">Live</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-200">
            <WifiOff className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">Offline</span>
          </span>
        )}
      </div>

      <div
        className={cn(
          'relative mb-3 flex items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary',
          isTvMode ? 'h-24 sm:h-32' : 'h-16 sm:h-24'
        )}
      >
        {channel.logo && !imageError ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="h-full w-full object-contain p-2 sm:p-3"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <span className="text-2xl font-black text-primary sm:text-3xl">
              {channel.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-slate-900/55 opacity-0 transition-opacity duration-300',
            !isTvMode && 'group-hover:opacity-100',
            isFocused && 'opacity-100'
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_24px_rgba(239,131,84,0.45)] sm:h-14 sm:w-14">
            <Play className="ml-0.5 h-4 w-4 sm:h-6 sm:w-6" fill="currentColor" />
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <h3
          className={cn(
            'mb-2 truncate font-semibold text-slate-900',
            isTvMode ? 'text-base sm:text-xl' : 'text-sm sm:text-base'
          )}
        >
          {channel.name}
        </h3>

        <div className="mb-3 flex flex-wrap gap-1.5 sm:gap-2">
          {channel.group && (
            <span             className="max-w-[80px] truncate rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-slate-600 sm:max-w-none sm:text-xs">
              {channel.group}
            </span>
          )}
          {channel.language && (
            <span className="rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent sm:text-xs">
              {channel.language}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(channel.id);
            }}
            className={cn(
              'rounded-lg p-1.5 transition-all duration-200 touch-manipulation sm:p-2',
              channel.isFavorite
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-secondary text-slate-500 hover:bg-muted hover:text-slate-900'
            )}
            aria-label={channel.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill={channel.isFavorite ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(channel.id);
            }}
            className={cn(
              'rounded-lg p-1.5 transition-all duration-200 touch-manipulation sm:p-2',
              channel.isInWatchlist
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'bg-secondary text-slate-500 hover:bg-muted hover:text-slate-900'
            )}
            aria-label={channel.isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill={channel.isInWatchlist ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {!channel.isWorking && channel.url.startsWith('http://') && (
        <div className="absolute inset-x-0 bottom-0 border-t border-yellow-500/30 bg-yellow-500/10 p-2">
          <div className="flex items-center gap-2 text-[10px] text-yellow-200 sm:text-xs">
            <AlertTriangle className="h-3 w-3" />
            <span>HTTP stream may be blocked</span>
          </div>
        </div>
      )}
    </div>
  );
}
