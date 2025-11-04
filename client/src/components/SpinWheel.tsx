import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SpinWheelProps {
  onSpin: () => Promise<number>;
  canSpin: boolean;
  nextSpinTime?: string;
  energy: number;
}

const wheelSegments = [
  { reward: 50, color: 'from-green-400 to-green-500', label: '50' },
  { reward: 100, color: 'from-emerald-400 to-emerald-500', label: '100' },
  { reward: 25, color: 'from-green-300 to-green-400', label: '25' },
  { reward: 200, color: 'from-emerald-500 to-emerald-600', label: '200' },
  { reward: 75, color: 'from-green-400 to-green-500', label: '75' },
  { reward: 500, color: 'from-yellow-400 to-yellow-500', label: '500' },
  { reward: 150, color: 'from-emerald-400 to-emerald-500', label: '150' },
  { reward: 1000, color: 'from-amber-400 to-amber-500', label: '1000' },
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

        <div className="relative w-72 h-72">
          <motion.div
            className="w-full h-full rounded-full relative overflow-hidden shadow-2xl border-4 border-primary/30"
            style={{ rotate: rotation }}
            animate={{ 
              rotate: rotation,
              scale: isSpinning ? [1, 1.05, 1] : 1,
            }}
            transition={{ 
              rotate: { duration: 4, ease: [0.34, 1.56, 0.64, 1] },
              scale: { duration: 0.3, repeat: isSpinning ? Infinity : 0 }
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
                    className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-35%)`,
                    }}
                  >
                    {segment.label}
                  </div>
                </div>
              );
            })}
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-primary">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {wonAmount && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-4"
        >
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-lg">
            <p className="text-white font-bold text-xl">
              🎉 You won {wonAmount} CASET! 🎉
            </p>
          </div>
        </motion.div>
      )}

      <Button
        onClick={handleSpin}
        disabled={!canSpin || isSpinning || energy < 15}
        className="w-full h-12 text-lg font-semibold"
        data-testid="button-spin"
      >
        {isSpinning ? (
          <span className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
            Spinning...
          </span>
        ) : !canSpin ? (
          'Come Back Tomorrow'
        ) : energy < 15 ? (
          'Not Enough Energy (Need 15)'
        ) : (
          'Spin Now! (-15 Energy)'
        )}
      </Button>
    </Card>
  );
}
