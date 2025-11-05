import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, useState, useRef, MouseEvent } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export default function Card3D({ children, className = '', intensity = 'medium' }: Card3DProps) {
  const isMobile = useIsMobile();
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const intensityConfig = {
    low: { scale: 1.02, rotate: 5, shadow: 15 },
    medium: { scale: 1.03, rotate: 8, shadow: 25 },
    high: { scale: 1.05, rotate: 12, shadow: 35 },
  };

  const config = intensityConfig[intensity];

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [config.rotate, -config.rotate]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-config.rotate, config.rotate]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div style={{ perspective: isMobile ? 'none' : '1200px' }} className={className}>
      <motion.div
<<<<<<< HEAD
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: isHovered && !isMobile ? config.scale : isPressed ? 0.98 : 1,
=======
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
>>>>>>> b2bd29d5c92221f983b7da48ff89c1519981b7c8
        }}
        style={{
          rotateX: !isMobile ? rotateX : 0,
          rotateY: !isMobile ? rotateY : 0,
          transformStyle: isMobile ? 'flat' : 'preserve-3d',
          willChange: 'transform',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onTapStart={() => isMobile && setIsPressed(true)}
        onTap={() => isMobile && setIsPressed(false)}
        onTapCancel={() => isMobile && setIsPressed(false)}
        transition={{
          opacity: { duration: 0.3 },
          y: { duration: 0.3 },
          scale: {
            duration: 0.2,
            type: 'spring',
            stiffness: 400,
            damping: 25,
          },
        }}
      >
        <motion.div
          style={{
            filter: isHovered && !isMobile 
              ? `drop-shadow(0 ${config.shadow}px ${config.shadow * 2}px rgba(0, 0, 0, 0.15)) brightness(1.02) saturate(1.1)`
              : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08))',
          }}
          transition={{ duration: 0.3 }}
          className="gpu-accelerated"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
