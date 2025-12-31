import { Heart, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>for Indian TV enthusiasts</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a
              href="https://github.com/iptv-org/iptv"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              Powered by IPTV-Org
            </a>
          </div>
          
          <p className="text-xs text-muted-foreground/70">
            Streams are provided by third-party sources. We do not host any content.
          </p>
        </div>
      </div>
    </footer>
  );
}
