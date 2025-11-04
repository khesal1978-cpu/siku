import { Users, TrendingUp } from 'lucide-react';
import TeamMemberCard from '@/components/TeamMemberCard';
import ReferralCard from '@/components/ReferralCard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Team() {
  //todo: remove mock functionality
  const mockDirectReferrals = [
    { name: 'Sarah Johnson', coins: 2450, level: 12, referrals: 8, joinedDate: '2 days ago' },
    { name: 'Mike Chen', coins: 1890, level: 9, referrals: 3, joinedDate: '1 week ago' },
    { name: 'Emma Davis', coins: 3210, level: 15, referrals: 12, joinedDate: '3 days ago' },
  ];

  const mockIndirectReferrals = [
    { name: 'James Wilson', coins: 890, level: 5, referrals: 1, joinedDate: '5 days ago', isDirect: false },
    { name: 'Lisa Anderson', coins: 1200, level: 7, referrals: 2, joinedDate: '1 week ago', isDirect: false },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <h1 className="text-2xl font-bold font-['Poppins'] mb-2">My Team</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Build your network and earn together
        </p>

        <div className="space-y-6">
          <ReferralCard referralCode="PING2024XYZ" />

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold font-['Poppins']" data-testid="text-total-referrals">23</p>
              <p className="text-xs text-muted-foreground">Total Team</p>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-chart-2 mx-auto mb-2" />
              <p className="text-2xl font-bold font-['Poppins']" data-testid="text-team-earnings">12,450</p>
              <p className="text-xs text-muted-foreground">Team Earnings</p>
            </Card>
          </div>

          <Tabs defaultValue="direct" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="direct" data-testid="tab-direct-referrals">
                Direct ({mockDirectReferrals.length})
              </TabsTrigger>
              <TabsTrigger value="indirect" data-testid="tab-indirect-referrals">
                Indirect ({mockIndirectReferrals.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="direct" className="space-y-3 mt-4">
              {mockDirectReferrals.map((member, index) => (
                <TeamMemberCard key={index} {...member} isDirect />
              ))}
            </TabsContent>
            <TabsContent value="indirect" className="space-y-3 mt-4">
              {mockIndirectReferrals.map((member, index) => (
                <TeamMemberCard key={index} {...member} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
