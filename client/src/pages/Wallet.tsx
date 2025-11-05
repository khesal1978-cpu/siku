import { useEffect } from 'react';
import { ArrowDownToLine, ArrowUpRight, Zap, Users, Gift } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import type { UserProfile, Transaction } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';
import Card3D from '@/components/Card3D';
import { motion } from 'framer-motion';

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
    if (type.includes('mining')) return <Zap className="w-5 h-5" />;
    if (type.includes('referral')) return <Users className="w-5 h-5" />;
    return <Gift className="w-5 h-5" />;
  };

  const getColor = (type: string) => {
    if (type.includes('mining')) return { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-primary' };
    if (type.includes('referral')) return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-500' };
    return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-500' };
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#f7fafa] dark:bg-slate-900 pb-24">
        <div className="p-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fafa] dark:bg-slate-900 pb-28">
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent dark:from-primary/10 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <PageHeader title="Wallet" subtitle="Track your earnings and transactions" />

        <div className="px-6 space-y-8">
          <Card3D intensity="high">
            <div className="relative overflow-hidden glass-ultra dark:glass-ultra-dark p-4 depth-md hover-lift">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full"></div>
              <div className="absolute -bottom-16 -left-8 w-40 h-40 bg-primary/10 rounded-full"></div>

              <div className="relative z-10 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-2">Available Balance</p>
                <motion.div
                  className="flex items-center justify-center gap-2"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg">💰</span>
                  </div>
                  <p className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100" data-testid="text-wallet-balance">
                    {(profile?.balance || 0).toLocaleString()}
                  </p>
                </motion.div>
                <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mt-1">CASET</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Pending: 0 CASET</p>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4 mt-6">
                <button
                  disabled
                  className="flex flex-col items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                  data-testid="button-withdraw"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-slate-600 rounded-full">
                    <ArrowDownToLine className="w-5 h-5" />
                  </div>
                  Withdraw
                </button>
                <button
                  disabled
                  className="flex flex-col items-center justify-center gap-2 py-3 px-4 bg-primary text-white rounded-lg font-semibold shadow-md shadow-primary/30 hover:bg-teal-500 transition-colors disabled:opacity-50"
                  data-testid="button-send"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full">
                    <ArrowUpRight className="w-5 h-5" style={{ transform: 'rotate(-45deg)' }} />
                  </div>
                  Send
                </button>
              </div>
            </div>
          </Card3D>

          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Transaction History</h2>
            {transactionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : transactions.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-lg text-center border border-gray-100 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">No transactions yet</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Start mining to see your transaction history!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 5).map((tx, index) => {
                  const colors = getColor(tx.type);
                  return (
                    <div
                      key={tx.id}
                      className="bg-white dark:bg-slate-800 p-4 rounded-lg flex items-center gap-4 border border-gray-100 dark:border-slate-700"
                      data-testid={`card-transaction-${index}`}
                    >
                      <div className={`w-12 h-12 flex items-center justify-center ${colors.bg} rounded-full`}>
                        <span className={colors.text}>{getIcon(tx.type)}</span>
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold text-slate-800 dark:text-slate-100" data-testid="text-transaction-description">
                          {tx.description || tx.type}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400" data-testid="text-transaction-date">
                          {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="text-transaction-amount">
                          {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} CASET
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">≈ ${(tx.amount * 0.21).toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}