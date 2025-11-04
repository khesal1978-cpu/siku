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
          {[...Array(12)].map((_, i) => {
            const angle = (Math.PI * 2 * i) / 12;
            const distance = 180;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            return (
              <motion.div
                key={i}
                className="absolute"
                initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
                animate={{
                  x,
                  y,
                  scale: [0, 1.8, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 360, 720],
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.04,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                <Coins className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
              </motion.div>
            );
          })}

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ 
              duration: 0.6,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
          >
            <motion.div 
              className="px-10 py-6 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 shadow-2xl"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(251, 191, 36, 0.5)",
                  "0 0 40px rgba(251, 191, 36, 0.8)",
                  "0 0 20px rgba(251, 191, 36, 0.5)",
                ],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.p 
                className="text-white font-bold text-4xl"
                initial={{ scale: 0.5 }}
                animate={{ scale: [0.5, 1.1, 1] }}
                transition={{ duration: 0.5, times: [0, 0.6, 1] }}
              >
                +{amount}
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
