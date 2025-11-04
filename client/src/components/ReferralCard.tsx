import { Copy, Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ReferralCardProps {
  referralCode: string;
}

export default function ReferralCard({ referralCode }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Referral code copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const shareText = `Join me on PingCaset and start mining Caset coins! Use my referral code: ${referralCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join PingCaset',
        text: shareText,
      });
    } else {
      console.log('Share triggered:', shareText);
      toast({
        title: 'Share',
        description: 'Share this link with your friends!',
      });
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20" data-testid="card-referral">
      <h3 className="font-bold text-lg mb-2">Your Referral Code</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Share your code and earn rewards together!
      </p>
      
      <div className="bg-background/60 backdrop-blur-sm rounded-lg p-4 mb-4 border border-primary/10">
        <p className="text-center text-2xl font-bold font-['Poppins'] tracking-wider text-primary" data-testid="text-referral-code">
          {referralCode}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          onClick={handleCopy}
          data-testid="button-copy-code"
          className="gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button 
          onClick={handleShare}
          data-testid="button-share-code"
          className="gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>

      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">You earn:</span>
          <span className="font-bold text-primary">500 CASET</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Friend earns:</span>
          <span className="font-bold text-chart-2">900 CASET</span>
        </div>
      </div>
    </Card>
  );
}
