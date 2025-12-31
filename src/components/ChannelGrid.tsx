import { Channel, ViewMode } from '@/types/channel';
import { ChannelCard } from './ChannelCard';
import { ChannelSkeleton } from './ChannelSkeleton';
import { cn } from '@/lib/utils';
import { Tv, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface ChannelGridProps {
  channels: Channel[];
  isLoading: boolean;
  error: string | null;
  viewMode: ViewMode;
  onPlay: (channel: Channel) => void;
  onToggleFavorite: (id: string) => void;
  onToggleWatchlist: (id: string) => void;
  onRetry: () => void;
  focusedIndex?: number;
}

export function ChannelGrid({
  channels,
  isLoading,
  error,
  viewMode,
  onPlay,
  onToggleFavorite,
  onToggleWatchlist,
  onRetry,
  focusedIndex = -1,
}: ChannelGridProps) {
  const isTvMode = viewMode === 'tv';

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
            <Tv className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">Failed to Load Channels</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button variant="hero" onClick={onRetry}>
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-4 p-4",
        isTvMode
          ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      )}>
        {Array.from({ length: 12 }).map((_, i) => (
          <ChannelSkeleton key={i} isTvMode={isTvMode} />
        ))}
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Tv className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">No Channels Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search query
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-4 p-4",
      isTvMode
        ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    )}>
      {channels.map((channel, index) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          onPlay={onPlay}
          onToggleFavorite={onToggleFavorite}
          onToggleWatchlist={onToggleWatchlist}
          isTvMode={isTvMode}
          isFocused={focusedIndex === index}
        />
      ))}
    </div>
  );
}
