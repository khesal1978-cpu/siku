import { Home, Gamepad2, Users, Wallet, User } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Mine', path: '/' },
  { icon: Gamepad2, label: 'Games', path: '/games' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: Wallet, label: 'Wallet', path: '/wallet' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function BottomNav() {
  const [location] = useLocation();
  
  const hiddenPaths = ['/terms', '/help'];
  const shouldHide = hiddenPaths.some(path => location.startsWith(path));

  if (shouldHide) return null;

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
              <motion.button
                className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover-elevate'
                }`}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                data-testid={`button-nav-${label.toLowerCase()}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={isActive ? { y: [0, -3, 0] } : {}}
                  transition={{ duration: 0.6, repeat: isActive ? Infinity : 0, repeatDelay: 2 }}
                >
                  <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'drop-shadow-lg' : ''}`} />
                </motion.div>
                <span className="text-[10px] font-medium relative z-10">{label}</span>
              </motion.button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}