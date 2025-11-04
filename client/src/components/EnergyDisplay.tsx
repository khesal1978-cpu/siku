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
    <Card className="p-4 glass-card dark:glass-card-dark bg-gradient-to-br from-background to-primary/5" data-testid="card-energy" style={{ willChange: 'transform' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-12 h-12 rounded-full bg-gradient-to-br ${getEnergyColor()} flex items-center justify-center`}
            animate={!isFull ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ willChange: 'transform' }}
          >
            {isFull ? (
              <Battery className="w-6 h-6 text-white" />
            ) : (
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <BatteryCharging className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">Energy</span>
              <span
                className={`text-sm font-bold transition-colors duration-300 ${
                  isLow ? 'text-red-500' : isFull ? 'text-green-500' : 'text-yellow-500'
                }`}
              >
                {energy}/{maxEnergy}
              </span>
            </div>

            <div className="relative">
              <Progress value={percentage} className="h-2" />
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
              <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold">
                Fully Charged!
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {isLow && !isFull && (
        <div className="mt-3 p-2 bg-orange-100 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-xs text-orange-700 dark:text-orange-300 text-center">
            Low energy! Energy refills 1 point every 5 minutes
          </p>
        </div>
      )}
    </Card>
  );
}