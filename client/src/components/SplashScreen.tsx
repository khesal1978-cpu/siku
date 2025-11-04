import { useEffect, useState } from 'react';
import logoImage from '@assets/generated_images/PingCaset_crypto_logo_icon_e52ce570.png';
import backgroundImage from '@assets/generated_images/Green_gradient_wave_background_201c0817.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0);
      setTimeout(onComplete, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500"
      style={{ 
        opacity,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      data-testid="splash-screen"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-transparent" />
      
      <div className="relative z-10 flex flex-col items-center animate-float">
        <img src={logoImage} alt="PingCaset" className="w-32 h-32 mb-6" />
        <h1 className="text-4xl font-bold font-['Poppins'] mb-2 bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
          PingCaset
        </h1>
        <p className="text-muted-foreground text-sm">Mine. Earn. Grow.</p>
      </div>
    </div>
  );
}
