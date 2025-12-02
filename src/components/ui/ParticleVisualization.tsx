import { useEffect, useRef } from 'react';
import type { UserParticle } from '@/types/app';

interface ParticleVisualizationProps {
  particle: UserParticle;
  width?: number;
  height?: number;
}

export const ParticleVisualization: React.FC<ParticleVisualizationProps> = ({ 
  particle, 
  width = 400, 
  height = 128 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = width;
    canvas.height = height;

    let mounted = true;

    const animate = () => {
      if (!mounted) return;
      
      timeRef.current += 16;
      const time = timeRef.current;
      
      // 清空画布
      ctx.clearRect(0, 0, width, height);
      
      // 绘制中心主粒子
      const centerX = width / 2;
      const centerY = height / 2;
      const mainPulse = 1 + Math.sin(time * 0.003) * 0.3;
      const mainAlpha = 0.8 + Math.sin(time * 0.005) * 0.2;
      
      ctx.save();
      
      // 主粒子发光环
      ctx.globalAlpha = mainAlpha * 0.4;
      ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.3)`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20 * mainPulse, 0, Math.PI * 2);
      ctx.fill();
      
      // 主粒子核心
      ctx.globalAlpha = mainAlpha;
      ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.9)`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8 * mainPulse, 0, Math.PI * 2);
      ctx.fill();
      
      // 内部亮点
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3 * mainPulse, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
      // 绘制环绕的小粒子 (根据粒子文本长度生成)
      const satelliteCount = Math.min(Math.max(particle.text.length / 10, 3), 8);
      for (let i = 0; i < satelliteCount; i++) {
        const angle = (i / satelliteCount) * Math.PI * 2 + time * 0.001;
        const radius = 30 + Math.sin(time * 0.002 + i) * 5;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const satellitePulse = 0.5 + Math.sin(time * 0.004 + i * 0.5) * 0.3;
        const satelliteSize = 2 + satellitePulse;
        
        ctx.save();
        ctx.globalAlpha = 0.6 + satellitePulse * 0.4;
        
        // 小粒子发光
        ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.2)`;
        ctx.beginPath();
        ctx.arc(x, y, satelliteSize * 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 小粒子核心
        ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.7)`;
        ctx.beginPath();
        ctx.arc(x, y, satelliteSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
      
      // 绘制连接线 (表示共鸣链接)
      ctx.save();
      ctx.globalAlpha = 0.2 + Math.sin(time * 0.003) * 0.1;
      ctx.strokeStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.3)`;
      ctx.lineWidth = 1;
      
      for (let i = 0; i < satelliteCount; i++) {
        const angle = (i / satelliteCount) * Math.PI * 2 + time * 0.001;
        const radius = 30 + Math.sin(time * 0.002 + i) * 5;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      
      ctx.restore();
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      mounted = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particle, width, height]);

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="rounded-lg"
        style={{ background: 'transparent' }}
      />
    </div>
  );
};