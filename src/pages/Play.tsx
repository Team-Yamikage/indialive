import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Hls from 'hls.js';
import { Helmet } from 'react-helmet';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Tv,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChannels } from '@/hooks/useChannels';
import { Channel } from '@/types/channel';

export default function PlayPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  
  const {
    allChannels,
    toggleFavorite,
    toggleWatchlist,
  } = useChannels();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isHttpBlocked, setIsHttpBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Find current channel
  const channel = allChannels.find(c => c.id === channelId);
  
  // Get working channels for navigation
  const workingChannels = allChannels.filter(c => c.isWorking);
  const currentIndex = workingChannels.findIndex(c => c.id === channelId);
  const prevChannel = currentIndex > 0 ? workingChannels[currentIndex - 1] : null;
  const nextChannel = currentIndex < workingChannels.length - 1 ? workingChannels[currentIndex + 1] : null;

  // Initialize HLS.js
  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    setHasError(false);
    setIsLoading(true);
    setIsHttpBlocked(
      window.location.protocol === 'https:' && channel.url.startsWith('http://')
    );

    if (window.location.protocol === 'https:' && channel.url.startsWith('http://')) {
      return;
    }

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
      video.src = channel.url;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(() => setIsPlaying(false));
      });
    } else {
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
  }, [channel]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          } else {
            navigate('/');
          }
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'ArrowLeft':
          if (prevChannel) navigate(`/play/${prevChannel.id}`);
          break;
        case 'ArrowRight':
          if (nextChannel) navigate(`/play/${nextChannel.id}`);
          break;
        case 's':
          setShowSidebar(prev => !prev);
          break;
      }
      setShowControls(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, prevChannel, nextChannel, isFullscreen]);

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying && !showSidebar) setShowControls(false);
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
  }, [isPlaying, showSidebar]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

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

  if (!channel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card p-6 sm:p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Tv className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl font-semibold mb-2">Channel Not Found</h2>
          <p className="text-muted-foreground mb-6">The channel you're looking for doesn't exist or is unavailable.</p>
          <Button variant="hero" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
            Back to Channels
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{channel.name} - Live TV | IPTV Stream</title>
        <meta name="description" content={`Watch ${channel.name} live stream. ${channel.group || ''} ${channel.language || ''}`} />
      </Helmet>

      <div 
        ref={containerRef}
        className="min-h-screen bg-black flex"
        onClick={() => setShowControls(true)}
      >
        {/* Main Video Area */}
        <div className="flex-1 relative">
          {/* Back Button - Top Left */}
          <Link
            to="/"
            className={cn(
              "absolute top-3 left-3 sm:top-6 sm:left-6 z-30 p-2 sm:p-3 rounded-full bg-background/30 backdrop-blur-md text-foreground hover:bg-background/50 transition-all",
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>

          {/* Channel Info - Top Center */}
          <div className={cn(
            "absolute top-3 left-1/2 -translate-x-1/2 sm:top-6 z-30 glass-card px-3 py-2 sm:px-6 sm:py-3 rounded-xl transition-all",
            showControls ? "opacity-100" : "opacity-0"
          )}>
            <div className="flex items-center gap-2 sm:gap-4">
              {channel.logo && (
                <img
                  src={channel.logo}
                  alt={channel.name}
                  className="w-8 h-8 sm:w-12 sm:h-12 object-contain rounded-lg bg-secondary/50 p-1"
                />
              )}
              <div className="text-center sm:text-left">
                <h1 className="font-display font-bold text-sm sm:text-xl text-foreground">
                  {channel.name}
                </h1>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  {channel.group && (
                    <span className="text-[10px] sm:text-xs text-muted-foreground">{channel.group}</span>
                  )}
                  {channel.isHD && (
                    <span className="px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold bg-primary/20 text-primary rounded border border-primary/30">
                      HD
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Top Right */}
          <div className={cn(
            "absolute top-3 right-3 sm:top-6 sm:right-6 z-30 flex items-center gap-2 transition-all",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <button
              onClick={() => toggleFavorite(channel.id)}
              className={cn(
                "p-2 sm:p-3 rounded-full backdrop-blur-md transition-all",
                channel.isFavorite
                  ? "bg-yellow-500/20 text-yellow-500"
                  : "bg-background/30 text-foreground hover:bg-background/50"
              )}
            >
              <Star className="w-4 h-4 sm:w-5 sm:h-5" fill={channel.isFavorite ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => toggleWatchlist(channel.id)}
              className={cn(
                "p-2 sm:p-3 rounded-full backdrop-blur-md transition-all",
                channel.isInWatchlist
                  ? "bg-primary/20 text-primary"
                  : "bg-background/30 text-foreground hover:bg-background/50"
              )}
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" fill={channel.isInWatchlist ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 sm:p-3 rounded-full bg-background/30 backdrop-blur-md text-foreground hover:bg-background/50 transition-all hidden sm:block"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Loading State */}
          {isLoading && !isHttpBlocked && !hasError && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground text-sm">Loading stream...</p>
              </div>
            </div>
          )}

          {/* HTTP Blocked Warning */}
          {isHttpBlocked && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
              <div className="glass-card p-6 sm:p-10 text-center max-w-lg">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold mb-3">
                  Insecure Stream Blocked
                </h3>
                <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                  This stream uses insecure HTTP and is blocked on secure sites.
                  Opening the stream in a new tab may work on some devices.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="hero" onClick={openInNewTab} className="w-full sm:w-auto">
                    <ExternalLink className="w-4 h-4" />
                    Open Stream in New Tab
                  </Button>
                  <Button variant="glass" onClick={() => navigate('/')} className="w-full sm:w-auto">
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && !isHttpBlocked && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
              <div className="glass-card p-6 sm:p-10 text-center max-w-lg">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-destructive" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold mb-3">
                  Stream Error
                </h3>
                <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                  Failed to load the stream. The channel may be temporarily unavailable.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="neon" onClick={handleRetry} className="w-full sm:w-auto">
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </Button>
                  <Button variant="glass" onClick={openInNewTab} className="w-full sm:w-auto">
                    <ExternalLink className="w-4 h-4" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Video Element */}
          {!isHttpBlocked && (
            <video
              ref={videoRef}
              className="w-full h-screen object-contain bg-black"
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

          {/* Channel Navigation - Side Arrows */}
          {prevChannel && (
            <Link
              to={`/play/${prevChannel.id}`}
              className={cn(
                "absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-4 rounded-full bg-background/30 backdrop-blur-md text-foreground hover:bg-background/50 transition-all group",
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform" />
            </Link>
          )}
          {nextChannel && (
            <Link
              to={`/play/${nextChannel.id}`}
              className={cn(
                "absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-4 rounded-full bg-background/30 backdrop-blur-md text-foreground hover:bg-background/50 transition-all group",
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform" />
            </Link>
          )}

          {/* Bottom Controls */}
          {!isHttpBlocked && !hasError && (
            <div className={cn(
              "absolute bottom-0 left-0 right-0 p-4 sm:p-8 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity",
              showControls ? "opacity-100" : "opacity-0"
            )}>
              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-3 sm:gap-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" />
                  ) : (
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-1" fill="currentColor" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
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
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <Maximize className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </Button>
              </div>

              {/* Keyboard Hints */}
              <div className="hidden sm:flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground/60">
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">Space</kbd> Play/Pause</span>
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">M</kbd> Mute</span>
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">F</kbd> Fullscreen</span>
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">←</kbd><kbd className="px-1.5 py-0.5 bg-white/10 rounded ml-1">→</kbd> Switch Channel</span>
                <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">Esc</kbd> Exit</span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Channel List */}
        <div className={cn(
          "fixed sm:relative right-0 top-0 h-screen w-72 sm:w-80 bg-background/95 backdrop-blur-xl border-l border-border z-40 transition-transform duration-300",
          showSidebar ? "translate-x-0" : "translate-x-full sm:hidden"
        )}>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">Channels</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 hover:bg-secondary rounded-lg sm:hidden"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-64px)] scrollbar-hide">
            {workingChannels.slice(0, 50).map((ch) => (
              <Link
                key={ch.id}
                to={`/play/${ch.id}`}
                className={cn(
                  "flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors border-b border-border/50",
                  ch.id === channelId && "bg-primary/10 border-l-2 border-l-primary"
                )}
                onClick={() => setShowSidebar(false)}
              >
                {ch.logo ? (
                  <img src={ch.logo} alt={ch.name} className="w-10 h-10 object-contain rounded bg-secondary/50 p-1" />
                ) : (
                  <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center text-muted-foreground font-bold">
                    {ch.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{ch.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{ch.group}</p>
                </div>
                {ch.isHD && (
                  <span className="px-1.5 py-0.5 text-[8px] font-bold bg-primary/20 text-primary rounded">HD</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
