import { motion } from 'framer-motion';
import { Rocket, Clock, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Boost } from '@shared/schema';

interface BoostCardProps {
  boosts: Boost[];
  onActivateBoost?: (boostType: string) => Promise<void>;
}

const boostTypes = [
  {
    type: '2x_speed',
    name: '2x Mining Speed',
    multiplier: 2,
    duration: 3600,
    cost: 100,
    energyCost: 20,
    description: 'Double your mining speed for 1 hour',
    icon: Rocket,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    type: '3x_speed',
    name: '3x Mining Speed',
    multiplier: 3,
    duration: 1800,
    cost: 200,
    energyCost: 30,
    description: 'Triple your mining speed for 30 minutes',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-500',
  },
  {
    type: '5x_speed',
    name: '5x Mining Speed',
    multiplier: 5,
    duration: 900,
    cost: 500,
    energyCost: 50,
    description: '5x mining speed for 15 minutes',
    icon: Rocket,
    color: 'from-amber-500 to-orange-500',
  },
];

export default function BoostCard({ boosts, onActivateBoost }: BoostCardProps) {
  const activeBoosts = boosts.filter(b => b.isActive);

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = new Date(expiresAt).getTime() - now.getTime();
    if (diff <= 0) return '0s';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  const getProgress = (startedAt: Date, expiresAt: Date) => {
    const now = new Date();
    const start = new Date(startedAt).getTime();
    const end = new Date(expiresAt).getTime();
    const current = now.getTime();
    
    if (current >= end) return 0;
    if (current <= start) return 100;
    
    return ((end - current) / (end - start)) * 100;
  };

  return (
    <div className="space-y-4">
      {activeBoosts.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5" data-testid="card-active-boosts">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Active Boosts
          </h3>
          <div className="space-y-3">
            {activeBoosts.map((boost) => {
              const boostInfo = boostTypes.find(b => b.type === boost.boostType);
              if (!boostInfo) return null;

              const progress = getProgress(boost.startedAt, boost.expiresAt);
              const timeRemaining = getTimeRemaining(boost.expiresAt);

              return (
                <motion.div
                  key={boost.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`p-3 rounded-lg bg-gradient-to-r ${boostInfo.color} text-white`}
                  data-testid={`boost-active-${boost.boostType}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <boostInfo.icon className="w-5 h-5" />
                      <span className="font-semibold">{boost.multiplier}x Speed</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="w-4 h-4" />
                      {timeRemaining}
                    </div>
                  </div>
                  <Progress value={progress} className="h-2 bg-white/30" />
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="p-6" data-testid="card-boost-shop">
        <h3 className="font-bold text-xl mb-4 font-['Poppins']">Mining Boosts</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Activate boosts to increase your mining speed temporarily
        </p>
        
        <div className="grid gap-3">
          {boostTypes.map((boost) => (
            <Card 
              key={boost.type} 
              className={`p-4 bg-gradient-to-br ${boost.color} text-white hover:shadow-lg transition-shadow`}
              data-testid={`boost-option-${boost.type}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <boost.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{boost.name}</h4>
                    <p className="text-sm opacity-90">{boost.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Duration: {boost.duration / 60} min
                  </div>
                  <div className="text-xs opacity-80">
                    Cost: {boost.cost} CASET + {boost.energyCost} Energy
                  </div>
                </div>
                <Button
                  onClick={() => onActivateBoost?.(boost.type)}
                  variant="secondary"
                  size="sm"
                  className="font-semibold"
                  data-testid={`button-activate-${boost.type}`}
                >
                  Activate
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
