import { Bell, Settings, User, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface TopNavProps {
  plantName?: string;
}

const TopNav = ({ plantName }: TopNavProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-5 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold"></span>
        </div>
        <span className="text-sm font-semibold text-foreground tracking-tight">LabControl</span>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2">
        <span className="text-sm font-medium text-foreground">{plantName || '...'}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Bell size={16} />
        </button>
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Settings size={16} />
        </button>
        <button className="ml-1 w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <User size={14} />
        </button>
      </div>
    </header>
  );
};

export default TopNav;
