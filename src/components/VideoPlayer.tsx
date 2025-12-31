import { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import { Channel } from '@/types/channel';
import { X, Volume2, VolumeX, Maximize, RefreshCw, Shield, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { getProxyUrl, isHttpStream } from '@/utils/streamProxy';

interface VideoPlayerProps {
  channel: Channel | null;
  onClose: () => void;
}

type PlaybackMode = 'direct' | 'proxy' | 'failed';

export function VideoPlayer({ channel, onClose }: VideoPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('direct');
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitchingToProxy, setIsSwitchingToProxy] = useState(false);
  const [forceProxy, setForceProxy] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const cleanupHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  const loadStream = useCallback((url: string, mode: PlaybackMode) => {
    if (!videoRef.current) return;
    
    cleanupHls();
    setIsLoading(true);
    setPlaybackMode(mode);
    
    const video = videoRef.current;
    const streamUrl = mode === 'proxy' ? getProxyUrl(url) : url;
    
    console.log(`Loading stream in ${mode} mode:`, streamUrl);

    // Check if it's an HLS stream
    const isHls = url.includes('.m3u8');
    
    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        startFragPrefetch: true,
        testBandwidth: true,
        progressive: true,
        // Retry configuration
        fragLoadingMaxRetry: 6,
        manifestLoadingMaxRetry: 6,
        levelLoadingMaxRetry: 6,
        fragLoadingRetryDelay: 1000,
        manifestLoadingRetryDelay: 1000,
      });
      
      hlsRef.current = hls;
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed successfully');
        setIsLoading(false);
        setIsSwitchingToProxy(false);
        setErrorCount(0);
        video.play().catch(console.error);
      });
      
      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error('HLS error:', data);
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try to recover or switch to proxy
              if (mode === 'direct' && !forceProxy) {
                console.log('Network error on direct stream, switching to proxy...');
                setIsSwitchingToProxy(true);
                retryTimeoutRef.current = setTimeout(() => {
                  loadStream(url, 'proxy');
                }, 500);
              } else {
                setErrorCount(prev => prev + 1);
                if (errorCount < 3) {
                  hls.startLoad();
                } else {
                  setPlaybackMode('failed');
                  setIsLoading(false);
                  setIsSwitchingToProxy(false);
                }
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, attempting recovery...');
              hls.recoverMediaError();
              break;
            default:
              if (mode === 'direct') {
                setIsSwitchingToProxy(true);
                retryTimeoutRef.current = setTimeout(() => {
                  loadStream(url, 'proxy');
                }, 500);
              } else {
                setPlaybackMode('failed');
                setIsLoading(false);
                setIsSwitchingToProxy(false);
              }
              break;
          }
        }
      });
      
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        setIsSwitchingToProxy(false);
        video.play().catch(console.error);
      }, { once: true });
      
      video.addEventListener('error', () => {
        if (mode === 'direct' && !forceProxy) {
          setIsSwitchingToProxy(true);
          retryTimeoutRef.current = setTimeout(() => {
            loadStream(url, 'proxy');
          }, 500);
        } else {
          setPlaybackMode('failed');
          setIsLoading(false);
          setIsSwitchingToProxy(false);
        }
      }, { once: true });
      
    } else {
      // Direct video playback
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        setIsSwitchingToProxy(false);
        video.play().catch(console.error);
      }, { once: true });
      
      video.addEventListener('error', () => {
        if (mode === 'direct' && !forceProxy) {
          setIsSwitchingToProxy(true);
          retryTimeoutRef.current = setTimeout(() => {
            loadStream(url, 'proxy');
          }, 500);
        } else {
          setPlaybackMode('failed');
          setIsLoading(false);
          setIsSwitchingToProxy(false);
        }
      }, { once: true });
    }
  }, [cleanupHls, forceProxy, errorCount]);

  // Initialize playback when channel changes
  useEffect(() => {
    if (!channel) return;
    
    setErrorCount(0);
    setPlaybackMode('direct');
    setIsSwitchingToProxy(false);
    
    // Determine initial mode
    const needsProxy = forceProxy || (isHttpStream(channel.url) && window.location.protocol === 'https:');
    const initialMode = needsProxy ? 'proxy' : 'direct';
    
    if (needsProxy) {
      setIsSwitchingToProxy(true);
    }
    
    loadStream(channel.url, initialMode);
    
    return () => {
      cleanupHls();
    };
  }, [channel, forceProxy, loadStream, cleanupHls]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'm') toggleMute();
      if (e.key === 'f') toggleFullscreen();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
    if (!channel) return;
    setErrorCount(0);
    const mode = forceProxy ? 'proxy' : 'direct';
    loadStream(channel.url, mode);
  };

  const toggleForceProxy = () => {
    setForceProxy(prev => !prev);
  };

  if (!channel) return null;

  const showLoading = isLoading || isSwitchingToProxy;
  const showError = playbackMode === 'failed' && !showLoading;

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
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{channel.group}</span>
                {playbackMode === 'proxy' && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/20 text-primary rounded">
                    <Shield className="w-3 h-3" />
                    Secure
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading / Switching state */}
        {showLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
            <div className="glass-card p-8 text-center max-w-md mx-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {isSwitchingToProxy ? 'Switching to Secure Mode' : 'Loading Stream'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {isSwitchingToProxy 
                  ? 'The stream is insecure or blocked. Switching to secure playback mode…'
                  : 'Connecting to stream...'}
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {showError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
            <div className="glass-card p-8 text-center max-w-md mx-4">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                Stream Unavailable
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Unable to play this stream. It may be temporarily offline or the source is unavailable.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="hero" onClick={handleRetry}>
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Video element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          autoPlay
          playsInline
          controls={false}
        />

        {/* Custom controls */}
        {!showLoading && !showError && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Force proxy toggle */}
                <Button
                  variant={forceProxy ? 'default' : 'ghost'}
                  size="sm"
                  onClick={toggleForceProxy}
                  className={cn(
                    "text-foreground/80 hover:text-foreground",
                    forceProxy && "bg-primary/20 text-primary hover:bg-primary/30"
                  )}
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Secure Mode</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-foreground/80 hover:text-foreground hover:bg-foreground/10"
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
                  className="text-foreground/80 hover:text-foreground hover:bg-foreground/10"
                >
                  <Maximize className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
