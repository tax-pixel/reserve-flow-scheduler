import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Calendar, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

type View = 'book' | 'admin';

interface HeaderProps {
  view: View;
  setView: (v: View) => void;
}

const Header: React.FC<HeaderProps> = ({ view, setView }) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/90 border-b border-border/60 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Gold accent bars — mirrors the quotation mark motif from her site */}
          <div className="flex flex-col gap-[3px] shrink-0">
            <div className="w-5 h-[3px] rounded-full" style={{ backgroundColor: '#f9ec00' }} />
            <div className="w-3 h-[3px] rounded-full" style={{ backgroundColor: '#f9ec00' }} />
            <div className="w-5 h-[3px] rounded-full" style={{ backgroundColor: '#f9ec00' }} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm tracking-tight leading-none truncate">
              Victoria Nguyen, EA
            </div>
            <div className="text-[10px] text-muted-foreground leading-none mt-[3px] tracking-widest uppercase">
              Upload Week Scheduler · Tax Season 2027
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1 bg-muted/60 rounded-lg p-1 shrink-0">
          <button
            onClick={() => setView('book')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
              view === 'book'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reserve a Week</span>
          </button>
          <button
            onClick={() => setView('admin')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
              view === 'admin'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </nav>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-border/60 hover:bg-muted transition-colors shrink-0"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

export default Header;
