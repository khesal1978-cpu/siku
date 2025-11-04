import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeDirection: number;
      pulseSpeed: number;
    }> = [];

    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 100 + 50,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.12 + 0.03,
        fadeDirection: Math.random() > 0.5 ? 1 : -1,
        pulseSpeed: Math.random() * 0.001 + 0.0003
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        particle.opacity += particle.fadeDirection * particle.pulseSpeed;
        if (particle.opacity >= 0.15) particle.fadeDirection = -1;
        if (particle.opacity <= 0.03) particle.fadeDirection = 1;

        if (particle.x < -particle.radius) particle.x = canvas.width + particle.radius;
        if (particle.x > canvas.width + particle.radius) particle.x = -particle.radius;
        if (particle.y < -particle.radius) particle.y = canvas.height + particle.radius;
        if (particle.y > canvas.height + particle.radius) particle.y = -particle.radius;

        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius
        );
        
        gradient.addColorStop(0, `rgba(16, 185, 129, ${particle.opacity * 0.9})`);
        gradient.addColorStop(0.4, `rgba(16, 185, 129, ${particle.opacity * 0.4})`);
        gradient.addColorStop(0.7, `rgba(16, 185, 129, ${particle.opacity * 0.15})`);
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.6 }}
      />
      
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 400 + 250}px`,
              height: `${Math.random() * 400 + 250}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(16, 185, 129, ${0.06 + Math.random() * 0.04}) 0%, rgba(16, 185, 129, ${0.02 + Math.random() * 0.02}) 50%, rgba(16, 185, 129, 0) 70%)`,
              filter: 'blur(60px)',
            }}
            animate={{
              x: [0, Math.random() * 150 - 75, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 150 - 75, Math.random() * 100 - 50, 0],
              scale: [1, 1.15, 1.05, 1],
              opacity: [0.7, 1, 0.8, 0.7],
            }}
            transition={{
              duration: Math.random() * 15 + 20,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    </>
  );
}
