import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import casetIcon from '@assets/ChatGPT Image Nov 5, 2025, 06_57_27 PM_1762426824094.png';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useAuth } from '@/contexts/AuthContext';

interface SpinWheelProps {
  onSpin: () => Promise<number>;
  canSpin: boolean;
  nextSpinTime?: string;
  energy: number;
}

const wheelSegments = [
  { reward: 0, colors: ['#6b7280', '#4b5563'], label: 'Unlucky', icon: '😢' },
  { reward: 30, colors: ['#34d399', '#10b981'], label: '30', icon: casetIcon },
  { reward: 60, colors: ['#2dd4bf', '#14b8a6'], label: '60', icon: casetIcon },
  { reward: 100, colors: ['#60a5fa', '#3b82f6'], label: '100', icon: casetIcon },
  { reward: 400, colors: ['#a78bfa', '#8b5cf6'], label: '400', icon: casetIcon },
  { reward: 1000, colors: ['#fbbf24', '#f59e0b'], label: '1000', icon: casetIcon },
];

export default function SpinWheel({ onSpin, canSpin, nextSpinTime, energy }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonAmount, setWonAmount] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { subscribe } = useWebSocket();
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribe('profile_updated', () => {
    });

    return () => unsubscribe();
  }, [userId, subscribe]);

  const handleSpin = async () => {
    if (!canSpin || isSpinning || energy < 15) return;

    setIsSpinning(true);
    setWonAmount(null);

    try {
      const reward = await onSpin();
      
      const segmentIndex = wheelSegments.findIndex(s => s.reward === reward);
      const baseRotation = rotation;
      const segmentAngle = 360 / wheelSegments.length;
      const targetAngle = segmentIndex * segmentAngle;
      const spins = prefersReducedMotion ? 2 : 5;
      const totalRotation = baseRotation + (spins * 360) + (360 - targetAngle);
      
      setRotation(totalRotation);

      setTimeout(() => {
        setWonAmount(reward);
        setIsSpinning(false);
      }, prefersReducedMotion ? 2000 : 4000);
    } catch (error) {
      setIsSpinning(false);
    }
  };

  const createWheelPath = (index: number, totalSegments: number) => {
    const anglePerSegment = 360 / totalSegments;
    const startAngle = (index * anglePerSegment - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * anglePerSegment - 90) * (Math.PI / 180);
    const radius = 180;
    const centerX = 200;
    const centerY = 200;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20 shadow-xl" data-testid="card-spin-wheel">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gift className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">Daily Spin Wheel</h2>
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          {canSpin ? (energy >= 15 ? 'Spin to win Casets! (Costs 15 energy)' : 'Need 15 energy to spin') : `Next spin: ${nextSpinTime}`}
        </p>
      </div>

      <div className="relative flex flex-col items-center justify-center mb-6">
        <div className="absolute top-0 z-20 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[35px] border-t-primary drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]" />
        </div>

        <div className="relative w-80 h-80 sm:w-96 sm:h-96">
          <motion.svg
            width="400"
            height="400"
            viewBox="0 0 400 400"
            className="w-full h-full drop-shadow-2xl"
            style={{ 
              rotate: rotation,
              willChange: 'transform',
            }}
            animate={{ 
              rotate: rotation,
            }}
            transition={{ 
              rotate: { duration: prefersReducedMotion ? 2 : 4, ease: [0.22, 0.61, 0.36, 1] },
            }}
          >
            <defs>
              {wheelSegments.map((segment, index) => (
                <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={segment.colors[0]} />
                  <stop offset="100%" stopColor={segment.colors[1]} />
                </linearGradient>
              ))}
            </defs>
            
            <circle cx="200" cy="200" r="194" fill="white" className="dark:fill-slate-800 text-white dark:text-slate-700" stroke="currentColor" strokeWidth="8" />
            
            {wheelSegments.map((segment, index) => {
              const anglePerSegment = 360 / wheelSegments.length;
              const middleAngle = (index * anglePerSegment + anglePerSegment / 2) * (Math.PI / 180);
              const textRadius = 120;
              const iconRadius = 85;
              const textX = 200 + textRadius * Math.sin(middleAngle);
              const textY = 200 - textRadius * Math.cos(middleAngle);
              const iconX = 200 + iconRadius * Math.sin(middleAngle);
              const iconY = 200 - iconRadius * Math.cos(middleAngle);
              
              return (
                <g key={index}>
                  <path
                    d={createWheelPath(index, wheelSegments.length)}
                    fill={`url(#gradient-${index})`}
                    stroke="white"
                    strokeWidth="2"
                    opacity="0.95"
                  />
                  
                  {typeof segment.icon === 'string' && segment.icon.startsWith('http') || segment.icon === casetIcon ? (
                    <image
                      href={segment.icon}
                      x={iconX - 20}
                      y={iconY - 20}
                      width="40"
                      height="40"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                    />
                  ) : (
                    <text
                      x={iconX}
                      y={iconY + 8}
                      textAnchor="middle"
                      fontSize="32"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                    >
                      {segment.icon}
                    </text>
                  )}
                  
                  <text
                    x={textX}
                    y={textY + 6}
                    textAnchor="middle"
                    fontSize="28"
                    fontWeight="900"
                    fill="white"
                    style={{ 
                      filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
                      textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                    }}
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}
            
            <circle cx="200" cy="200" r="55" fill="url(#center-gradient)" stroke="currentColor" strokeWidth="4" className="text-primary" />
            <defs>
              <linearGradient id="center-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="white" className="dark:stop-color-slate-700" />
                <stop offset="100%" stopColor="#f0f0f0" className="dark:stop-color-slate-800" />
              </linearGradient>
            </defs>
            
            <image
              href={casetIcon}
              x="168"
              y="168"
              width="64"
              height="64"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
            />
          </motion.svg>
        </div>
      </div>

      {wonAmount !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="text-center mb-4"
        >
          <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl shadow-2xl ${
            wonAmount === 0 
              ? 'bg-gradient-to-r from-gray-500 to-gray-600' 
              : 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500'
          }`}>
            {wonAmount !== 0 && (
              <img src={casetIcon} alt="Caset" className="w-8 h-8" />
            )}
            <p className="text-white font-bold text-xl">
              {wonAmount === 0 
                ? '😢 Better luck next time!' 
                : `🎉 You won ${wonAmount} Casets! 🎉`
              }
            </p>
            {wonAmount !== 0 && (
              <img src={casetIcon} alt="Caset" className="w-8 h-8" />
            )}
          </div>
        </motion.div>
      )}

      <motion.div
        whileHover={{ scale: (!canSpin || isSpinning || energy < 15) ? 1 : 1.02 }}
        whileTap={{ scale: (!canSpin || isSpinning || energy < 15) ? 1 : 0.95 }}
        style={{ willChange: 'transform' }}
      >
        <Button
          onClick={handleSpin}
          disabled={!canSpin || isSpinning || energy < 15}
          className="w-full h-14 text-lg font-bold shadow-lg"
          data-testid="button-spin"
        >
          {isSpinning ? (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-spin" />
              Spinning...
            </span>
          ) : !canSpin ? (
            'Come Back Tomorrow'
          ) : energy < 15 ? (
            'Not Enough Energy (Need 15)'
          ) : (
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ willChange: 'transform' }}
              className="flex items-center gap-2"
            >
              <img src={casetIcon} alt="Caset" className="w-5 h-5" />
              Spin Now! (-15 Energy)
            </motion.span>
          )}
        </Button>
      </motion.div>
    </Card>
  );
}
