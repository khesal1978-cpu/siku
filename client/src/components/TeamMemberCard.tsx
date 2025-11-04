import { Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface TeamMemberCardProps {
  name: string;
  coins: number;
  level: number;
  referrals: number;
  joinedDate: string;
  avatarUrl?: string;
  isDirect?: boolean;
}

export default function TeamMemberCard({ 
  name, 
  coins, 
  level, 
  referrals, 
  joinedDate,
  avatarUrl,
  isDirect = true 
}: TeamMemberCardProps) {
  return (
    <Card 
      className={`p-4 hover-elevate ${isDirect ? 'border-primary/30' : ''}`}
      data-testid={`card-team-member-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start gap-3">
        <Avatar className={`w-12 h-12 ${isDirect ? 'ring-2 ring-primary' : ''}`}>
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate" data-testid="text-member-name">{name}</h3>
            {isDirect && <Badge variant="secondary" className="text-xs">Direct</Badge>}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span data-testid="text-member-coins">{coins.toLocaleString()} CASET</span>
            <span data-testid="text-member-level">Level {level}</span>
          </div>
          
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span data-testid="text-member-referrals">{referrals} referrals</span>
            <span className="mx-1">•</span>
            <span data-testid="text-member-joined">Joined {joinedDate}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
