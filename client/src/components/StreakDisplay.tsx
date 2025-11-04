import { motion } from 'framer-motion';
import { Flame, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StreakDisplayProps {
  streak: number;
  multiplier: number;
}

export default function StreakDisplay({ streak, multiplier }: StreakDisplayProps) {
  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { color: 'from-purple-500 to-pink-500', label: 'Legend' };
    if (streak >= 14) return { color: 'from-amber-500 to-orange-500', label: 'Master' };
    if (streak >= 7) return { color: 'from-yellow-400 to-amber-500', label: 'Expert' };
    if (streak >= 3) return { color: 'from-emerald-400 to-green-500', label: 'Rising' };
    return { color: 'from-blue-400 to-cyan-500', label: 'Beginner' };
  };

  const streakLevel = getStreakLevel(streak);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
      style={{ willChange: 'opacity, transform' }}
    >
    <Card className={`p-6 bg-gradient-to-br ${streakLevel.color} text-white overflow-hidden relative shadow-xl`} data-testid="card-streak" style={{ willChange: 'transform' }}>
      <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-br from-white/10 to-transparent" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Flame className="w-8 h-8" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold font-['Poppins']">Login Streak</h3>
              <p className="text-xs opacity-90">{streakLevel.label} Status</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{streak}</div>
            <div className="text-xs opacity-90">Days</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/20 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Mining Multiplier</span>
          </div>
          <div className="text-2xl font-bold">
            {multiplier.toFixed(1)}x
          </div>
        </div>

        <div className="mt-4 text-xs opacity-90 text-center">
          Login daily to keep your streak and increase your earnings!
        </div>
      </div>
    </Card>
    </motion.div>
  );
}
