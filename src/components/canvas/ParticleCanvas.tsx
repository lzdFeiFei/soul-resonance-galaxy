import { useRef, useEffect } from 'react';
import { useParticleSystem } from '@/hooks/useParticleSystem';
import { useAppStore } from '@/stores';

interface ParticleCanvasProps {
  className?: string;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { stage } = useAppStore();
  
  // 使用粒子系统 hook
  const { startAnimation, stopAnimation } = useParticleSystem(canvasRef);

  // 根据应用状态控制动画
  useEffect(() => {
    if (stage === 'loading') {
      // 在 loading 阶段可能需要不同的动画效果
      startAnimation();
    } else {
      startAnimation();
    }

    return () => {
      stopAnimation();
    };
  }, [stage, startAnimation, stopAnimation]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none canvas-screen ${className}`}
      style={{
        zIndex: 0,
        mixBlendMode: 'screen', // 保持原版的混合模式
      }}
    />
  );
};