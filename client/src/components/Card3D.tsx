import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export default function Card3D({ children, className = '', intensity = 'medium' }: Card3DProps) {
  const isMobile = useIsMobile();
  const [isPressed, setIsPressed] = useState(false);

  const intensityConfig = {
    low: { scale: 1.02, rotateX: 2, rotateY: 2, z: 5 },
    medium: { scale: 1.03, rotateX: 3, rotateY: 3, z: 10 },
    high: { scale: 1.05, rotateX: 5, rotateY: 5, z: 15 },
  };

  const config = intensityConfig[intensity];

  // On mobile, use tap animations instead of hover
  const mobileAnimation = {
    scale: isPressed ? config.scale * 0.98 : 1,
    rotateX: 0,
    rotateY: 0,
    z: 0,
  };

  const desktopAnimation = {
    scale: config.scale,
    rotateX: config.rotateX,
    rotateY: config.rotateY,
    z: config.z,
  };

  return (
    <div style={{ perspective: isMobile ? 'none' : '1200px' }} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={!isMobile ? desktopAnimation : undefined}
        whileTap={isMobile ? { scale: 0.98 } : undefined}
        onTapStart={() => isMobile && setIsPressed(true)}
        onTap={() => isMobile && setIsPressed(false)}
        onTapCancel={() => isMobile && setIsPressed(false)}
        transition={{
          duration: 0.2,
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
        style={{
          transformStyle: isMobile ? 'flat' : 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
