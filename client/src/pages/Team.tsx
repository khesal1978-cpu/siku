import { useEffect } from 'react';
import { Users, TrendingUp } from 'lucide-react';
import TeamMemberCard from '@/components/TeamMemberCard';
import ReferralCard from '@/components/ReferralCard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { Referral, UserProfile } from '@shared/schema';

export default function Team() {
  const { userId } = useAuth();
  const { subscribe } = useWebSocket();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
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
  const claimedReferrals = referrals.filter(r => r.rewardClaimed).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <h1 className="text-2xl font-bold font-['Poppins'] mb-2">My Team</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Build your network and earn together
        </p>

        <div className="space-y-6">
          <ReferralCard referralCode={referralCode} />

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold font-['Poppins']" data-testid="text-total-referrals">{totalReferrals}</p>
              <p className="text-xs text-muted-foreground">Total Referrals</p>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-chart-2 mx-auto mb-2" />
              <p className="text-2xl font-bold font-['Poppins']" data-testid="text-team-earnings">{claimedReferrals * 500}</p>
              <p className="text-xs text-muted-foreground">Referral Earnings</p>
            </Card>
          </div>

          <div className="w-full">
            <h3 className="font-bold text-lg mb-4">Your Referrals ({totalReferrals})</h3>
            {totalReferrals === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-semibold">No referrals yet</p>
                <p className="text-sm text-muted-foreground mt-2">Share your referral code to start earning!</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral, index) => (
                  <Card key={referral.id} className="p-4" data-testid={`card-referral-${index}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">Referral #{index + 1}</p>
                        <p className="text-xs text-muted-foreground">Code: {referral.referralCode}</p>
                      </div>
                      <div className="text-right">
                        {referral.rewardClaimed ? (
                          <p className="text-sm text-primary font-semibold">+500 CASET</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Pending</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
