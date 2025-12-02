import { useRef } from 'react';
import { useWaveAnimation } from '@/hooks/useWaveAnimation';

interface HeaderWaveProps {
  className?: string;
}

export const HeaderWave: React.FC<HeaderWaveProps> = ({ 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 使用声波动画 hook
  useWaveAnimation(canvasRef);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          imageRendering: 'pixelated', // 确保 1px 线条清晰
        }}
      />
    </div>
  );
};