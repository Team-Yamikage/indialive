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
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Top row: Search and view toggle */}
        <div className="flex gap-2 sm:gap-4 mb-3 sm:mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-secondary/50 border border-border rounded-lg text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground touch-manipulation"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-9 w-9 sm:h-10 sm:w-10"
            >
              <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant={viewMode === 'tv' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('tv')}
              className="h-9 w-9 sm:h-10 sm:w-10"
            >
              <Tv className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          <Button
            variant={filterType === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterType('all')}
            className="shrink-0 h-8 px-2.5 sm:px-3 text-xs sm:text-sm"
          >
            All
          </Button>
          <Button
            variant={filterType === 'favorites' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterType('favorites')}
            className="shrink-0 h-8 px-2.5 sm:px-3 text-xs sm:text-sm"
          >
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
            <span className="hidden xs:inline">Favorites</span>
            <span className="xs:hidden">Fav</span>
          </Button>
          <Button
            variant={filterType === 'watchlist' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterType('watchlist')}
            className="shrink-0 h-8 px-2.5 sm:px-3 text-xs sm:text-sm"
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="hidden xs:inline">Watchlist</span>
            <span className="xs:hidden">List</span>
          </Button>
          
          <div className="h-5 w-px bg-border mx-1 hidden sm:block shrink-0" />
          
          <Button
            variant={hdOnly ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setHdOnly(!hdOnly)}
            className="shrink-0 h-8 px-2.5 sm:px-3 text-xs sm:text-sm"
          >
            HD
          </Button>
          
          <Button
            variant={showHidden ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowHidden(!showHidden)}
            className="shrink-0 h-8 px-2.5 sm:px-3 text-xs sm:text-sm"
          >
            {showHidden ? <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span className="hidden sm:inline">{showHidden ? 'Showing Hidden' : 'Show Hidden'}</span>
          </Button>
        </div>

        {/* Dropdowns row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Category dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-1.5 sm:py-2 bg-secondary/50 border border-border rounded-lg text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-background">
                  {cat === 'all' ? 'Category' : cat}
                </option>
              ))}
            </select>
            <Filter className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Language dropdown */}
          <div className="relative">
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="appearance-none pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-1.5 sm:py-2 bg-secondary/50 border border-border rounded-lg text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang} className="bg-background">
                  {lang === 'all' ? 'Language' : lang}
                </option>
              ))}
            </select>
            <Filter className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Stats */}
          <div className="ml-auto text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            <span className="font-semibold text-foreground">{visibleChannels}</span>
            <span className="text-muted-foreground/70">/</span>
            <span className="font-semibold text-foreground">{totalChannels}</span>
            
            {checkProgress.checked < checkProgress.total && (
              <span className="ml-1 sm:ml-2 text-primary text-[10px] sm:text-xs">
                ({checkProgress.checked}/{checkProgress.total})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
