import { useState, useRef, useEffect } from 'react';
import { Channel } from '@/types/channel';
import { X, ExternalLink, AlertTriangle, Play, Pause, Volume2, VolumeX, Maximize, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  channel: Channel | null;
  onClose: () => void;
}

export function VideoPlayer({ channel, onClose }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isHttpBlocked, setIsHttpBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (channel) {
      setHasError(false);
      setIsHttpBlocked(
        window.location.protocol === 'https:' && channel.url.startsWith('http://')
      );
    }
  }, [channel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === 'm') toggleMute();
      if (e.key === 'f') toggleFullscreen();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleRetry = () => {
    if (videoRef.current) {
      setHasError(false);
      videoRef.current.load();
      videoRef.current.play();
    }
  };

  const openInNewTab = () => {
    if (channel) {
      window.open(channel.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!channel) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-background/50 backdrop-blur-sm text-foreground hover:bg-background/80 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Channel info overlay */}
        <div className="absolute top-4 left-4 z-20 glass-card px-4 py-2 rounded-lg">
          <div className="flex items-center gap-3">
            {channel.logo && (
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-8 h-8 object-contain rounded"
              />
            )}
            <div>
              <h3 className="font-display font-semibold text-foreground">
                {channel.name}
              </h3>
              <p className="text-xs text-muted-foreground">{channel.group}</p>
            </div>
          </div>
        </div>

        {/* HTTP blocked warning */}
        {isHttpBlocked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="glass-card p-8 text-center max-w-md mx-4">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                Insecure Stream Blocked
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                This stream uses insecure HTTP and is blocked on secure sites.
                Opening the stream in a new tab may work on some devices.
              </p>
              <Button variant="hero" onClick={openInNewTab}>
                <ExternalLink className="w-4 h-4" />
                Open Stream in New Tab
              </Button>
            </div>
          </div>
        )}

        {/* Error state */}
        {hasError && !isHttpBlocked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="glass-card p-8 text-center max-w-md mx-4">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                Stream Error
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Failed to load the stream. The channel may be temporarily unavailable.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="neon" onClick={handleRetry}>
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </Button>
                <Button variant="glass" onClick={openInNewTab}>
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Video element */}
        {!isHttpBlocked && (
          <video
            ref={videoRef}
            src={channel.url}
            className="w-full h-full object-contain"
            autoPlay
            controls={false}
            onError={() => setHasError(true)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}

        {/* Custom controls */}
        {!isHttpBlocked && !hasError && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:text-primary hover:bg-white/10"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" fill="currentColor" />
                ) : (
                  <Play className="w-6 h-6" fill="currentColor" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:text-primary hover:bg-white/10"
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:text-primary hover:bg-white/10"
              >
                <Maximize className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
