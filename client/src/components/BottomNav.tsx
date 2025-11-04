import { Home, Users, Wallet, Trophy, User } from 'lucide-react';
import { Link, useLocation } from 'wouter';

const navItems = [
  { icon: Home, label: 'Mine', path: '/' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: Wallet, label: 'Wallet', path: '/wallet' },
  { icon: Trophy, label: 'Ranks', path: '/leaderboard' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-card-border z-50"
      data-testid="nav-bottom"
    >
      <div className="flex items-center justify-around h-16 max-w-screen-sm mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location === path;
          return (
            <Link 
              key={path} 
              href={path}
              data-testid={`link-nav-${label.toLowerCase()}`}
            >
              <button 
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover-elevate'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? '' : ''}`} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
