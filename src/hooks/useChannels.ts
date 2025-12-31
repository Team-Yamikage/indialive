import { useState, useEffect, useCallback, useMemo } from 'react';
import { Channel, ParsedChannel, FilterType } from '@/types/channel';
import { parseM3U, filterIndianChannels, generateChannelId, isHDChannel } from '@/utils/m3uParser';
import { checkStream } from '@/utils/streamChecker';
import { useLocalStorage } from './useLocalStorage';

const PLAYLIST_URL = 'https://iptv-org.github.io/iptv/countries/in.m3u';
const FALLBACK_URL = 'https://iptv-org.github.io/iptv/index.m3u';

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkProgress, setCheckProgress] = useState({ checked: 0, total: 0 });
  
  const [favorites, setFavorites] = useLocalStorage<string[]>('iptv-favorites', []);
  const [watchlist, setWatchlist] = useLocalStorage<string[]>('iptv-watchlist', []);
  const [showHidden, setShowHidden] = useLocalStorage('iptv-show-hidden', false);
  const [failCounts, setFailCounts] = useLocalStorage<Record<string, number>>('iptv-fail-counts', {});

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [hdOnly, setHdOnly] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');

  const fetchPlaylist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try India-specific playlist first
      let response = await fetch(PLAYLIST_URL);
      let content = '';
      
      if (response.ok) {
        content = await response.text();
      } else {
        // Fallback to main index and filter
        response = await fetch(FALLBACK_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch playlist');
        }
        content = await response.text();
      }
      
      let parsedChannels = parseM3U(content);
      
      // If using fallback, filter for Indian channels
      if (!response.url.includes('/in.m3u')) {
        parsedChannels = filterIndianChannels(parsedChannels);
      }
      
      // Convert to Channel objects
      const channelList: Channel[] = parsedChannels.map((pc: ParsedChannel) => {
        const id = generateChannelId(pc);
        return {
          id,
          name: pc.name,
          url: pc.url,
          logo: pc.logo,
          group: pc.group || 'General',
          language: pc.tvgLanguage || 'Hindi',
          country: pc.tvgCountry || 'IN',
          tvgId: pc.tvgId,
          tvgName: pc.tvgName,
          isHD: isHDChannel(pc),
          isWorking: (failCounts[id] || 0) < 3, // Consider working if fail count < 3
          isChecking: false,
          isFavorite: favorites.includes(id),
          isInWatchlist: watchlist.includes(id),
        };
      });
      
      setChannels(channelList);
      setCheckProgress({ checked: 0, total: channelList.length });
      
      // Background stream checking
      checkStreamsInBackground(channelList);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load channels');
    } finally {
      setIsLoading(false);
    }
  }, [favorites, watchlist, failCounts]);

  const checkStreamsInBackground = async (channelList: Channel[]) => {
    const batchSize = 10;
    let checked = 0;
    
    for (let i = 0; i < channelList.length; i += batchSize) {
      const batch = channelList.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (channel) => {
        const result = await checkStream(channel.url);
        
        // HTTP streams that need proxy are still considered working
        const isWorking = result.isWorking || result.needsProxy;
        
        setChannels(prev => prev.map(c => 
          c.id === channel.id 
            ? { ...c, isWorking, isChecking: false }
            : c
        ));
        
        checked++;
        setCheckProgress({ checked, total: channelList.length });
      }));
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  // Track playback failures
  const recordPlaybackFailure = useCallback((channelId: string) => {
    setFailCounts(prev => ({
      ...prev,
      [channelId]: (prev[channelId] || 0) + 1,
    }));
  }, [setFailCounts]);

  const resetFailCount = useCallback((channelId: string) => {
    setFailCounts(prev => {
      const next = { ...prev };
      delete next[channelId];
      return next;
    });
  }, [setFailCounts]);

  useEffect(() => {
    fetchPlaylist();
  }, []);

  // Update favorites/watchlist status when they change
  useEffect(() => {
    setChannels(prev => prev.map(c => ({
      ...c,
      isFavorite: favorites.includes(c.id),
      isInWatchlist: watchlist.includes(c.id),
    })));
  }, [favorites, watchlist]);

  const toggleFavorite = useCallback((channelId: string) => {
    setFavorites(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  }, [setFavorites]);

  const toggleWatchlist = useCallback((channelId: string) => {
    setWatchlist(prev => 
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  }, [setWatchlist]);

  const clearFavorites = useCallback(() => setFavorites([]), [setFavorites]);
  const clearWatchlist = useCallback(() => setWatchlist([]), [setWatchlist]);

  // Get unique categories and languages
  const categories = useMemo(() => {
    const cats = new Set(channels.map(c => c.group || 'General'));
    return ['all', ...Array.from(cats).sort()];
  }, [channels]);

  const languages = useMemo(() => {
    const langs = new Set(channels.map(c => c.language || 'Unknown'));
    return ['all', ...Array.from(langs).sort()];
  }, [channels]);

  // Filtered channels
  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      // Hidden filter - channels with 3+ failures are hidden unless showHidden
      const failCount = failCounts[channel.id] || 0;
      if (!showHidden && (failCount >= 3 || !channel.isWorking)) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          channel.name.toLowerCase().includes(query) ||
          channel.group?.toLowerCase().includes(query) ||
          channel.language?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if (categoryFilter !== 'all' && channel.group !== categoryFilter) return false;
      
      // Language filter
      if (languageFilter !== 'all' && channel.language !== languageFilter) return false;
      
      // HD filter
      if (hdOnly && !channel.isHD) return false;
      
      // Type filter
      if (filterType === 'favorites' && !channel.isFavorite) return false;
      if (filterType === 'watchlist' && !channel.isInWatchlist) return false;
      
      return true;
    });
  }, [channels, showHidden, searchQuery, categoryFilter, languageFilter, hdOnly, filterType, failCounts]);

  return {
    channels: filteredChannels,
    allChannels: channels,
    isLoading,
    error,
    checkProgress,
    favorites,
    watchlist,
    showHidden,
    setShowHidden,
    toggleFavorite,
    toggleWatchlist,
    clearFavorites,
    clearWatchlist,
    refetch: fetchPlaylist,
    recordPlaybackFailure,
    resetFailCount,
    // Filters
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    languageFilter,
    setLanguageFilter,
    hdOnly,
    setHdOnly,
    filterType,
    setFilterType,
    categories,
    languages,
  };
}
