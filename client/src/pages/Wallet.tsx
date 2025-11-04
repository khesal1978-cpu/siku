import { ArrowDownToLine, ArrowUpRight, Zap, Users, Gift } from 'lucide-react';
import CoinDisplay from '@/components/CoinDisplay';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Transaction {
  type: 'mining' | 'referral' | 'bonus';
  amount: number;
  date: string;
  description: string;
}

export default function Wallet() {
  //todo: remove mock functionality
  const balance = 5678.90;
  const pending = 234.50;

  const transactions: Transaction[] = [
    { type: 'mining', amount: 60, date: '2 hours ago', description: 'Mining Reward' },
    { type: 'referral', amount: 500, date: '5 hours ago', description: 'Referral Bonus - Sarah J.' },
    { type: 'mining', amount: 60, date: '8 hours ago', description: 'Mining Reward' },
    { type: 'bonus', amount: 100, date: '1 day ago', description: 'Welcome Bonus' },
    { type: 'referral', amount: 500, date: '2 days ago', description: 'Referral Bonus - Mike C.' },
    { type: 'mining', amount: 60, date: '2 days ago', description: 'Mining Reward' },
  ];

  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'mining': return <Zap className="w-4 h-4" />;
      case 'referral': return <Users className="w-4 h-4" />;
      case 'bonus': return <Gift className="w-4 h-4" />;
    }
  };

  const getColor = (type: Transaction['type']) => {
    switch (type) {
      case 'mining': return 'text-primary';
      case 'referral': return 'text-chart-2';
      case 'bonus': return 'text-purple-500';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <h1 className="text-2xl font-bold font-['Poppins'] mb-2">Wallet</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Track your earnings and transactions
        </p>

        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CoinDisplay amount={balance} label="Available Balance" size="lg" />
          
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <span>Pending:</span>
            <span className="font-semibold text-foreground">{pending.toLocaleString()} CASET</span>
          </div>

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
            <Button className="gap-2" data-testid="button-send">
              <ArrowUpRight className="w-4 h-4" />
              Send
            </Button>
          </div>
        </Card>

        <div>
          <h2 className="font-bold text-lg mb-4">Transaction History</h2>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {transactions.map((tx, index) => (
                <Card 
                  key={index} 
                  className="p-4 hover-elevate"
                  data-testid={`card-transaction-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-muted ${getColor(tx.type)}`}>
                      {getIcon(tx.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" data-testid="text-transaction-description">
                        {tx.description}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid="text-transaction-date">
                        {tx.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold font-['Poppins'] ${getColor(tx.type)}`} data-testid="text-transaction-amount">
                        +{tx.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">CASET</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
