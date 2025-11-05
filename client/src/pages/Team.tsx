import { useEffect } from 'react';
import { Users, TrendingUp, Copy, Share2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card3D from '@/components/Card3D';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Referral, UserProfile } from '@shared/schema';
import { motion } from 'framer-motion';

export default function Team() {
  const { userId } = useAuth();
  const { subscribe } = useWebSocket();
  const { toast } = useToast();

  const { data: referrals = [], isLoading } = useQuery<Referral[]>({
    queryKey: ['/api/referrals', userId],
    enabled: !!userId,
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['/api/profile', userId],
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribe('profile_updated', (data: UserProfile) => {
      queryClient.setQueryData(['/api/profile', userId], data);
    });

    return () => unsubscribe();
  }, [userId, subscribe]);

  const referralCode = userId ? `PING${userId.substring(0, 8).toUpperCase()}` : 'LOADING...';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const handleShareCode = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join PingCaset',
        text: `Use my referral code ${referralCode} to join PingCaset and start mining!`,
      });
    } else {
      handleCopyCode();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7fafc] dark:bg-slate-900 pb-24">
        <div className="p-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const totalReferrals = referrals.length;
  const teamEarnings = referrals.filter(r => r.rewardClaimed).length * 500;
  const directReferrals = referrals.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f7fafc] dark:bg-slate-900 pb-28">
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/15 to-transparent dark:from-primary/10 pointer-events-none" 
        style={{
          backgroundImage: "radial-gradient(circle at top right, rgba(46, 211, 163, 0.15), transparent 40%), radial-gradient(circle at top left, rgba(46, 211, 163, 0.15), transparent 40%)"
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <PageHeader title="My Team" subtitle="Build your network and earn together" />

        <div className="px-6 space-y-8">
          <Card3D intensity="high">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary/90 to-primary p-6 rounded-xl shadow-xl shadow-primary/25 text-white"
            >
              <h2 className="text-lg font-semibold">Your Referral Code</h2>
              <p className="text-sm text-white/80 mt-1">Share your code and earn rewards together!</p>
              <div className="my-4 text-center bg-white/20 border-2 border-dashed border-white/50 rounded-lg py-3">
                <span className="text-2xl font-bold tracking-widest text-white" data-testid="text-referral-code">{referralCode}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white/20 text-white font-medium active:scale-95 transition-transform backdrop-blur-sm"
                  data-testid="button-copy"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button
                  onClick={handleShareCode}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg bg-white text-primary font-bold shadow-md shadow-black/10 active:scale-95 transition-transform"
                  data-testid="button-share"
                >
                  <Share2 className="w-4 h-4" fill="currentColor" />
                  Share
                </button>
              </div>
            </motion.div>
          </Card3D>

          <div className="grid grid-cols-2 gap-4">
            <Card3D intensity="medium">
              <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Team</p>
                <p className="text-4xl font-bold text-primary mt-1" data-testid="text-total-team">{totalReferrals}</p>
              </div>
            </Card3D>
            <Card3D intensity="medium">
              <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">Team Earnings</p>
                <p className="text-4xl font-bold text-primary mt-1" data-testid="text-team-earnings">{teamEarnings.toLocaleString()}</p>
              </div>
            </Card3D>
          </div>

          <div>
            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg mb-4">
              <button className="flex-1 py-2 text-sm font-semibold rounded-md bg-white dark:bg-slate-700 text-primary shadow-sm" data-testid="tab-direct">
                Direct ({directReferrals.length})
              </button>
              <button className="flex-1 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400" disabled data-testid="tab-indirect">
                Indirect (0)
              </button>
            </div>

            <div className="space-y-4">
              {directReferrals.length === 0 ? (
                <Card3D intensity="low">
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm text-center">
                    <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-semibold">No referrals yet</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Share your referral code to start earning!</p>
                  </div>
                </Card3D>
              ) : (
                directReferrals.map((referral, index) => (
                  <Card3D key={referral.id} intensity="low">
                    <div
                      className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4"
                      data-testid={`card-referral-${index}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                        {referral.id.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-base">Referral #{index + 1}</h3>
                          <span className="text-sm font-medium text-green-500 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" fill="currentColor" /> Active
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1.5 space-x-3">
                          <span className="flex items-center gap-1">
                            <span className="text-primary/70">💰</span> {referral.rewardClaimed ? '500 CASET' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card3D>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
