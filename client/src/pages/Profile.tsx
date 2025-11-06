import { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, TrendingUp, Award, Copy, Share2, Edit, Shield, HelpCircle, Twitter } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { UserProfile, Referral } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

export default function Profile() {
  const { userId } = useAuth();
  const { subscribe } = useWebSocket();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['/api/profile', userId],
    enabled: !!userId,
  });

  const { data: referrals = [] } = useQuery<Referral[]>({
    queryKey: ['/api/referrals', userId],
    enabled: !!userId,
  });

  useEffect(() => {
    if (profile) {
      setUsername(profile.userId);
      setCountry('');
    }
  }, [profile]);

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

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#f7fafc] dark:bg-slate-900 pb-24">
        <div className="p-6 space-y-6">
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  const daysMining = Math.floor((Date.now() - new Date(profile.lastLogin).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const userLevel = Math.floor(profile.totalMined / 1000) + 1;

  return (
    <div className="min-h-screen bg-[#f7fafc] dark:bg-slate-900 pb-28">
      <div className="relative bg-gradient-to-b from-primary/20 via-primary/5 to-[#f7fafc] dark:from-primary/15 dark:via-primary/5 dark:to-slate-900 pb-24 pt-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Profile</h1>
        
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/20 text-5xl font-bold text-primary">
              {profile.userId.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-2 right-0 flex h-8 w-8 items-center justify-center rounded-full border-4 border-[#f7fafc] dark:border-slate-900 bg-primary text-white">
              <Edit className="w-4 h-4" />
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-profile-name">User</h2>
          <p className="text-gray-500 dark:text-gray-400" data-testid="text-profile-username">@{profile.userId.substring(0, 12)}</p>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto -mt-16 px-4">
        <div className="grid md:grid-cols-2 gap-4 rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-md mb-8">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-mining-days">{daysMining}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Mining Days</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-total-referrals">{referrals.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Referrals</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-total-mined">{profile.totalMined.toLocaleString()}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Mined</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-level">{userLevel}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Level</p>
          </div>
        </div>

        <div className="space-y-6 px-4">
          <div className="space-y-4 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm">
            <div>
              <Label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-700 px-4 py-2.5 text-gray-800 dark:text-gray-200"
                data-testid="input-username"
                disabled
              />
            </div>
            <div>
              <Label htmlFor="country" className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">Country</Label>
              <Input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-lg border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-700 px-4 py-2.5 text-gray-800 dark:text-gray-200"
                placeholder="United States"
                data-testid="input-country"
                disabled
              />
            </div>
            <button
              className="w-full rounded-lg bg-primary py-3 px-4 font-bold text-white shadow-md transition duration-200 hover:bg-primary/90 disabled:opacity-50"
              disabled
              data-testid="button-save-profile"
            >
              Save Changes
            </button>
          </div>

          <div className="rounded-2xl bg-primary/10 dark:bg-primary/20 p-6 text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your Referral Code</h3>
            <p className="mt-1 mb-4 text-sm text-gray-600 dark:text-gray-400">Share your code and earn rewards together!</p>
            <div className="mb-4 rounded-lg border-2 border-dashed border-primary/50 bg-white/50 dark:bg-slate-800/50 p-4">
              <p className="text-2xl font-bold tracking-widest text-primary" data-testid="text-referral-code">{referralCode}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleCopyCode}
                className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-gray-200 dark:bg-slate-700 py-3 px-4 font-semibold text-gray-800 dark:text-gray-200 transition duration-200 hover:bg-gray-300 dark:hover:bg-slate-600"
                data-testid="button-copy"
              >
                <Copy className="w-5 h-5" />
                <span>Copy</span>
              </button>
              <button
                onClick={handleShareCode}
                className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-primary py-3 px-4 font-semibold text-white transition duration-200 hover:bg-primary/90"
                data-testid="button-share"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 px-2 pb-2 pt-4">Legal</h3>
            <div className="flex flex-col gap-2">
              <Link href="/terms" data-testid="link-terms">
                <button className="w-full flex items-center gap-4 bg-white dark:bg-slate-800 px-4 min-h-14 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors" data-testid="button-terms">
                  <div className="flex items-center justify-center rounded-lg bg-primary/20 w-10 h-10 shrink-0">
                    <Shield className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                  </div>
                  <p className="flex-1 text-base font-medium text-gray-900 dark:text-gray-100 text-left truncate">Terms & Privacy Policy</p>
                  <div className="shrink-0">
                    <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 px-2 pb-2 pt-4">Support</h3>
            <div className="flex flex-col gap-2">
              <Link href="/help" data-testid="link-help">
                <button className="w-full flex items-center gap-4 bg-white dark:bg-slate-800 px-4 min-h-14 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors" data-testid="button-help">
                  <div className="flex items-center justify-center rounded-lg bg-primary/20 w-10 h-10 shrink-0">
                    <HelpCircle className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                  </div>
                  <p className="flex-1 text-base font-medium text-gray-900 dark:text-gray-100 text-left truncate">Help Center</p>
                  <div className="shrink-0">
                    <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 px-2 pb-2 pt-4">Community</h3>
            <div className="flex flex-col gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center rounded-lg bg-[#1DA1F2]/20 w-10 h-10 shrink-0">
                  <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-gray-900 dark:text-gray-100">Follow us on Twitter</p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">@PingCaset</p>
                </div>
                <div className="bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary font-semibold px-3 py-1 text-xs rounded-full whitespace-nowrap">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
