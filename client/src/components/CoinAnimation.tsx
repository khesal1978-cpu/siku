import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';

interface CoinAnimationProps {
  amount: number;
  show: boolean;
  onComplete?: () => void;
}

export default function CoinAnimation({ amount, show, onComplete }: CoinAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          {[...Array(8)].map((_, i) => {
            const angle = (Math.PI * 2 * i) / 8;
            const distance = 150;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            return (
              <motion.div
                key={i}
                className="absolute"
                initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                animate={{
                  x,
                  y,
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.05,
                  ease: "easeOut",
                }}
              >
                <Coins className="w-8 h-8 text-yellow-400" />
              </motion.div>
            );
          })}

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="px-8 py-4 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-2xl">
              <p className="text-white font-bold text-3xl">+{amount}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
