import { Trophy, Medal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LeaderboardItemProps {
  rank: number;
  name: string;
  coins: number;
  country?: string;
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

export default function LeaderboardItem({ 
  rank, 
  name, 
  coins, 
  country = 'Global',
  avatarUrl,
  isCurrentUser = false 
}: LeaderboardItemProps) {
  const getRankIcon = () => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-chart-2" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <div 
      className={`flex items-center gap-4 p-4 rounded-lg hover-elevate ${isCurrentUser ? 'bg-primary/5 border border-primary/20' : ''}`}
      data-testid={`item-leaderboard-rank-${rank}`}
    >
      <div className="w-8 text-center">
        {getRankIcon() || (
          <span className="text-lg font-bold font-['Poppins'] text-muted-foreground" data-testid="text-rank">
            {rank}
          </span>
        )}
      </div>
      
      <Avatar className="w-10 h-10">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback className="bg-muted text-foreground font-semibold">
          {name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate" data-testid="text-leader-name">
          {name}
          {isCurrentUser && <span className="text-primary ml-2">(You)</span>}
        </h3>
        <p className="text-xs text-muted-foreground" data-testid="text-leader-country">{country}</p>
      </div>
      
      <div className="text-right">
        <p className="text-sm font-bold font-['Poppins'] tabular-nums" data-testid="text-leader-coins">
          {coins.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">CASET</p>
      </div>
    </div>
  );
}
