import { useRef, useEffect } from 'react';
import { ParticlePhysics } from '@/utils/particlePhysics';
import type { Particle } from '@/types/particle';

interface SimpleParticleCanvasProps {
  className?: string;
}

export const SimpleParticleCanvas: React.FC<SimpleParticleCanvasProps> = ({ 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const physicsRef = useRef<ParticlePhysics | null>(null);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 初始化 Canvas 尺寸
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // 重新初始化粒子系统
      physicsRef.current = new ParticlePhysics(canvas.width, canvas.height);
      particlesRef.current = ParticlePhysics.createParticleSystem(canvas.width, canvas.height);
      
      console.log('✅ 简化粒子系统初始化:', { 
        width: canvas.width, 
        height: canvas.height, 
        particles: particlesRef.current.length 
      });
    };

    updateSize();

    // 鼠标事件
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    // 动画循环
    const animate = () => {
      if (!physicsRef.current) return;

      // 更新流场
      physicsRef.current.updateFlowField(canvas.width, canvas.height);

      // 更新粒子
      particlesRef.current.forEach(particle => {
        physicsRef.current!.updateParticle(
          particle,
          mouseRef.current.x,
          mouseRef.current.y,
          canvas.width,
          canvas.height
        );
      });

      // 渲染
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.alpha || particle.opacity || 1;
        ctx.fillStyle = `rgb(${particle.color.r}, ${particle.color.g}, ${particle.color.b})`;
        
        // 绘制粒子
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 鼠标发光效果
        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const dx = particle.x - mouseRef.current.x;
          const dy = particle.y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 50) {
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // 启动动画
    animate();

    // 事件监听
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', updateSize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none canvas-screen ${className}`}
      style={{
        zIndex: 0,
        mixBlendMode: 'screen',
      }}
    />
  );
};