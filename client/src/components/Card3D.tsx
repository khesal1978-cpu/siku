import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export default function Card3D({ children, className = '', intensity = 'medium' }: Card3DProps) {
  const intensityConfig = {
    low: { scale: 1.02, rotateX: 3, rotateY: 3, z: 10 },
    medium: { scale: 1.05, rotateX: 5, rotateY: 5, z: 20 },
    high: { scale: 1.08, rotateX: 8, rotateY: 8, z: 30 },
  };

  const config = intensityConfig[intensity];

  return (
    <div style={{ perspective: '1200px' }} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: -10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        whileHover={{
          scale: config.scale,
          rotateX: config.rotateX,
          rotateY: config.rotateY,
          z: config.z,
        }}
        whileTap={{
          scale: config.scale,
          rotateX: config.rotateX,
          rotateY: config.rotateY,
          z: config.z,
        }}
        transition={{
          duration: 0.3,
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
