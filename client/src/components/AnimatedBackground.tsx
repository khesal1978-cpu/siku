import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Optimized particle system for 60fps
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

    const particleCount = 35; // Reduced for better performance

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 120 + 60,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.1 + 0.02,
        fadeDirection: Math.random() > 0.5 ? 1 : -1,
        pulseSpeed: Math.random() * 0.0008 + 0.0002
      });
    }

    let lastTime = 0;
    const targetFPS = 60; // Target 60 FPS
    const frameTime = 1000 / targetFPS;

    function animate(currentTime: number) {
      if (!ctx || !canvas) return;

      const deltaTime = currentTime - lastTime;

      // Throttle to maintain consistent frame rate
      if (deltaTime < frameTime) {
        requestAnimationFrame(animate);
        return;
      }

      lastTime = currentTime - (deltaTime % frameTime);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        particle.opacity += particle.fadeDirection * particle.pulseSpeed;
        if (particle.opacity >= 0.12) particle.fadeDirection = -1;
        if (particle.opacity <= 0.02) particle.fadeDirection = 1;

        if (particle.x < -particle.radius) particle.x = canvas.width + particle.radius;
        if (particle.x > canvas.width + particle.radius) particle.x = -particle.radius;
        if (particle.y < -particle.radius) particle.y = canvas.height + particle.radius;
        if (particle.y > canvas.height + particle.radius) particle.y = -particle.radius;

        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius
        );

        gradient.addColorStop(0, `rgba(16, 185, 129, ${particle.opacity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(16, 185, 129, ${particle.opacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

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
      {/* Canvas particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ 
          opacity: 0.7,
          willChange: 'transform'
        }}
      />

      {/* Liquid blobs - CSS animated for 60fps */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="liquid-blob liquid-blob-1" />
        <div className="liquid-blob liquid-blob-2" />
      </div>

      {/* SVG liquid effect - simplified for performance */}
      <svg className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.4 }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
        <g filter="url(#goo)">
          <circle className="liquid-circle liquid-circle-1" r="80" fill="rgba(16, 185, 129, 0.3)" />
          <circle className="liquid-circle liquid-circle-2" r="100" fill="rgba(16, 185, 129, 0.25)" />
        </g>
      </svg>
    </>
  );
}