import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

interface MiningButtonProps {
  isActive: boolean;
  progress: number;
  onMine: () => void;
  disabled?: boolean;
}

export default function MiningButton({ isActive, progress, onMine, disabled }: MiningButtonProps) {
  const liquidHeight = 200 - (200 * progress / 100);
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      controls.start({
        scale: [1, 1.05, 1],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        },
      });
    } else {
      controls.stop();
      controls.set({ scale: 1 });
    }
  }, [isActive, controls]);

  return (
    <div className="relative flex flex-col items-center" data-testid="mining-button-container">
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-primary/20 blur-xl" />
        </motion.div>
      )}
      
      <motion.div 
        animate={controls} 
        initial={{ scale: 1 }}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
      >
        <Button
          size="icon"
          onClick={onMine}
          disabled={disabled}
          data-testid="button-mine"
          className={`w-48 h-48 md:w-56 md:h-56 rounded-full relative overflow-hidden shadow-2xl transition-all duration-300 bg-gradient-to-br from-muted/30 via-muted/20 to-card border-4 border-primary/30 backdrop-blur-sm ${isActive ? 'animate-mining-pulse' : ''}`}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 200 200"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
                <stop offset="50%" stopColor="hsl(var(--chart-2))" stopOpacity="0.9" />
                <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="liquidHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <clipPath id="circleClip">
                <circle cx="100" cy="100" r="96" />
              </clipPath>
              <path id="wave1" d={`M 0,${liquidHeight} Q 25,${liquidHeight - 4} 50,${liquidHeight} T 100,${liquidHeight} T 150,${liquidHeight} T 200,${liquidHeight} L 200,200 L 0,200 Z`} />
              <path id="wave2" d={`M 0,${liquidHeight + 2} Q 30,${liquidHeight - 2} 60,${liquidHeight + 2} T 120,${liquidHeight + 2} T 180,${liquidHeight + 2} T 240,${liquidHeight + 2} L 200,200 L 0,200 Z`} />
              <path id="wave3" d={`M 0,${liquidHeight + 4} Q 20,${liquidHeight + 9} 40,${liquidHeight + 4} T 80,${liquidHeight + 4} T 120,${liquidHeight + 4} T 160,${liquidHeight + 4} T 200,${liquidHeight + 4} L 200,200 L 0,200 Z`} />
            </defs>

            <g clipPath="url(#circleClip)">
              <use href="#wave1" fill="url(#liquidGradient)" filter="url(#glow)" className={isActive ? 'animate-liquid-wave-1' : ''} />
              <use href="#wave2" fill="url(#liquidHighlight)" opacity="0.4" className={isActive ? 'animate-liquid-wave-2' : ''} />
              <use href="#wave3" fill="rgba(255,255,255,0.1)" className={isActive ? 'animate-liquid-wave-3' : ''} />
            </g>

            <circle
              cx="100"
              cy="100"
              r="96"
              fill="none"
              stroke="url(#liquidGradient)"
              strokeWidth="2"
              opacity="0.5"
            />
          </svg>

          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-full pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Zap
              className={`w-20 h-20 md:w-24 md:h-24 ${isActive ? 'animate-pulse text-primary-foreground drop-shadow-lg' : 'text-foreground'} transition-colors duration-300`}
              strokeWidth={2.5}
            />
          </div>

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