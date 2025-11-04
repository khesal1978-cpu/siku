import { motion } from 'framer-motion';
import { Battery, BatteryCharging, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface EnergyDisplayProps {
  energy: number;
  maxEnergy: number;
  nextRefillTime?: string;
}

export default function EnergyDisplay({ energy, maxEnergy, nextRefillTime }: EnergyDisplayProps) {
  const percentage = (energy / maxEnergy) * 100;
  const isLow = percentage < 30;
  const isFull = energy === maxEnergy;

  const getEnergyColor = () => {
    if (isFull) return 'from-green-500 to-emerald-500';
    if (isLow) return 'from-red-500 to-orange-500';
    return 'from-yellow-400 to-amber-500';
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-background to-primary/5" data-testid="card-energy">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={!isFull ? {
              scale: [1, 1.1, 1],
            } : {}}
            transition={{
              duration: 1,
              repeat: isLow ? Infinity : 0,
              repeatType: "reverse",
            }}
            className={`w-12 h-12 rounded-full bg-gradient-to-br ${getEnergyColor()} flex items-center justify-center`}
          >
            {isFull ? (
              <Battery className="w-6 h-6 text-white" />
            ) : (
              <BatteryCharging className="w-6 h-6 text-white" />
            )}
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">Energy</span>
              <motion.span
                key={energy}
                initial={{ scale: 1.3, color: isLow ? '#ef4444' : '#f59e0b' }}
                animate={{ scale: 1, color: 'inherit' }}
                transition={{ duration: 0.3 }}
                className="text-sm font-bold"
              >
                {energy}/{maxEnergy}
              </motion.span>
            </div>

            <div className="relative">
              <Progress value={percentage} className="h-2" />
              <motion.div
                className="absolute top-0 left-0 h-2 rounded-full bg-white/30"
                initial={{ width: '0%' }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>

            {!isFull && nextRefillTime && (
              <div className="flex items-center gap-1 mt-1">
                <Zap className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Refills: {nextRefillTime}
                </span>
              </div>
            )}

            {isFull && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold"
              >
                Fully Charged!
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {isLow && !isFull && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-3 p-2 bg-orange-100 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg"
        >
          <p className="text-xs text-orange-700 dark:text-orange-300 text-center">
            Low energy! Energy refills 1 point every 5 minutes
          </p>
        </motion.div>
      )}
    </Card>
  );
}