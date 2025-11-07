import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Clock, TrendingUp, Zap, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Boost } from '@shared/schema';
import casetIcon from '@assets/ChatGPT Image Nov 5, 2025, 06_57_27 PM_1762426824094.png';
import Card3D from '@/components/Card3D';

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
  const [now, setNow] = useState(new Date());
  const activeBoosts = boosts.filter(b => b.isActive);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = (expiresAt: Date) => {
    const diff = new Date(expiresAt).getTime() - now.getTime();
    if (diff <= 0) return '0s';
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  const getProgress = (startedAt: Date, expiresAt: Date) => {
    const start = new Date(startedAt).getTime();
    const end = new Date(expiresAt).getTime();
    const current = now.getTime();
    
    if (current >= end) return 0;
    if (current <= start) return 100;
    
    return ((end - current) / (end - start)) * 100;
  };

  const isBoostActive = (boostType: string) => {
    return activeBoosts.some(b => b.boostType === boostType);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {activeBoosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/30 shadow-lg relative overflow-hidden" data-testid="card-active-boosts">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-teal-600 shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl font-['Poppins']">Active Boosts</h3>
                    <p className="text-sm text-muted-foreground">Your mining is supercharged!</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {activeBoosts.map((boost, index) => {
                    const boostInfo = boostTypes.find(b => b.type === boost.boostType);
                    if (!boostInfo) return null;

                    const progress = getProgress(boost.startedAt, boost.expiresAt);
                    const timeRemaining = getTimeRemaining(boost.expiresAt);

                    return (
                      <motion.div
                        key={boost.id}
                        initial={{ scale: 0.95, opacity: 0, x: -20 }}
                        animate={{ scale: 1, opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative p-4 rounded-xl bg-gradient-to-br ${boostInfo.color} text-white shadow-lg overflow-hidden`}
                        data-testid={`boost-active-${boost.boostType}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                                <boostInfo.icon className="w-6 h-6" />
                              </div>
                              <div>
                                <span className="font-bold text-lg">{boost.multiplier}x Speed</span>
                                <p className="text-xs opacity-90">Mining Boost Active</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1.5 text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                <Clock className="w-4 h-4" />
                                {timeRemaining}
                              </div>
                              <span className="text-xs opacity-75">{Math.round(progress)}% remaining</span>
                            </div>
                          </div>
                          <div className="relative">
                            <Progress value={progress} className="h-3 bg-white/20 border border-white/30" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="p-6 bg-gradient-to-br from-background to-muted/20 border-muted shadow-md" data-testid="card-boost-shop">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-6 h-6 text-primary" />
          <h3 className="font-bold text-2xl font-['Poppins']">Mining Boosts</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Supercharge your mining speed with temporary boosts
        </p>
        
        <div className="grid gap-4">
          {boostTypes.map((boost, index) => {
            const active = isBoostActive(boost.type);
            return (
              <Card3D key={boost.type} intensity="medium">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-5 rounded-xl overflow-hidden transition-all ${
                    active 
                      ? 'opacity-60 bg-muted' 
                      : `bg-gradient-to-br ${boost.color} hover:shadow-xl shadow-lg`
                  }`}
                  data-testid={`boost-option-${boost.type}`}
                >
                  {!active && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                      <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-white/10 rounded-full blur-3xl" />
                    </>
                  )}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          active ? 'bg-muted-foreground/20' : 'bg-white/20 backdrop-blur-sm shadow-lg'
                        }`}>
                          <boost.icon className={`w-7 h-7 ${active ? 'text-muted-foreground' : 'text-white'}`} />
                        </div>
                        <div>
                          <h4 className={`font-bold text-lg mb-1 ${active ? 'text-muted-foreground' : 'text-white'}`}>
                            {boost.name}
                          </h4>
                          <p className={`text-sm ${active ? 'text-muted-foreground/70' : 'text-white/90'}`}>
                            {boost.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-white/20">
                      <div className="space-y-1.5">
                        <div className={`flex items-center gap-2 text-sm font-medium ${active ? 'text-muted-foreground' : 'text-white/95'}`}>
                          <Clock className="w-4 h-4" />
                          <span>{boost.duration / 60} minutes</span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${active ? 'text-muted-foreground/70' : 'text-white/75'}`}>
                          <img src={casetIcon} alt="Caset" className="w-4 h-4" />
                          <span>{boost.cost} CASET</span>
                          <span>•</span>
                          <Zap className="w-3 h-3" />
                          <span>{boost.energyCost} Energy</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => onActivateBoost?.(boost.type)}
                        disabled={active}
                        variant={active ? "ghost" : "secondary"}
                        size="lg"
                        className={`font-bold ${active ? '' : 'hover:scale-105 transition-transform'}`}
                        data-testid={`button-activate-${boost.type}`}
                      >
                        {active ? 'Active' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </Card3D>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
