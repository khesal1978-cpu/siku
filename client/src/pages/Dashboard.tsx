import { useState, useEffect } from 'react';
import { Zap, TrendingUp, Clock } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
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

  if (profileLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 pb-24">
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
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 pb-28">
      <div className="absolute inset-x-0 top-0 h-96 w-full bg-gradient-to-b from-[#d1fae5] dark:from-emerald-900/20 to-[#f8fafc] dark:to-slate-900 pointer-events-none" />
      
      <div className="absolute inset-0 opacity-50 pointer-events-none" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2334d399' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
      }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <PageHeader title="Mining Dashboard" subtitle="Keep mining to earn more rewards" />
          </div>

          <div className="md:col-span-2 lg:col-span-1 px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/80 dark:border-slate-700"
            >
              <p className="text-base font-medium text-slate-500 dark:text-slate-400">Mining Balance</p>
              <div className="flex items-baseline justify-center gap-2 mt-2">
                <h2 className="text-5xl font-bold text-slate-800 dark:text-slate-100" data-testid="text-balance">{profile.balance.toLocaleString()}</h2>
                <span className="text-xl font-semibold text-slate-600 dark:text-slate-400">CASET</span>
              </div>
            </motion.div>
          </div>

          <div className="md:col-span-2 lg:col-span-1 flex flex-col items-center px-6">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/70 dark:bg-slate-800/70 shadow-inner border border-white/80 dark:border-slate-700"></div>
              <svg className="w-full h-full transform -rotate-90 p-3" viewBox="0 0 100 100">
                <circle className="text-slate-200 dark:text-slate-700" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="10"></circle>
                <circle 
                  className="text-primary drop-shadow-lg" 
                  cx="50" 
                  cy="50" 
                  fill="transparent" 
                  r="45" 
                  stroke="currentColor" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round" 
                  strokeWidth="10"
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                ></circle>
              </svg>
              <button 
                onClick={handleMine}
                disabled={startMiningMutation.isPending || claimMiningMutation.isPending || (isMining && progress < 100)}
                className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-primary to-emerald-400 shadow-2xl shadow-primary/40 flex flex-col items-center justify-center text-center transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                data-testid="button-mine"
              >
                <Zap className="text-white w-12 h-12 drop-shadow-md" fill="white" />
                <p className="text-3xl font-bold text-white drop-shadow-md">{Math.round(progress)}%</p>
              </button>
            </div>
            
            {isMining && (
              <div className="mt-8 flex items-center justify-center gap-2 z-10 px-6 py-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full border border-primary/20 shadow-md">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-700 dark:bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-700 dark:bg-emerald-400"></span>
                </span>
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Mining Active</p>
              </div>
            )}
          </div>

          <div className="md:col-span-2 px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-4 rounded-2xl flex flex-col items-start gap-3 shadow-md border border-white/80 dark:border-slate-700">
              <div className="bg-primary/10 p-2.5 rounded-lg border border-primary/10">
                <Zap className="text-primary w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Mining Speed</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100" data-testid="text-mining-speed">{miningSpeed.toFixed(1)}/hr</p>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-4 rounded-2xl flex flex-col items-start gap-3 shadow-md border border-white/80 dark:border-slate-700">
              <div className="bg-primary/10 p-2.5 rounded-lg border border-primary/10">
                <TrendingUp className="text-primary w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Mined</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100" data-testid="text-total-mined">{profile.totalMined.toLocaleString()}</p>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 shadow-md border border-white/80 dark:border-slate-700">
              <div className="bg-primary/10 p-3 rounded-lg border border-primary/10">
                <Clock className="text-primary w-8 h-8" />
              </div>
              <div>
                <p className="text-base text-slate-500 dark:text-slate-400">Next Mining Cycle</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100" data-testid="text-time-remaining">{isMining ? timeRemaining : "Ready to start"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
