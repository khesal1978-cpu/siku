import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Gamepad2, Zap, TrendingUp, GiftIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SpinWheel from '@/components/SpinWheel';
import { ScratchCardList } from '@/components/ScratchCard';
import DailyTasks from '@/components/DailyTasks';
import BoostCard from '@/components/BoostCard';
import CoinAnimation from '@/components/CoinAnimation';
import PageHeader from '@/components/PageHeader';
import Card3D from '@/components/Card3D';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import type { UserProfile, ScratchCard, Achievement, Boost } from '@shared/schema';
import { motion } from 'framer-motion';

export default function Games() {
  const { toast } = useToast();
  const { userId } = useAuth();
  const { subscribe } = useWebSocket();
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [animationAmount, setAnimationAmount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const unsubscribeProfile = subscribe('profile_updated', (data: UserProfile) => {
      queryClient.setQueryData(['/api/profile', userId], data);
    });

    const unsubscribeBoost = subscribe('boost_activated', (data: any) => {
      queryClient.setQueryData(['/api/profile', userId], data.profile);
      queryClient.invalidateQueries({ queryKey: ['/api/boosts', userId] });
    });

    const unsubscribeAchievement = subscribe('achievement_claimed', (data: any) => {
      queryClient.setQueryData(['/api/profile', userId], data.profile);
      queryClient.invalidateQueries({ queryKey: ['/api/achievements', userId] });
    });

    return () => {
      unsubscribeProfile();
      unsubscribeBoost();
      unsubscribeAchievement();
    };
  }, [userId, subscribe]);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['/api/profile', userId],
  });

  const { data: scratchCards = [] } = useQuery<ScratchCard[]>({
    queryKey: ['/api/scratch-cards', userId],
  });

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements', userId],
  });

  const { data: boosts = [] } = useQuery<Boost[]>({
    queryKey: ['/api/boosts', userId],
  });

  const { data: lastSpin } = useQuery<{ canSpin: boolean; nextSpinTime?: string }>({
    queryKey: ['/api/spin/can-spin', userId],
  });

  const spinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/spin/${userId}`);
      return response.json();
    },
    onSuccess: (data) => {
      setAnimationAmount(data.reward);
      setShowCoinAnimation(true);
      queryClient.invalidateQueries({ queryKey: ['/api/profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/spin/can-spin', userId] });
      toast({
        title: 'Spin Complete!',
        description: `You won ${data.reward} CASET coins!`,
      });
    },
  });

  const scratchCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      const response = await apiRequest('POST', `/api/scratch-card/${cardId}`);
      return response.json();
    },
    onSuccess: (data) => {
      setAnimationAmount(data.reward);
      setShowCoinAnimation(true);
      queryClient.invalidateQueries({ queryKey: ['/api/profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/scratch-cards', userId] });
      toast({
        title: 'Card Scratched!',
        description: `You won ${data.reward} CASET coins!`,
      });
    },
  });

  const newCardMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/scratch-card/new/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/scratch-cards', userId] });
      toast({
        title: 'New Card!',
        description: 'You got a new scratch card!',
      });
    },
  });

  const claimAchievementMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      const response = await apiRequest('POST', `/api/achievement/${achievementId}/claim`);
      return response.json();
    },
    onSuccess: (data) => {
      setAnimationAmount(data.reward);
      setShowCoinAnimation(true);
      queryClient.invalidateQueries({ queryKey: ['/api/profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/achievements', userId] });
      toast({
        title: 'Achievement Claimed!',
        description: `You earned ${data.reward} CASET coins!`,
      });
    },
  });

  const activateBoostMutation = useMutation({
    mutationFn: async (boostType: string) => {
      const response = await apiRequest('POST', `/api/boost/activate/${userId}`, { boostType });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/boosts', userId] });
      toast({
        title: 'Boost Activated!',
        description: 'Your mining speed has been increased!',
      });
    },
  });

  const handleSpin = async () => {
    const data = await spinMutation.mutateAsync();
    return data.reward;
  };

  const handleScratchCard = async (cardId: string) => {
    await scratchCardMutation.mutateAsync(cardId);
  };

  const handleGetNewCard = async () => {
    await newCardMutation.mutateAsync();
  };

  const handleClaimAchievement = async (achievementId: string) => {
    await claimAchievementMutation.mutateAsync(achievementId);
  };

  const handleActivateBoost = async (boostType: string) => {
    await activateBoostMutation.mutateAsync(boostType);
  };

  const multiplier = profile ? 1 + (profile.streak * 0.1) : 1;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 pb-28">
      <div className="absolute inset-x-0 top-0 h-80 overflow-hidden bg-gradient-to-b from-teal-400/30 via-teal-100/30 to-transparent dark:from-teal-900/20 dark:via-teal-950/10">
        <div className="absolute -top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-500/20 dark:bg-teal-500/10 blur-3xl"></div>
        <div className="absolute top-10 -left-20 h-64 w-64 rounded-full bg-teal-500/15 dark:bg-teal-500/10 blur-3xl"></div>
        <div className="absolute top-5 -right-20 h-64 w-64 rounded-full bg-teal-400/15 dark:bg-teal-400/10 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <PageHeader title="Mini Games" subtitle="Play games to earn bonus coins" />

        <div className="px-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Card3D intensity="low">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-4 shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="w-6 h-6 text-green-500" fill="currentColor" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Energy</span>
                    </div>
                    <span className="font-bold text-green-500" data-testid="text-energy">{profile?.energy ?? 100}/{profile?.maxEnergy ?? 100}</span>
                  </div>
                  <div className="mt-3 h-3.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 p-0.5">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] transition-all relative overflow-hidden"
                      style={{ width: `${((profile?.energy ?? 100) / (profile?.maxEnergy ?? 100)) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    </div>
                  </div>
                  <p className="mt-2 text-center text-xs font-medium text-green-600">
                    {(profile?.energy ?? 100) === (profile?.maxEnergy ?? 100) ? 'Fully Charged!' : 'Recharging...'}
                  </p>
                </div>
              </motion.div>
            </Card3D>

            <div className="grid grid-cols-2 gap-4">
              <Card3D intensity="medium">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 p-4 text-white shadow-lg shadow-teal-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50" />
                  <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-white/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2">
                      <GiftIcon className="w-5 h-5 opacity-80" />
                      <p className="text-sm font-medium">Login Streak</p>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-4xl font-bold drop-shadow-lg" data-testid="text-streak">{profile?.streak ?? 0}</span>
                      <span className="text-lg font-semibold">Days</span>
                    </div>
                  </div>
                </motion.div>
              </Card3D>
              <Card3D intensity="medium">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 text-white shadow-lg shadow-amber-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50" />
                  <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-white/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 opacity-80" />
                      <p className="text-sm font-medium">Multiplier</p>
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-4xl font-bold drop-shadow-lg" data-testid="text-multiplier">{multiplier.toFixed(1)}x</span>
                    </div>
                  </div>
                </motion.div>
              </Card3D>
            </div>
          </div>

          <div className="mb-6 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 flex justify-between">
            <Tabs defaultValue="spin" className="w-full">
              <TabsList className="grid w-full grid-cols-4 p-1 bg-transparent">
                <TabsTrigger value="spin" data-testid="tab-spin" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-primary data-[state=active]:shadow-sm">Spin</TabsTrigger>
                <TabsTrigger value="scratch" data-testid="tab-scratch" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-primary data-[state=active]:shadow-sm">Scratch</TabsTrigger>
                <TabsTrigger value="tasks" data-testid="tab-tasks" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-primary data-[state=active]:shadow-sm">Tasks</TabsTrigger>
                <TabsTrigger value="boosts" data-testid="tab-boosts" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-primary data-[state=active]:shadow-sm">Boosts</TabsTrigger>
              </TabsList>

              <TabsContent value="spin" className="mt-6">
                <SpinWheel
                  onSpin={handleSpin}
                  canSpin={lastSpin?.canSpin ?? true}
                  nextSpinTime={lastSpin?.nextSpinTime}
                  energy={profile?.energy ?? 100}
                />
              </TabsContent>

              <TabsContent value="scratch" className="mt-6">
                <ScratchCardList
                  cards={scratchCards}
                  onScratchCard={handleScratchCard}
                  onGetNewCard={handleGetNewCard}
                  canGetNewCard={(profile?.energy ?? 0) >= 10}
                />
              </TabsContent>

              <TabsContent value="tasks" className="mt-6">
                <DailyTasks
                  achievements={achievements}
                  onClaimReward={handleClaimAchievement}
                />
              </TabsContent>

              <TabsContent value="boosts" className="mt-6">
                <BoostCard
                  boosts={boosts}
                  onActivateBoost={handleActivateBoost}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <CoinAnimation
        amount={animationAmount}
        show={showCoinAnimation}
        onComplete={() => setShowCoinAnimation(false)}
      />
    </div>
  );
}
