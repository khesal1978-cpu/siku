import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import clsx from 'clsx'; // Assuming clsx is available for conditional class names

interface MiningButtonProps {
  isActive: boolean;
  progress: number;
  onMine: () => void;
  disabled?: boolean;
}

export default function MiningButton({ isActive, progress, onMine, disabled }: MiningButtonProps) {
  const liquidHeight = 200 - (200 * progress / 100);

  // Reduce particles for better performance
  const particles = useMemo(() => {
    if (!isActive) return [];
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 50 + (i * 30),
      y: 200,
      delay: i * 0.3
    }));
  }, [isActive]);

  // Determine if the button can be mined
  const canMine = !disabled && isActive;
  const isMining = isActive && progress < 100;

  return (
    <div className="relative flex flex-col items-center" data-testid="mining-button-container">
      <motion.div
        initial={{ scale: 1 }}
        whileHover={{ scale: disabled ? 1 : 1.03 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Button
          size="icon"
          onClick={onMine}
          disabled={disabled}
          data-testid="button-mine"
          className={clsx(
            "relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden shadow-xl will-change-transform",
            (canMine && !isMining)
              ? "bg-gradient-to-br from-primary/70 via-primary/50 to-primary/30 border-2 border-primary/50 cursor-pointer neon-border-primary animate-glow-pulse"
              : "bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-muted/30 cursor-not-allowed opacity-70"
          )}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 200 200"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity="0.8" />
              </linearGradient>
              <clipPath id="circleClip">
                <circle cx="100" cy="100" r="96" />
              </clipPath>
            </defs>

            <g clipPath="url(#circleClip)">
              {/* Simplified liquid fill */}
              <rect
                x="0"
                y={liquidHeight}
                width="200"
                height="200"
                fill="url(#liquidGradient)"
                className={isActive ? 'transition-all duration-700 ease-out' : 'transition-all duration-300'}
              />

              {/* Single wave overlay for active state */}
              {isActive && (
                <path
                  d={`M 0,${liquidHeight} Q 50,${liquidHeight - 5} 100,${liquidHeight} T 200,${liquidHeight} L 200,200 L 0,200 Z`}
                  fill="url(#liquidGradient)"
                  opacity="0.6"
                  className="animate-liquid-wave-1"
                />
              )}

              {/* Simplified particles */}
              {particles.map((particle) => (
                <circle
                  key={particle.id}
                  cx={particle.x}
                  cy={liquidHeight + 30 - (particle.id * 5)}
                  r="2"
                  fill="rgba(255, 255, 255, 0.5)"
                  className="animate-bounce-subtle"
                  style={{ animationDelay: `${particle.delay}s` }}
                />
              ))}
            </g>

            {/* Simplified outer ring */}
            <circle
              cx="100"
              cy="100"
              r="96"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              opacity="0.5"
            />

            {/* Progress ring - simplified */}
            {isActive && (
              <circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeDasharray={`${(progress / 100) * 577} 577`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                className="transition-all duration-300"
              />
            )}
          </svg>

          {/* Central icon - simplified animation */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Zap
              className={`w-20 h-20 md:w-24 md:h-24 ${isActive ? 'text-primary-foreground animate-pulse' : 'text-foreground'} transition-colors duration-300`}
              strokeWidth={2.5}
            />
          </div>

          {/* Single energy ring for active state */}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/40"
              animate={{
                scale: [1, 1.2],
                opacity: [0.6, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          )}

          {/* Progress percentage */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center z-10">
            <p className={`text-lg font-bold tabular-nums ${progress > 50 ? 'text-primary-foreground' : 'text-foreground'} drop-shadow transition-colors duration-300`}>
              {progress}%
            </p>
          </div>
        </Button>
      </motion.div>

      <div className="mt-8 text-center">
        <p className="text-sm font-medium text-muted-foreground" data-testid="text-mining-status">
          {isActive ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Mining Active
            </span>
          ) : disabled ? (
            'Mining Cooldown'
          ) : (
            'Tap to Mine'
          )}
        </p>
      </div>
    </div>
  );
}