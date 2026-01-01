import { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import { Channel } from '@/types/channel';
import { X, ExternalLink, AlertTriangle, Play, Pause, Volume2, VolumeX, Maximize, RefreshCw, Minimize } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize HLS.js
  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    setHasError(false);
    setIsLoading(true);
    setIsHttpBlocked(
      window.location.protocol === 'https:' && channel.url.startsWith('http://')
    );

    if (isHttpBlocked) return;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsStream = channel.url.includes('.m3u8');

    if (isHlsStream && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setHasError(true);
              setIsLoading(false);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = channel.url;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(() => setIsPlaying(false));
      });
    } else {
      // Direct playback for non-HLS streams
      video.src = channel.url;
      video.addEventListener('loadeddata', () => {
        setIsLoading(false);
      });
      video.play().catch(() => setIsPlaying(false));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel, isHttpBlocked]);

  // Keyboard controls
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

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    container?.addEventListener('touchstart', handleMouseMove);

    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
      container?.removeEventListener('touchstart', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

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
    if (channel && videoRef.current) {
      setHasError(false);
      setIsLoading(true);
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const isHlsStream = channel.url.includes('.m3u8');
      if (isHlsStream && Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(channel.url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          videoRef.current?.play();
        });
      } else {
        videoRef.current.load();
        videoRef.current.play();
      }
    }
  };

  const openInNewTab = () => {
    if (channel) {
      window.open(channel.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!channel) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4">
      <div
        ref={containerRef}
        className={cn(
          "relative w-full bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-2xl",
          isFullscreen ? "max-w-none h-full" : "max-w-6xl aspect-video"
        )}
        onClick={() => setShowControls(true)}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-2 right-2 sm:top-4 sm:right-4 z-20 p-2 rounded-full bg-background/50 backdrop-blur-sm text-foreground hover:bg-background/80 transition-all",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Channel info overlay */}
        <div className={cn(
          "absolute top-2 left-2 sm:top-4 sm:left-4 z-20 glass-card px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-opacity",
          showControls ? "opacity-100" : "opacity-0"
        )}>
          <div className="flex items-center gap-2 sm:gap-3">
            {channel.logo && (
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain rounded"
              />
            )}
            <div>
              <h3 className="font-display font-semibold text-foreground text-sm sm:text-base">
                {channel.name}
              </h3>
              <p className="text-xs text-muted-foreground hidden sm:block">{channel.group}</p>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && !isHttpBlocked && !hasError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">Loading stream...</p>
            </div>
          </div>
        )}

        {/* HTTP blocked warning */}
        {isHttpBlocked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
            <div className="glass-card p-4 sm:p-8 text-center max-w-md mx-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">
                Insecure Stream Blocked
              </h3>
              <p className="text-muted-foreground mb-4 text-xs sm:text-sm">
                This stream uses insecure HTTP and is blocked on secure sites.
                Opening the stream in a new tab may work on some devices.
              </p>
              <Button variant="hero" size="sm" onClick={openInNewTab} className="w-full sm:w-auto">
                <ExternalLink className="w-4 h-4" />
                Open Stream in New Tab
              </Button>
            </div>
          </div>
        )}

        {/* Error state */}
        {hasError && !isHttpBlocked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
            <div className="glass-card p-4 sm:p-8 text-center max-w-md mx-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">
                Stream Error
              </h3>
              <p className="text-muted-foreground mb-4 text-xs sm:text-sm">
                Failed to load the stream. The channel may be temporarily unavailable.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <Button variant="neon" size="sm" onClick={handleRetry} className="w-full sm:w-auto">
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </Button>
                <Button variant="glass" size="sm" onClick={openInNewTab} className="w-full sm:w-auto">
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
            className="w-full h-full object-contain"
            playsInline
            autoPlay
            controls={false}
            onError={() => setHasError(true)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
          />
        )}

        {/* Custom controls */}
        {!isHttpBlocked && !hasError && (
          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity",
            showControls ? "opacity-100" : "opacity-0"
          )}>
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:text-primary hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
                ) : (
                  <Play className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:text-primary hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:text-primary hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Maximize className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
