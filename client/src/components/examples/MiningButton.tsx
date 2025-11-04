import { useState } from 'react';
import MiningButton from '../MiningButton';

export default function MiningButtonExample() {
  const [isActive, setIsActive] = useState(true);
  const [progress, setProgress] = useState(67);

  const handleMine = () => {
    console.log('Mining started!');
    setIsActive(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-8">
      <MiningButton 
        isActive={isActive} 
        progress={progress} 
        onMine={handleMine}
      />
    </div>
  );
}
