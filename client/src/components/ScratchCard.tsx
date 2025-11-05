import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Card3D from './Card3D';

interface ScratchCardProps {
  reward: number;
  onScratch: () => Promise<void>;
  cardId: string;
}

export default function ScratchCard({ reward, onScratch, cardId }: ScratchCardProps) {
  const [isScratched, setIsScratched] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#34d399');
    gradient.addColorStop(1, '#059669');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch Here!', canvas.width / 2, canvas.height / 2);
  }, []);

  const scratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isScratched) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }

    const progress = (transparentPixels / (pixels.length / 4)) * 100;
    setScratchProgress(progress);

    if (progress > 60 && !isScratched) {
      setIsScratched(true);
      onScratch().then(() => {
        setShowReward(true);
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      }).catch(() => {
        setIsScratched(false);
      });
    }
  };

  return (
    <Card3D intensity="medium">
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-emerald-200 dark:border-emerald-800 shadow-xl" data-testid={`card-scratch-${cardId}`}>
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Ticket className="w-6 h-6 text-emerald-600" />
          <h3 className="text-xl font-bold font-['Poppins']">Scratch Card</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Scratch to reveal your prize! (Costs 5 energy)
        </p>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
              {reward}
            </div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              CASET COINS
            </div>
          </div>
        </div>

        <motion.canvas
          ref={canvasRef}
          width={300}
          height={200}
          className="w-full rounded-lg shadow-lg cursor-pointer touch-none"
          onMouseDown={() => setIsScratching(true)}
          onMouseUp={() => setIsScratching(false)}
          onMouseMove={(e) => isScratching && scratch(e)}
          onTouchStart={() => setIsScratching(true)}
          onTouchEnd={() => setIsScratching(false)}
          onTouchMove={scratch}
          data-testid={`canvas-scratch-${cardId}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        />

        <div className="mt-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${scratchProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground mt-1">
            {Math.round(scratchProgress)}% revealed
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-center"
          >
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-lg mb-2">
              <p className="text-white font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                You won {reward} CASET!
                <Sparkles className="w-5 h-5" />
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </Card>
    </Card3D>
  );
}

interface ScratchCardListProps {
  cards: Array<{ id: string; reward: number; isScratched: boolean }>;
  onScratchCard: (cardId: string) => Promise<void>;
  onGetNewCard: () => Promise<void>;
  canGetNewCard: boolean;
}

export function ScratchCardList({ cards, onScratchCard, onGetNewCard, canGetNewCard }: ScratchCardListProps) {
  const unscratched = cards.filter(c => !c.isScratched);

  return (
    <div className="space-y-4" data-testid="container-scratch-cards">
      {unscratched.length > 0 ? (
        unscratched.map(card => (
          <ScratchCard
            key={card.id}
            cardId={card.id}
            reward={card.reward}
            onScratch={() => onScratchCard(card.id)}
          />
        ))
      ) : (
        <Card className="p-8 text-center">
          <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Cards Available</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get a new scratch card to win coins!
          </p>
          <Button
            onClick={onGetNewCard}
            disabled={!canGetNewCard}
            data-testid="button-get-card"
          >
            {canGetNewCard ? 'Get New Card (10 Energy)' : 'Not Enough Energy'}
          </Button>
        </Card>
      )}
    </div>
  );
}