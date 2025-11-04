import { useState } from 'react';
import LeaderboardItem from '@/components/LeaderboardItem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export default function Leaderboard() {
  //todo: remove mock functionality
  const [activeTab, setActiveTab] = useState('global');

  const globalLeaders = [
    { rank: 1, name: 'Alex Thompson', coins: 45678, country: 'USA' },
    { rank: 2, name: 'Maria Garcia', coins: 38901, country: 'Spain' },
    { rank: 3, name: 'Yuki Tanaka', coins: 32456, country: 'Japan' },
    { rank: 4, name: 'Pierre Dubois', coins: 28901, country: 'France' },
    { rank: 5, name: 'Sofia Romano', coins: 25678, country: 'Italy' },
    { rank: 6, name: 'Chen Wei', coins: 23456, country: 'China' },
    { rank: 7, name: 'Emma Schmidt', coins: 21234, country: 'Germany' },
    { rank: 8, name: 'Lucas Silva', coins: 19890, country: 'Brazil' },
    { rank: 9, name: 'Aisha Patel', coins: 17654, country: 'India' },
    { rank: 10, name: 'Oliver Brown', coins: 15432, country: 'UK' },
  ];

  const regionalLeaders = [
    { rank: 1, name: 'John Smith', coins: 12345, country: 'USA' },
    { rank: 2, name: 'Sarah Wilson', coins: 11234, country: 'USA' },
    { rank: 3, name: 'Michael Davis', coins: 9876, country: 'USA' },
    { rank: 4, name: 'Emily Taylor', coins: 8765, country: 'USA' },
    { rank: 5, name: 'David Martinez', coins: 7654, country: 'USA' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <h1 className="text-2xl font-bold font-['Poppins'] mb-2">Leaderboard</h1>
        <p className="text-sm text-muted-foreground mb-6">
          See how you rank against other miners
        </p>

        <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your Rank</p>
              <p className="text-3xl font-bold font-['Poppins']" data-testid="text-user-rank">#247</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Your Balance</p>
              <p className="text-2xl font-bold font-['Poppins']" data-testid="text-user-balance">5,432</p>
              <p className="text-xs text-muted-foreground">CASET</p>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="global" data-testid="tab-global">Global</TabsTrigger>
            <TabsTrigger value="regional" data-testid="tab-regional">Regional</TabsTrigger>
          </TabsList>
          
          <TabsContent value="global" className="space-y-2">
            {globalLeaders.map((leader) => (
              <LeaderboardItem
                key={leader.rank}
                rank={leader.rank}
                name={leader.name}
                coins={leader.coins}
                country={leader.country}
              />
            ))}
          </TabsContent>
          
          <TabsContent value="regional" className="space-y-2">
            {regionalLeaders.map((leader) => (
              <LeaderboardItem
                key={leader.rank}
                rank={leader.rank}
                name={leader.name}
                coins={leader.coins}
                country={leader.country}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
