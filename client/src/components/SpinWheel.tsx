import { useState } from 'react';
import { motion } from 'framer-motion';
import { CircleDot, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SpinWheelProps {
  onSpin: () => Promise<number>;
  canSpin: boolean;
  nextSpinTime?: string;
  energy: number;
}

const wheelSegments = [
  { reward: 0, color: 'from-gray-400 to-gray-500', label: 'Unlucky', emoji: '😢' },
  { reward: 30, color: 'from-green-400 to-green-500', label: '30', emoji: '💰' },
  { reward: 60, color: 'from-emerald-400 to-emerald-500', label: '60', emoji: '💎' },
  { reward: 100, color: 'from-blue-400 to-blue-500', label: '100', emoji: '🎁' },
  { reward: 400, color: 'from-purple-400 to-purple-500', label: '400', emoji: '🌟' },
  { reward: 1000, color: 'from-yellow-400 to-amber-500', label: '1000', emoji: '🏆' },
];

export default function SpinWheel({ onSpin, canSpin, nextSpinTime, energy }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonAmount, setWonAmount] = useState<number | null>(null);

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
      const spins = 5;
      const totalRotation = baseRotation + (spins * 360) + (360 - targetAngle);
      
      setRotation(totalRotation);

      setTimeout(() => {
        setWonAmount(reward);
        setIsSpinning(false);
      }, 4000);
    } catch (error) {
      setIsSpinning(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20" data-testid="card-spin-wheel">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gift className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold font-['Poppins']">Daily Spin Wheel</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {canSpin ? (energy >= 15 ? 'Spin the wheel to win coins! (Costs 15 energy)' : 'Need 15 energy to spin') : `Next spin: ${nextSpinTime}`}
        </p>
      </div>

      <div className="relative flex flex-col items-center justify-center mb-6">
        <div className="absolute top-0 z-10">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-primary drop-shadow-lg" />
        </div>

        <div className="relative w-72 h-72" style={{ perspective: '1000px' }}>
          <motion.div
            className="w-full h-full rounded-full relative overflow-hidden shadow-2xl border-8 border-primary/40"
            style={{ 
              rotate: rotation,
              transformStyle: 'preserve-3d',
            }}
            animate={{ 
              rotate: rotation,
            }}
            whileHover={{
              scale: 1.05,
              rotateX: 5,
              rotateY: 5,
            }}
            transition={{ 
              rotate: { duration: 4, ease: [0.34, 1.56, 0.64, 1] },
              scale: { duration: 0.3 },
              rotateX: { duration: 0.3 },
              rotateY: { duration: 0.3 },
            }}
          >
            {wheelSegments.map((segment, index) => {
              const angle = (360 / wheelSegments.length) * index;
              return (
                <div
                  key={index}
                  className={`absolute w-full h-full bg-gradient-to-br ${segment.color}`}
                  style={{
                    clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle - 22.5) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle - 22.5) * Math.PI / 180)}%, ${50 + 50 * Math.cos((angle + 22.5) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle + 22.5) * Math.PI / 180)}%)`,
                  }}
                >
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-35%)`,
                    }}
                  >
                    <span className="text-2xl mb-1">{segment.emoji}</span>
                    <span className="text-lg">{segment.label}</span>
                  </div>
                </div>
              );
            })}
            
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-full shadow-2xl flex items-center justify-center border-4 border-primary relative overflow-hidden"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(var(--primary), 0.3)',
                    '0 0 40px rgba(var(--primary), 0.6)',
                    '0 0 20px rgba(var(--primary), 0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full" />
                <CircleDot className="w-10 h-10 text-primary relative z-10" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {wonAmount !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-center mb-4"
        >
          <div className={`inline-block px-6 py-3 rounded-full shadow-lg ${
            wonAmount === 0 
              ? 'bg-gradient-to-r from-gray-400 to-gray-500' 
              : 'bg-gradient-to-r from-yellow-400 to-amber-500'
          }`}>
            <p className="text-white font-bold text-xl">
              {wonAmount === 0 
                ? '😢 Better luck next time! 😢' 
                : `🎉 You won ${wonAmount} CASET! 🎉`
              }
            </p>
          </div>
        </motion.div>
      )}

      <motion.div
        whileHover={{ scale: (!canSpin || isSpinning || energy < 15) ? 1 : 1.02 }}
        whileTap={{ scale: (!canSpin || isSpinning || energy < 15) ? 1 : 0.98 }}
      >
        <Button
          onClick={handleSpin}
          disabled={!canSpin || isSpinning || energy < 15}
          className="w-full h-12 text-lg font-semibold"
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
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Spin Now! (-15 Energy)
            </motion.span>
          )}
        </Button>
      </motion.div>
    </Card>
  );
}
