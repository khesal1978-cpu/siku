import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Gamepad2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SpinWheel from '@/components/SpinWheel';
import { ScratchCardList } from '@/components/ScratchCard';
import DailyTasks from '@/components/DailyTasks';
import BoostCard from '@/components/BoostCard';
import EnergyDisplay from '@/components/EnergyDisplay';
import StreakDisplay from '@/components/StreakDisplay';
import CoinAnimation from '@/components/CoinAnimation';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import backgroundImage from '@assets/generated_images/Green_gradient_wave_background_201c0817.png';
import type { UserProfile, ScratchCard, Achievement, Boost } from '@shared/schema';
import { motion } from 'framer-motion';

export default function Games() {
  const { toast } = useToast();
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [animationAmount, setAnimationAmount] = useState(0);
  const userId = 'demo-user';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

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

  const getNextRefillTime = () => {
    if (!profile) return '5m';
    const now = new Date();
    const lastRefill = new Date(profile.lastEnergyRefill);
    const nextRefill = new Date(lastRefill.getTime() + 5 * 60 * 1000);
    const diff = nextRefill.getTime() - now.getTime();

    if (diff <= 0) return 'Now';
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  const multiplier = profile ? 1 + (profile.streak * 0.1) : 1;

  return (
    <motion.div 
      className="min-h-screen bg-background pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div 
        className="relative h-48 -mb-6"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="relative h-full flex items-end p-6 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Gamepad2 className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold font-['Poppins'] text-foreground drop-shadow-lg">
                Mini Games
              </h1>
            </div>
            <p className="text-sm text-muted-foreground drop-shadow">Play games to earn bonus coins</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div variants={itemVariants}>
            <EnergyDisplay 
              energy={profile?.energy ?? 100} 
              maxEnergy={profile?.maxEnergy ?? 100}
              nextRefillTime={getNextRefillTime()}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StreakDisplay 
              streak={profile?.streak ?? 0}
              multiplier={multiplier}
            />
          </motion.div>
        </div>

        <Tabs defaultValue="spin" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="spin" data-testid="tab-spin">Spin</TabsTrigger>
            <TabsTrigger value="scratch" data-testid="tab-scratch">Scratch</TabsTrigger>
            <TabsTrigger value="tasks" data-testid="tab-tasks">Tasks</TabsTrigger>
            <TabsTrigger value="boosts" data-testid="tab-boosts">Boosts</TabsTrigger>
          </TabsList>

          <TabsContent value="spin" className="mt-4">
            <motion.div variants={itemVariants}>
              <SpinWheel
                onSpin={handleSpin}
                canSpin={lastSpin?.canSpin ?? true}
                nextSpinTime={lastSpin?.nextSpinTime}
                energy={profile?.energy ?? 100}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="scratch" className="mt-4">
            <motion.div variants={itemVariants}>
              <ScratchCardList
                cards={scratchCards}
                onScratchCard={handleScratchCard}
                onGetNewCard={handleGetNewCard}
                canGetNewCard={(profile?.energy ?? 0) >= 10}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <motion.div variants={itemVariants}>
              <DailyTasks
                achievements={achievements}
                onClaimReward={handleClaimAchievement}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="boosts" className="mt-4">
            <motion.div variants={itemVariants}>
              <BoostCard
                boosts={boosts}
                onActivateBoost={handleActivateBoost}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      <CoinAnimation
        amount={animationAmount}
        show={showCoinAnimation}
        onComplete={() => setShowCoinAnimation(false)}
      />
    </motion.div>
  );
}