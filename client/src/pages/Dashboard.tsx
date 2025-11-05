import { useState, useEffect } from 'react';
import { Zap, TrendingUp, Clock, Users } from 'lucide-react';
import MiningButton from '@/components/MiningButton';
import CoinDisplay from '@/components/CoinDisplay';
import StatsCard from '@/components/StatsCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import backgroundImage from '@assets/generated_images/Green_gradient_wave_background_201c0817.png';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, MiningSession } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { userId } = useAuth();
  const { subscribe } = useWebSocket();
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['/api/profile', userId],
    enabled: !!userId,
  });

  const { data: miningSession, isLoading: miningLoading } = useQuery<MiningSession | null>({
    queryKey: ['/api/mining', userId],
    enabled: !!userId,
  });

  const startMiningMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/mining/start/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mining', userId] });
      toast({
        title: "Mining Started",
        description: "Your 6-hour mining session has begun!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start mining",
        variant: "destructive",
      });
    },
  });

  const claimMiningMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/mining/claim/${userId}`),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/mining', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/profile', userId] });
      toast({
        title: "Mining Claimed!",
        description: `You earned ${data.coinsEarned.toFixed(2)} CASET!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to claim mining",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribe('profile_updated', (data: UserProfile) => {
      queryClient.setQueryData(['/api/profile', userId], data);
    });

    const unsubscribeMining = subscribe('mining_started', (data: MiningSession) => {
      queryClient.setQueryData(['/api/mining', userId], data);
    });

    const unsubscribeClaimed = subscribe('mining_claimed', (data: any) => {
      queryClient.setQueryData(['/api/profile', userId], data.profile);
      queryClient.setQueryData(['/api/mining', userId], null);
    });

    return () => {
      unsubscribe();
      unsubscribeMining();
      unsubscribeClaimed();
    };
  }, [userId, subscribe]);

  useEffect(() => {
    if (!miningSession?.isActive) {
      setProgress(0);
      setTimeRemaining('');
      return;
    }

    const updateProgress = () => {
      const now = new Date();
      const startedAt = new Date(miningSession.startedAt);
      const endsAt = new Date(miningSession.endsAt);
      
      const totalDuration = endsAt.getTime() - startedAt.getTime();
      const elapsed = now.getTime() - startedAt.getTime();
      const remaining = endsAt.getTime() - now.getTime();

      if (remaining <= 0) {
        setProgress(100);
        setTimeRemaining('Ready to claim!');
      } else {
        const progressPercent = (elapsed / totalDuration) * 100;
        setProgress(Math.min(100, Math.max(0, progressPercent)));

        const hoursLeft = Math.floor(remaining / (1000 * 60 * 60));
        const minutesLeft = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hoursLeft}h ${minutesLeft}m`);
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);

    return () => clearInterval(interval);
  }, [miningSession]);

  const handleMine = () => {
    if (miningSession?.isActive) {
      if (progress >= 100) {
        claimMiningMutation.mutate();
      }
    } else {
      startMiningMutation.mutate();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  if (profileLoading || !profile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="px-4 pt-6 space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-64 mx-auto rounded-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const miningSpeed = profile.miningSpeed * profile.miningMultiplier;
  const isMining = miningSession?.isActive || false;

  return (
    <motion.div 
      className="min-h-screen bg-background pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div 
        className="relative h-56 -mb-8"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="relative h-full flex items-end p-6 pb-12">
          <div>
            <motion.h1 
              className="text-3xl font-bold font-['Poppins'] text-foreground mb-1 drop-shadow-lg"
              variants={itemVariants}
            >
              Mining Dashboard
            </motion.h1>
            <motion.p 
              className="text-sm text-muted-foreground drop-shadow"
              variants={itemVariants}
            >
              Keep mining to earn more rewards
            </motion.p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        <motion.div variants={itemVariants}>
          <CoinDisplay amount={profile.balance} label="Mining Balance" size="xl" data-testid="text-balance" />
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-center py-6">
          <MiningButton 
            isActive={isMining} 
            progress={progress} 
            onMine={handleMine}
            data-testid="button-mine"
          />
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-3">
          <StatsCard 
            icon={Zap} 
            label="Mining Speed" 
            value={`${miningSpeed.toFixed(1)} CASET/hr`}
            subtext={profile.miningMultiplier > 1 ? `${profile.miningMultiplier}x multiplier active` : undefined}
            variant="highlight"
            data-testid="text-mining-speed"
          />
          <StatsCard 
            icon={TrendingUp} 
            label="Total Mined" 
            value={profile.totalMined.toLocaleString()}
            data-testid="text-total-mined"
          />
          <StatsCard 
            icon={Clock} 
            label={isMining ? "Time Remaining" : "Next Mining"} 
            value={isMining ? timeRemaining : "Ready to start"}
            subtext="6-hour cycle"
            data-testid="text-time-remaining"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6 glass-card dark:glass-card-dark">
            <h3 className="font-bold text-lg mb-3">Boost Your Earnings</h3>
            <div className="space-y-3">
              <motion.div 
                className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10 backdrop-blur-sm transition-all duration-300"
                whileHover={{ x: 5, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Users className="w-5 h-5 text-primary" />
                  </motion.div>
                  <div>
                    <p className="font-semibold text-sm">Invite Friends</p>
                    <p className="text-xs text-muted-foreground">+500 coins per invite</p>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="sm" data-testid="button-invite-friends">Invite</Button>
                </motion.div>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}