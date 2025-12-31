import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerDownLeft } from 'lucide-react';

interface TvModeHintProps {
  isVisible: boolean;
}

export function TvModeHint({ isVisible }: TvModeHintProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="glass-card px-6 py-4 rounded-xl flex items-center gap-6">
        <span className="text-sm text-muted-foreground">Navigation:</span>
        
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <kbd className="w-8 h-8 flex items-center justify-center bg-secondary rounded-lg border border-border text-foreground">
              <ArrowUp className="w-4 h-4" />
            </kbd>
            <div className="flex gap-1">
              <kbd className="w-8 h-8 flex items-center justify-center bg-secondary rounded-lg border border-border text-foreground">
                <ArrowLeft className="w-4 h-4" />
              </kbd>
              <kbd className="w-8 h-8 flex items-center justify-center bg-secondary rounded-lg border border-border text-foreground">
                <ArrowDown className="w-4 h-4" />
              </kbd>
              <kbd className="w-8 h-8 flex items-center justify-center bg-secondary rounded-lg border border-border text-foreground">
                <ArrowRight className="w-4 h-4" />
              </kbd>
            </div>
          </div>
        </div>

        <div className="h-8 w-px bg-border" />
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Select:</span>
          <kbd className="h-8 px-3 flex items-center justify-center bg-primary/20 text-primary rounded-lg border border-primary/30 text-sm font-medium">
            <CornerDownLeft className="w-4 h-4 mr-1" />
            Enter
          </kbd>
        </div>

        <div className="h-8 w-px bg-border" />
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Exit:</span>
          <kbd className="h-8 px-3 flex items-center justify-center bg-secondary rounded-lg border border-border text-foreground text-sm font-medium">
            Esc
          </kbd>
        </div>
      </div>
    </div>
  );
}
