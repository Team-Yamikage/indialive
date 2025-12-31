import { FilterType, ViewMode } from '@/types/channel';
import { Search, Filter, Tv, Grid3X3, Star, Clock, Eye, EyeOff, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  languageFilter: string;
  setLanguageFilter: (language: string) => void;
  hdOnly: boolean;
  setHdOnly: (hd: boolean) => void;
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  showHidden: boolean;
  setShowHidden: (show: boolean) => void;
  categories: string[];
  languages: string[];
  totalChannels: number;
  visibleChannels: number;
  checkProgress: { checked: number; total: number };
}

export function FilterBar({
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
  viewMode,
  setViewMode,
  showHidden,
  setShowHidden,
  categories,
  languages,
  totalChannels,
  visibleChannels,
  checkProgress,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-40 glass-card border-b border-glass-border backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        {/* Top row: Search and view toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="shrink-0"
            >
              <Grid3X3 className="w-5 h-5" />
            </Button>
            <Button
              variant={viewMode === 'tv' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('tv')}
              className="shrink-0"
            >
              <Tv className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Button
            variant={filterType === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button
            variant={filterType === 'favorites' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterType('favorites')}
          >
            <Star className="w-4 h-4 text-yellow-500" />
            Favorites
          </Button>
          <Button
            variant={filterType === 'watchlist' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterType('watchlist')}
          >
            <Clock className="w-4 h-4 text-primary" />
            Watchlist
          </Button>
          
          <div className="h-6 w-px bg-border mx-2 hidden sm:block" />
          
          <Button
            variant={hdOnly ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setHdOnly(!hdOnly)}
          >
            HD Only
          </Button>
          
          <Button
            variant={showHidden ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowHidden(!showHidden)}
          >
            {showHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showHidden ? 'Showing Hidden' : 'Show Hidden'}
          </Button>
        </div>

        {/* Dropdowns row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-background">
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Language dropdown */}
          <div className="relative">
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang} className="bg-background">
                  {lang === 'all' ? 'All Languages' : lang}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Stats */}
          <div className="ml-auto text-sm text-muted-foreground">
            <span className="hidden sm:inline">Showing </span>
            <span className="font-semibold text-foreground">{visibleChannels}</span>
            <span> of </span>
            <span className="font-semibold text-foreground">{totalChannels}</span>
            <span className="hidden sm:inline"> channels</span>
            
            {checkProgress.checked < checkProgress.total && (
              <span className="ml-2 text-primary">
                • Checking streams ({checkProgress.checked}/{checkProgress.total})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
