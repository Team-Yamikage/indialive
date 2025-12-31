export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  language?: string;
  country?: string;
  tvgId?: string;
  tvgName?: string;
  isHD: boolean;
  isWorking: boolean;
  isChecking: boolean;
  isFavorite: boolean;
  isInWatchlist: boolean;
}

export interface ParsedChannel {
  name: string;
  url: string;
  logo?: string;
  group?: string;
  tvgId?: string;
  tvgName?: string;
  tvgCountry?: string;
  tvgLanguage?: string;
}

export type FilterType = 'all' | 'favorites' | 'watchlist';
export type ViewMode = 'grid' | 'tv';
