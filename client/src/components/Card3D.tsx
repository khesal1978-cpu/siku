import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { ReactNode, useState, useRef, MouseEvent, TouchEvent } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export default function Card3D({ children, className = '', intensity = 'medium' }: Card3DProps) {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const intensityConfig = {
    low: { scale: 1.01, rotate: 3, shadow: 10 },
    medium: { scale: 1.02, rotate: 5, shadow: 15 },
    high: { scale: 1.03, rotate: 8, shadow: 25 },
  };

  const config = intensityConfig[intensity];

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 35, restDelta: 0.001 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 35, restDelta: 0.001 });

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

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setIsPressed(true);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  return (
    <div style={{ perspective: (isMobile || prefersReducedMotion) ? 'none' : '1200px' }} className={className}>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: (isHovered && !isMobile && !prefersReducedMotion) ? config.scale : isPressed ? 0.97 : 1,
        }}
        style={{
          rotateX: (!isMobile && !prefersReducedMotion) ? rotateX : 0,
          rotateY: (!isMobile && !prefersReducedMotion) ? rotateY : 0,
          transformStyle: (isMobile || prefersReducedMotion) ? 'flat' : 'preserve-3d',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => !isMobile && !prefersReducedMotion && setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        transition={{
          opacity: { duration: 0.2, ease: 'easeOut' },
          y: { duration: 0.2, ease: 'easeOut' },
          scale: {
            duration: 0.15,
            type: 'spring',
            stiffness: 500,
            damping: 30,
          },
        }}
      >
        <motion.div
          style={{
            filter: (isHovered && !isMobile && !prefersReducedMotion)
              ? `drop-shadow(0 ${config.shadow}px ${config.shadow * 2}px rgba(0, 0, 0, 0.15)) brightness(1.02) saturate(1.1)`
              : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08))',
            willChange: 'filter',
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="gpu-accelerated"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
