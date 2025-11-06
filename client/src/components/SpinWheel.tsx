import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import casetIcon from '@assets/ChatGPT Image Nov 5, 2025, 06_57_27 PM_1762426824094.png';

interface SpinWheelProps {
  onSpin: () => Promise<number>;
  canSpin: boolean;
  nextSpinTime?: string;
  energy: number;
}

const wheelSegments = [
  { reward: 0, color: 'from-gray-500 to-gray-600', borderColor: 'border-gray-600', label: 'Unlucky', textColor: 'text-white' },
  { reward: 30, color: 'from-emerald-400 to-emerald-500', borderColor: 'border-emerald-500', label: '30', textColor: 'text-white' },
  { reward: 60, color: 'from-teal-400 to-teal-500', borderColor: 'border-teal-500', label: '60', textColor: 'text-white' },
  { reward: 100, color: 'from-blue-400 to-blue-500', borderColor: 'border-blue-500', label: '100', textColor: 'text-white' },
  { reward: 400, color: 'from-purple-400 to-purple-500', borderColor: 'border-purple-500', label: '400', textColor: 'text-white' },
  { reward: 1000, color: 'from-amber-400 to-orange-500', borderColor: 'border-orange-500', label: '1000', textColor: 'text-white' },
];

export default function SpinWheel({ onSpin, canSpin, nextSpinTime, energy }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonAmount, setWonAmount] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return;

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
          <motion.div
            className="w-full h-full rounded-full relative overflow-hidden shadow-2xl border-[6px] border-white dark:border-slate-700"
            style={{ 
              rotate: rotation,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            animate={{ 
              rotate: rotation,
            }}
            transition={{ 
              rotate: { duration: prefersReducedMotion ? 2 : 4, ease: [0.22, 0.61, 0.36, 1] },
            }}
          >
            {wheelSegments.map((segment, index) => {
              const angle = (360 / wheelSegments.length) * index;
              const nextAngle = (360 / wheelSegments.length) * (index + 1);
              
              return (
                <div
                  key={index}
                  className={`absolute w-full h-full bg-gradient-to-br ${segment.color} border-r border-white/20`}
                  style={{
                    clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle - 30) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle - 30) * Math.PI / 180)}%, ${50 + 50 * Math.cos((angle + 30) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle + 30) * Math.PI / 180)}%)`,
                    willChange: 'transform',
                  }}
                >
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-start gap-2 pt-8"
                    style={{
                      transform: `rotate(${angle + 30}deg)`,
                      transformOrigin: 'center center',
                    }}
                  >
                    {segment.reward !== 0 ? (
                      <>
                        <img 
                          src={casetIcon} 
                          alt="Caset" 
                          className="w-12 h-12 drop-shadow-lg"
                        />
                        <span className={`text-2xl font-black ${segment.textColor} drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]`}>
                          {segment.label}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl mb-1">😢</div>
                        <span className={`text-lg font-bold ${segment.textColor} drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]`}>
                          {segment.label}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div 
                className="w-24 h-24 bg-gradient-to-br from-white via-gray-50 to-white dark:from-slate-700 dark:via-slate-800 dark:to-slate-700 rounded-full shadow-2xl flex items-center justify-center border-4 border-primary relative overflow-hidden"
                style={{ willChange: 'box-shadow' }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(20, 184, 166, 0.4)',
                    '0 0 40px rgba(20, 184, 166, 0.6)',
                    '0 0 20px rgba(20, 184, 166, 0.4)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 rounded-full" />
                <img 
                  src={casetIcon} 
                  alt="Caset Logo" 
                  className="w-16 h-16 relative z-10 drop-shadow-lg"
                />
              </motion.div>
            </div>
          </motion.div>
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
