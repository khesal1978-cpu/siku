
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MiningButtonProps {
  isActive: boolean;
  progress: number;
  onMine: () => void;
  disabled?: boolean;
}

export default function MiningButton({ isActive, progress, onMine, disabled }: MiningButtonProps) {
  const liquidHeight = 200 - (200 * progress / 100);
  const controls = useAnimation();
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    controls.set({ scale: 1 });
    
    // Generate floating particles when mining is active
    if (isActive) {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 200,
        y: 200 + Math.random() * 50,
        delay: Math.random() * 2
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isActive, controls]);

  return (
    <div className="relative flex flex-col items-center" data-testid="mining-button-container">
      <motion.div 
        animate={controls} 
        initial={{ scale: 1 }}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          size="icon"
          onClick={onMine}
          disabled={disabled}
          data-testid="button-mine"
          className="w-48 h-48 md:w-56 md:h-56 rounded-full relative overflow-hidden shadow-xl transition-all duration-300 bg-gradient-to-br from-muted/30 via-muted/20 to-card border-4 border-primary/30"
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
              <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.6)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="bubbleGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <clipPath id="circleClip">
                <circle cx="100" cy="100" r="96" />
              </clipPath>
              <path id="wave1" d={`M 0,${liquidHeight} Q 25,${liquidHeight - 8} 50,${liquidHeight} T 100,${liquidHeight} T 150,${liquidHeight} T 200,${liquidHeight} L 200,200 L 0,200 Z`} />
              <path id="wave2" d={`M 0,${liquidHeight + 3} Q 30,${liquidHeight - 5} 60,${liquidHeight + 3} T 120,${liquidHeight + 3} T 180,${liquidHeight + 3} T 240,${liquidHeight + 3} L 200,200 L 0,200 Z`} />
              <path id="wave3" d={`M 0,${liquidHeight + 6} Q 20,${liquidHeight + 12} 40,${liquidHeight + 6} T 80,${liquidHeight + 6} T 120,${liquidHeight + 6} T 160,${liquidHeight + 6} T 200,${liquidHeight + 6} L 200,200 L 0,200 Z`} />
            </defs>

            <g clipPath="url(#circleClip)">
              {/* Animated liquid waves */}
              <use href="#wave1" fill="url(#liquidGradient)" className={isActive ? 'animate-liquid-wave-1' : ''} opacity="0.9" />
              <use href="#wave2" fill="url(#liquidGradient)" className={isActive ? 'animate-liquid-wave-2' : ''} opacity="0.7" />
              <use href="#wave3" fill="url(#liquidGradient)" className={isActive ? 'animate-liquid-wave-3' : ''} opacity="0.5" />
              
              {/* Shimmer effect on liquid */}
              {isActive && (
                <rect 
                  x="-100" 
                  y={liquidHeight} 
                  width="400" 
                  height="200" 
                  fill="url(#shimmerGradient)"
                  className="animate-shimmer"
                  opacity="0.4"
                />
              )}

              {/* Floating bubbles/particles */}
              {particles.map((particle) => (
                <motion.circle
                  key={particle.id}
                  cx={particle.x}
                  cy={particle.y}
                  r="3"
                  fill="rgba(255, 255, 255, 0.7)"
                  filter="url(#bubbleGlow)"
                  initial={{ y: particle.y, opacity: 0 }}
                  animate={{
                    y: liquidHeight - 20,
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    delay: particle.delay,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </g>

            {/* Outer ring glow */}
            <circle
              cx="100"
              cy="100"
              r="96"
              fill="none"
              stroke="url(#liquidGradient)"
              strokeWidth="3"
              opacity="0.6"
              filter="url(#glow)"
              className={isActive ? 'animate-pulse-ring' : ''}
            />

            {/* Progress ring */}
            {isActive && (
              <circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                strokeDasharray={`${(progress / 100) * 577} 577`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                className="transition-all duration-500"
                filter="url(#glow)"
              />
            )}
          </svg>

          {/* Rotating background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-full pointer-events-none ${isActive ? 'animate-spin-slow' : ''}`} />
          
          {/* Central icon */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center z-10"
            animate={isActive ? {
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{
              duration: 2,
              repeat: isActive ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            <Zap
              className={`w-20 h-20 md:w-24 md:h-24 ${isActive ? 'text-primary-foreground' : 'text-foreground'} transition-colors duration-300`}
              strokeWidth={2.5}
              filter={isActive ? "url(#glow)" : "none"}
            />
          </motion.div>

          {/* Energy rings */}
          {isActive && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{
                  scale: [1, 1.3, 1.3],
                  opacity: [0.5, 0, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{
                  scale: [1, 1.3, 1.3],
                  opacity: [0.5, 0, 0]
                }}
                transition={{
                  duration: 2,
                  delay: 1,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            </>
          )}

          {/* Progress percentage */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center z-10">
            <motion.p 
              className={`text-lg font-bold tabular-nums ${progress > 50 ? 'text-primary-foreground' : 'text-foreground'} drop-shadow transition-colors duration-300`}
              animate={isActive ? { scale: [1, 1.05, 1] } : {}}
              transition={{
                duration: 1,
                repeat: isActive ? Infinity : 0
              }}
            >
              {progress}%
            </motion.p>
          </div>
        </Button>
      </motion.div>

      <div className="mt-8 text-center">
        <p className="text-sm font-medium text-muted-foreground" data-testid="text-mining-status">
          {isActive ? (
            <motion.span 
              className="flex items-center justify-center gap-2"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Mining Active
            </motion.span>
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
