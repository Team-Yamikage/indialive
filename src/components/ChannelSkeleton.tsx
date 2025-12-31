import { cn } from '@/lib/utils';

interface ChannelSkeletonProps {
  isTvMode?: boolean;
}

export function ChannelSkeleton({ isTvMode = false }: ChannelSkeletonProps) {
  return (
    <div className={cn(
      "glass-card overflow-hidden",
      isTvMode ? "p-6" : "p-4"
    )}>
      {/* Logo skeleton */}
      <div className={cn(
        "shimmer rounded-lg mb-4",
        isTvMode ? "h-32" : "h-24"
      )} />
      
      {/* Title skeleton */}
      <div className="shimmer h-5 w-3/4 rounded mb-3" />
      
      {/* Tags skeleton */}
      <div className="flex gap-2 mb-3">
        <div className="shimmer h-5 w-16 rounded" />
        <div className="shimmer h-5 w-12 rounded" />
      </div>
      
      {/* Actions skeleton */}
      <div className="flex gap-2">
        <div className="shimmer w-8 h-8 rounded-lg" />
        <div className="shimmer w-8 h-8 rounded-lg" />
      </div>
    </div>
  );
}
