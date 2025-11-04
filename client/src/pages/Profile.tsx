import { User, MapPin, Calendar, Users, TrendingUp, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ReferralCard from '@/components/ReferralCard';

export default function Profile() {
  //todo: remove mock functionality
  const user = {
    name: 'John Doe',
    username: '@johndoe',
    country: 'United States',
    joinedDate: 'Jan 15, 2024',
    totalReferrals: 23,
    totalMined: 5432.10,
    miningDays: 45,
    level: 18
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <h1 className="text-2xl font-bold font-['Poppins'] mb-6">Profile</h1>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-20 h-20 ring-4 ring-primary/20">
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold" data-testid="text-profile-name">{user.name}</h2>
              <p className="text-sm text-muted-foreground" data-testid="text-profile-username">{user.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="px-3 py-1 bg-primary/10 rounded-full">
                  <p className="text-sm font-semibold text-primary">Level {user.level}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                defaultValue={user.name} 
                data-testid="input-username"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input 
                id="country" 
                defaultValue={user.country} 
                data-testid="input-country"
              />
            </div>
          </div>

          <Button className="w-full mt-4" data-testid="button-save-profile">
            Save Changes
          </Button>
        </Card>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4">
            <Calendar className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-lg font-bold font-['Poppins']" data-testid="text-mining-days">{user.miningDays}</p>
            <p className="text-xs text-muted-foreground">Mining Days</p>
          </Card>
          <Card className="p-4">
            <Users className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-lg font-bold font-['Poppins']" data-testid="text-total-referrals">{user.totalReferrals}</p>
            <p className="text-xs text-muted-foreground">Referrals</p>
          </Card>
          <Card className="p-4">
            <TrendingUp className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-lg font-bold font-['Poppins']" data-testid="text-total-mined">{user.totalMined.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Mined</p>
          </Card>
          <Card className="p-4">
            <Award className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-lg font-bold font-['Poppins']" data-testid="text-level">{user.level}</p>
            <p className="text-xs text-muted-foreground">Current Level</p>
          </Card>
        </div>

        <ReferralCard referralCode="PING2024XYZ" />

        <Card className="p-4 mt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4" />
            <span>Member since {user.joinedDate}</span>
          </div>
        </Card>

        <Button 
          variant="outline" 
          className="w-full mt-6"
          data-testid="button-logout"
        >
          Log Out
        </Button>
      </div>
    </div>
  );
}
