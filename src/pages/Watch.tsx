import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Channel } from '@/types/channel';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useChannels } from '@/hooks/useChannels';
import { ArrowLeft, Calendar, Clock, Info, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EPGProgram {
  title: string;
  start: string;
  stop: string;
  description?: string;
  category?: string;
}

interface EPGData {
  channel: string;
  programs: EPGProgram[];
}

export function Watch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allChannels } = useChannels();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [epgData, setEpgData] = useState<EPGData | null>(null);
  const [isLoadingEpg, setIsLoadingEpg] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<EPGProgram | null>(null);
  const [nextProgram, setNextProgram] = useState<EPGProgram | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const foundChannel = allChannels.find(c => c.id === id);
    if (!foundChannel) {
      navigate('/');
      return;
    }

    setChannel(foundChannel);
    fetchEPG(foundChannel);
  }, [id, allChannels, navigate]);

  const fetchEPG = async (ch: Channel) => {
    setIsLoadingEpg(true);
    try {
      // Try to fetch EPG from iptv-org API
      const response = await fetch(`https://iptv-org.github.io/api/guides.json`);
      if (response.ok) {
        const guides = await response.json();
        // Find guide for this channel
        const guide = guides.find((g: any) => g.channel === ch.tvgId || g.channel === ch.id);
        if (guide && guide.sources && guide.sources.length > 0) {
          // Fetch the actual EPG XML
          const epgResponse = await fetch(guide.sources[0].url);
          if (epgResponse.ok) {
            const xmlText = await epgResponse.text();
            const parsed = parseEPG(xmlText, ch.tvgId || ch.id);
            setEpgData(parsed);
            updateCurrentNextPrograms(parsed);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch EPG:', error);
    } finally {
      setIsLoadingEpg(false);
    }
  };

  const parseEPG = (xmlText: string, channelId: string): EPGData => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const programs: EPGProgram[] = [];

    const programmeElements = xmlDoc.querySelectorAll(`programme[channel="${channelId}"]`);
    programmeElements.forEach((el) => {
      const start = el.getAttribute('start');
      const stop = el.getAttribute('stop');
      const titleEl = el.querySelector('title');
      const descEl = el.querySelector('desc');
      const catEl = el.querySelector('category');

      if (start && stop && titleEl) {
        programs.push({
          title: titleEl.textContent || '',
          start,
          stop,
          description: descEl?.textContent || undefined,
          category: catEl?.textContent || undefined,
        });
      }
    });

    // Sort by start time
    programs.sort((a, b) => new Date(convertEPGTime(a.start)).getTime() - new Date(convertEPGTime(b.start)).getTime());

    return { channel: channelId, programs };
  };

  const convertEPGTime = (epgTime: string): string => {
    // EPG time format: YYYYMMDDHHMMSS +ZZZZ
    const match = epgTime.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`;
    }
    return epgTime;
  };

  const updateCurrentNextPrograms = (epg: EPGData) => {
    const now = new Date();
    let current: EPGProgram | null = null;
    let next: EPGProgram | null = null;

    for (let i = 0; i < epg.programs.length; i++) {
      const program = epg.programs[i];
      const start = new Date(convertEPGTime(program.start));
      const stop = new Date(convertEPGTime(program.stop));

      if (start <= now && stop > now) {
        current = program;
        next = epg.programs[i + 1] || null;
        break;
      } else if (start > now && !next) {
        next = program;
      }
    }

    setCurrentProgram(current);
    setNextProgram(next);
  };

  const formatTime = (epgTime: string): string => {
    const date = new Date(convertEPGTime(epgTime));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (start: string, stop: string): string => {
    const startDate = new Date(convertEPGTime(start));
    const stopDate = new Date(convertEPGTime(stop));
    const diffMs = stopDate.getTime() - startDate.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!channel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">Channel Not Found</h3>
          <p className="text-muted-foreground mb-6">The channel you're looking for doesn't exist or has been removed.</p>
          <Button variant="hero" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Channels
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{channel.name} | IndiaLive</title>
        <meta name="description" content={`Watch ${channel.name} live on IndiaLive. ${channel.group} channel streaming in ${channel.isHD ? 'HD' : 'SD'}.`} />
        <meta property="og:title" content={`${channel.name} | IndiaLive`} />
        <meta property="og:description" content={`Watch ${channel.name} live on IndiaLive`} />
        {channel.logo && <meta property="og:image" content={channel.logo} />}
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Video Player Section */}
        <section className="relative w-full aspect-video bg-black">
          <VideoPlayer channel={channel} onClose={() => navigate('/')} />
        </section>

        {/* Channel Info & EPG Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Channel Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Channel Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  {channel.logo && (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg bg-secondary p-2"
                    />
                  )}
                  <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                      {channel.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {channel.isHD && (
                        <span className="rounded-md border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                          HD
                        </span>
                      )}
                      {channel.isWorking ? (
                        <span className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-200">
                          Offline
                        </span>
                      )}
                      <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                        {channel.group}
                      </span>
                      <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs text-accent">
                        {channel.language}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2 sm:ml-0">
                  <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => window.open(channel.url, '_blank', 'noopener,noreferrer')}>
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open Stream
                  </Button>
                </div>
              </div>

              {/* Current/Next Program */}
              <div className="glass-card p-4 sm:p-6 rounded-xl">
                <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Now & Next
                </h2>
                
                {isLoadingEpg ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="ml-3 text-muted-foreground">Loading program guide...</span>
                  </div>
                ) : currentProgram || nextProgram ? (
                  <div className="space-y-4">
                    {currentProgram && (
                      <div className="relative p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="absolute top-2 right-2">
                          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                            LIVE NOW
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-16 text-center">
                            <div className="text-sm font-mono text-primary font-medium">
                              {formatTime(currentProgram.start)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              - {formatTime(currentProgram.stop)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {currentProgram.title}
                            </h3>
                            {currentProgram.category && (
                              <span className="text-xs text-muted-foreground">
                                {currentProgram.category}
                              </span>
                            )}
                            {currentProgram.description && (
                              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                {currentProgram.description}
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Duration: {formatDuration(currentProgram.start, currentProgram.stop)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {nextProgram && (
                      <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                        <div className="absolute top-2 right-2">
                          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                            NEXT
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-16 text-center">
                            <div className="text-sm font-mono text-accent font-medium">
                              {formatTime(nextProgram.start)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              - {formatTime(nextProgram.stop)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {nextProgram.title}
                            </h3>
                            {nextProgram.category && (
                              <span className="text-xs text-muted-foreground">
                                {nextProgram.category}
                              </span>
                            )}
                            {nextProgram.description && (
                              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                {nextProgram.description}
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Duration: {formatDuration(nextProgram.start, nextProgram.stop)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!currentProgram && !nextProgram && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No program information available for this channel</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No EPG data available for this channel</p>
                    <p className="text-xs mt-1">Program guide data sourced from iptv-org/epg</p>
                  </div>
                )}
              </div>

              {/* Channel Details */}
              <div className="glass-card p-4 sm:p-6 rounded-xl">
                <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Channel Details
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Channel ID</span>
                    <p className="font-mono text-foreground mt-1">{channel.id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">TVG ID</span>
                    <p className="font-mono text-foreground mt-1">{channel.tvgId || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Country</span>
                    <p className="text-foreground mt-1">{channel.country}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Language</span>
                    <p className="text-foreground mt-1">{channel.language}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category</span>
                    <p className="text-foreground mt-1">{channel.group}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quality</span>
                    <p className="text-foreground mt-1">{channel.isHD ? 'HD' : 'SD'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">Stream URL</span>
                    <p className="font-mono text-xs text-primary mt-1 truncate" title={channel.url}>
                      {channel.url}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Upcoming Programs */}
            <div className="space-y-6">
              <div className="glass-card p-4 sm:p-6 rounded-xl sticky top-24">
                <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming Programs
                </h2>
                
                {isLoadingEpg ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 bg-secondary/50 rounded animate-pulse" />
                    ))}
                  </div>
                ) : epgData && epgData.programs.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {epgData.programs.slice(0, 10).map((program, index) => {
                      const start = new Date(convertEPGTime(program.start));
                      const stop = new Date(convertEPGTime(program.stop));
                      const now = new Date();
                      const isCurrent = start <= now && stop > now;
                      const isNext = !isCurrent && start > now && index === epgData.programs.findIndex(p => new Date(convertEPGTime(p.start)) > now);

                      return (
                        <div
                          key={program.start}
                          className={cn(
                            'p-3 rounded-lg border transition-all',
                            isCurrent ? 'bg-primary/10 border-primary/30' : 'bg-secondary/50 border-border hover:bg-secondary'
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-14 text-center">
                              <div className={cn(
                                'text-xs font-mono font-medium',
                                isCurrent ? 'text-primary' : 'text-muted-foreground'
                              )}>
                                {formatTime(program.start)}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {formatTime(program.stop)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={cn(
                                'font-medium truncate',
                                isCurrent ? 'text-foreground' : 'text-muted-foreground'
                              )}>
                                {program.title}
                              </h4>
                              {program.category && (
                                <span className="text-[10px] text-muted-foreground">
                                  {program.category}
                                </span>
                              )}
                            </div>
                            {isCurrent && (
                              <span className="flex-shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                                LIVE
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No upcoming programs</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}