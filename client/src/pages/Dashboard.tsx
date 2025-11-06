import { useState, useEffect } from 'react';
import { Zap, TrendingUp, Clock, Battery, Award, Users } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, MiningSession } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import Card3D from '@/components/Card3D';

export default function Dashboard() {
  const { userId } = useAuth();
  const { subscribe } = useWebSocket();
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [currentEarnings, setCurrentEarnings] = useState(0);

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
        description: `You earned ${data?.coinsEarned?.toFixed(2) || 0} CASET!`,
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

      const cappedElapsed = Math.min(elapsed, totalDuration);
      const hoursElapsed = cappedElapsed / (1000 * 60 * 60);
      const coinsEarned = hoursElapsed * miningSession.coinsPerHour;
      setCurrentEarnings(coinsEarned);

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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 pb-28 morphing-bg">
      <div className="absolute inset-x-0 top-0 h-96 overflow-hidden bg-gradient-to-b from-teal-400/20 via-teal-100/20 to-transparent dark:from-teal-900/15 dark:via-teal-950/10">
        <div className="absolute -top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-500/15 dark:bg-teal-500/10 blur-3xl animate-smooth-pulse"></div>
        <div className="absolute top-10 -left-20 h-64 w-64 rounded-full bg-teal-500/10 dark:bg-teal-500/5 blur-3xl animate-particle-float"></div>
        <div className="absolute top-5 -right-20 h-64 w-64 rounded-full bg-teal-400/10 dark:bg-teal-400/5 blur-3xl animate-particle-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="absolute inset-0 opacity-50 pointer-events-none" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2334d399' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
      }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <PageHeader title="Mining Dashboard" subtitle="Keep mining to earn more rewards" />
          </div>

          <div className="md:col-span-2 lg:col-span-1 px-6 space-y-4">
            <Card3D intensity="high">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/80 dark:border-slate-700"
              >
                <p className="text-base font-medium text-slate-500 dark:text-slate-400">Mining Balance</p>
                <div className="flex items-baseline justify-center gap-2 mt-2">
                  <h2 className="text-5xl font-bold text-slate-800 dark:text-slate-100" data-testid="text-balance">{profile.balance.toLocaleString()}</h2>
                  <span className="text-xl font-semibold text-slate-600 dark:text-slate-400">CASET</span>
                </div>
                {isMining && currentEarnings > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-primary/20"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-400">Current Earnings</p>
                    <motion.p 
                      className="text-lg font-bold text-primary" 
                      data-testid="text-current-earnings"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      +{currentEarnings.toFixed(2)} CASET
                    </motion.p>
                  </motion.div>
                )}
              </motion.div>
            </Card3D>

            {/* Energy indicator */}
            <Card3D intensity="medium">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/80 dark:border-slate-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Battery className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Energy</span>
                  </div>
                  <span className="font-bold text-primary">{profile.energy}/{profile.maxEnergy}</span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(profile.energy / profile.maxEnergy) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Refills 1 energy every 5 minutes</p>
              </motion.div>
            </Card3D>
          </div>

          <div className="md:col-span-2 lg:col-span-1 flex flex-col items-center px-6">
            <div className="relative w-72 h-72 flex items-center justify-center">
              {/* Animated glow rings */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-primary/5"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute inset-0 rounded-full bg-primary/5"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />

              {/* Floating sparkles */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 360) / 8;
                const radius = 120;
                const x = Math.cos(angle * Math.PI / 180) * radius;
                const y = Math.sin(angle * Math.PI / 180) * radius;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-primary rounded-full"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.25,
                      ease: "easeInOut"
                    }}
                  />
                );
              })}

              <div className="absolute inset-8 rounded-full bg-white/70 dark:bg-slate-800/70 shadow-inner border border-white/80 dark:border-slate-700"></div>
              <svg className="w-full h-full transform -rotate-90 p-8" viewBox="0 0 100 100">
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

              <motion.button 
                onClick={handleMine}
                disabled={startMiningMutation.isPending || claimMiningMutation.isPending || (isMining && progress < 100)}
                className={`absolute w-44 h-44 rounded-full shadow-2xl flex flex-col items-center justify-center text-center disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden ${
                  isMining 
                    ? 'bg-gradient-to-br from-primary to-emerald-400' 
                    : 'bg-gradient-to-br from-red-500 to-rose-600'
                }`}
                data-testid="button-mine"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: isMining 
                    ? [
                        "0 0 30px rgba(16, 185, 129, 0.4)",
                        "0 0 60px rgba(16, 185, 129, 0.6)",
                        "0 0 30px rgba(16, 185, 129, 0.4)",
                      ]
                    : [
                        "0 0 30px rgba(239, 68, 68, 0.4)",
                        "0 0 60px rgba(239, 68, 68, 0.6)",
                        "0 0 30px rgba(239, 68, 68, 0.4)",
                      ],
                }}
                transition={{
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 1
                  }}
                />

                <motion.div
                  animate={isMining ? {
                    rotate: 360,
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <Zap className="text-white w-14 h-14 drop-shadow-md" fill="white" />
                </motion.div>
                <motion.p 
                  className="text-3xl font-bold text-white drop-shadow-md mt-2"
                  animate={progress === 100 ? {
                    scale: [1, 1.2, 1],
                  } : {}}
                  transition={{
                    duration: 0.5,
                    repeat: progress === 100 ? Infinity : 0,
                  }}
                >
                  {progress === 100 ? 'Claim' : `${Math.round(progress)}%`}
                </motion.p>
              </motion.button>
            </div>

            {isMining && progress < 100 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex items-center justify-center gap-2 z-10 px-6 py-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full border border-primary/20 shadow-md"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-700 dark:bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-700 dark:bg-emerald-400"></span>
                </span>
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Mining Active</p>
              </motion.div>
            )}
          </div>

          <div className="md:col-span-2 px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card3D intensity="medium">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-4 rounded-2xl flex flex-col items-start gap-3 shadow-xl border border-white/80 dark:border-slate-700">
                <div className="bg-primary/10 p-2.5 rounded-lg border border-primary/10">
                  <Zap className="text-primary w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Mining Speed</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100" data-testid="text-mining-speed">{miningSpeed.toFixed(1)}/hr</p>
                </div>
              </div>
            </Card3D>

            <Card3D intensity="medium">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-4 rounded-2xl flex flex-col items-start gap-3 shadow-xl border border-white/80 dark:border-slate-700">
                <div className="bg-primary/10 p-2.5 rounded-lg border border-primary/10">
                  <TrendingUp className="text-primary w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Mined</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100" data-testid="text-total-mined">{profile.totalMined.toLocaleString()}</p>
                </div>
              </div>
            </Card3D>

            <Card3D intensity="medium" className="md:col-span-2 lg:col-span-1">
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 shadow-xl border border-white/80 dark:border-slate-700">
                <div className="bg-primary/10 p-3 rounded-lg border border-primary/10">
                  <Clock className="text-primary w-8 h-8" />
                </div>
                <div>
                  <p className="text-base text-slate-500 dark:text-slate-400">Next Mining Cycle</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100" data-testid="text-time-remaining">{isMining ? timeRemaining : "Ready to start"}</p>
                </div>
              </div>
            </Card3D>
          </div>

          {/* Quick tips and stats section */}
          <div className="md:col-span-2 px-6 mt-8 grid md:grid-cols-2 gap-6">
            <Card3D intensity="low">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Daily Streak</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{profile.streak}</p>
                  <span className="text-slate-600 dark:text-slate-400">days</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Keep mining daily to maintain your streak! 🔥</p>
              </motion.div>
            </Card3D>

            <Card3D intensity="low">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-2xl border border-purple-200 dark:border-purple-800 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Pro Tip</h3>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  💡 Invite friends to earn bonus coins! Each referral gives you extra mining speed and rewards.
                </p>
              </motion.div>
            </Card3D>
          </div>
        </div>
      </div>
    </div>
  );
}