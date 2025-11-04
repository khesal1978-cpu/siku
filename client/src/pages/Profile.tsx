import { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, TrendingUp, Award, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import ReferralCard from '@/components/ReferralCard';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { UserProfile, Referral } from '@shared/schema';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { userId, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  const referralCode = userId ? `PING${userId.substring(0, 8).toUpperCase()}` : 'LOADING...';

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-background pb-20">
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
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <h1 className="text-2xl font-bold font-['Poppins'] mb-6">Profile</h1>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-20 h-20 ring-4 ring-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {profile.userId.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold" data-testid="text-profile-name">User</h2>
              <p className="text-sm text-muted-foreground" data-testid="text-profile-username">@{profile.userId.substring(0, 12)}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="px-3 py-1 bg-primary/10 rounded-full">
                  <p className="text-sm font-semibold text-primary">Level {userLevel}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-username"
                disabled
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input 
                id="country" 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Enter your country"
                data-testid="input-country"
                disabled
              />
            </div>
          </div>

          <Button className="w-full mt-4" disabled data-testid="button-save-profile">
            Save Changes (Coming Soon)
          </Button>
        </Card>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4">
            <Calendar className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-lg font-bold font-['Poppins']" data-testid="text-mining-days">{daysMining}</p>
            <p className="text-xs text-muted-foreground">Mining Days</p>
          </Card>
          <Card className="p-4">
            <Users className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-lg font-bold font-['Poppins']" data-testid="text-total-referrals">{referrals.length}</p>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </Card>
          <Card className="p-4">
            <TrendingUp className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-lg font-bold font-['Poppins']" data-testid="text-total-mined">{profile.totalMined.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Mined</p>
          </Card>
          <Card className="p-4">
            <Award className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-lg font-bold font-['Poppins']" data-testid="text-level">{userLevel}</p>
            <p className="text-xs text-muted-foreground">Current Level</p>
          </Card>
        </div>

        <ReferralCard referralCode={referralCode} />

        <Card className="p-4 mt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4" />
            <span>Member since {format(new Date(profile.lastLogin), 'MMM dd, yyyy')}</span>
          </div>
        </Card>

        <Button 
          variant="outline" 
          className="w-full mt-6 gap-2"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
