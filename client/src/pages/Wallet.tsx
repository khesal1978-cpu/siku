import { useEffect } from 'react';
import { ArrowDownToLine, ArrowUpRight, Zap, Users, Gift } from 'lucide-react';
import CoinDisplay from '@/components/CoinDisplay';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { UserProfile, Transaction } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';

export default function Wallet() {
  const { userId } = useAuth();
  const { subscribe } = useWebSocket();

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['/api/profile', userId],
    enabled: !!userId,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', userId],
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribe('profile_updated', (data: UserProfile) => {
      queryClient.setQueryData(['/api/profile', userId], data);
      queryClient.invalidateQueries({ queryKey: ['/api/transactions', userId] });
    });

    return () => unsubscribe();
  }, [userId, subscribe]);

  const getIcon = (type: string) => {
    if (type.includes('mining')) return <Zap className="w-4 h-4" />;
    if (type.includes('referral')) return <Users className="w-4 h-4" />;
    return <Gift className="w-4 h-4" />;
  };

  const getColor = (type: string) => {
    if (type.includes('mining')) return 'text-primary';
    if (type.includes('referral')) return 'text-chart-2';
    return 'text-purple-500';
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <h1 className="text-2xl font-bold font-['Poppins'] mb-2">Wallet</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Track your earnings and transactions
        </p>

        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CoinDisplay amount={profile?.balance || 0} label="Available Balance" size="lg" data-testid="text-wallet-balance" />

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button 
              variant="outline" 
              className="gap-2"
              disabled
              data-testid="button-withdraw"
            >
              <ArrowDownToLine className="w-4 h-4" />
              Withdraw
              <Badge variant="secondary" className="ml-1 text-[10px]">Soon</Badge>
            </Button>
            <Button className="gap-2" disabled data-testid="button-send">
              <ArrowUpRight className="w-4 h-4" />
              Send
              <Badge variant="secondary" className="ml-1 text-[10px]">Soon</Badge>
            </Button>
          </div>
        </Card>

        <div>
          <h2 className="font-bold text-lg mb-4">Transaction History</h2>
          {transactionsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : transactions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground mt-2">Start mining to see your transaction history!</p>
            </Card>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {transactions.map((tx, index) => (
                  <Card 
                    key={tx.id} 
                    className="p-4 hover-elevate"
                    data-testid={`card-transaction-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-muted ${getColor(tx.type)}`}>
                        {getIcon(tx.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" data-testid="text-transaction-description">
                          {tx.description || tx.type}
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid="text-transaction-date">
                          {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold font-['Poppins'] ${tx.amount >= 0 ? getColor(tx.type) : 'text-destructive'}`} data-testid="text-transaction-amount">
                          {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">CASET</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
