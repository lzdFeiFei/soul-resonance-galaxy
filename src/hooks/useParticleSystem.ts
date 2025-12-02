import { useRef, useEffect, useState, useCallback } from 'react';
import { ParticlePhysics } from '@/utils/particlePhysics';
import { useCanvasStore } from '@/stores';
import type { Particle } from '@/types/particle';

export const useParticleSystem = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const physicsRef = useRef<ParticlePhysics | null>(null);
  const animationRef = useRef<number>(0);
  const isInitializedRef = useRef(false);
  
  // 直接从 store 获取需要的状态，避免解构导致的重复渲染
  const mouse = useCanvasStore(state => state.mouse);
  const updateMousePosition = useCanvasStore(state => state.updateMousePosition);
  const setHoveredParticle = useCanvasStore(state => state.setHoveredParticle);
  const incrementFrame = useCanvasStore(state => state.incrementFrame);

  /**
   * 初始化粒子系统 - 只调用一次
   */
  const initializeParticles = useCallback(() => {
    if (!canvasRef.current || isInitializedRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // 设置 Canvas 实际尺寸
    canvas.width = width;
    canvas.height = height;
    
    // 创建物理引擎
    physicsRef.current = new ParticlePhysics(width, height);
    
    // 创建粒子
    const initialParticles = ParticlePhysics.createParticleSystem(width, height);
    setParticles(initialParticles);
    
    isInitializedRef.current = true;
    
    console.log('✅ 粒子系统初始化完成:', { width, height, particleCount: initialParticles.length });
  }, [canvasRef]);

  /**
   * 渲染粒子
   */
  const renderParticles = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 渲染每个粒子
    particles.forEach(particle => {
      ctx.save();
      
      // 设置粒子样式
      ctx.globalAlpha = particle.alpha || particle.opacity || 1;
      ctx.fillStyle = `rgb(${particle.color.r}, ${particle.color.g}, ${particle.color.b})`;
      
      // 绘制粒子 (小圆点)
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // 如果鼠标悬停，添加发光效果
      if (mouse.x !== null && mouse.y !== null) {
        const distance = Math.sqrt(
          (particle.x - mouse.x) ** 2 + (particle.y - mouse.y) ** 2
        );
        
        if (distance < 50) {
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.restore();
    });
  }, [particles, mouse]);

  /**
   * 动画循环
   */
  const animate = useCallback(() => {
    if (!canvasRef.current || !physicsRef.current || !isInitializedRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 更新流场
    physicsRef.current.updateFlowField(width, height);
    
    // 更新所有粒子
    setParticles(prevParticles => {
      return prevParticles.map(particle => {
        const newParticle = { ...particle };
        physicsRef.current!.updateParticle(
          newParticle,
          mouse.x,
          mouse.y,
          width,
          height
        );
        return newParticle;
      });
    });

    // 渲染
    renderParticles(ctx, width, height);
    
    // 更新帧计数
    incrementFrame();
    
    // 继续动画
    animationRef.current = requestAnimationFrame(animate);
  }, [canvasRef, mouse, renderParticles, incrementFrame]);

  /**
   * 检测鼠标悬停的粒子
   */
  const detectHoveredParticle = useCallback((mouseX: number, mouseY: number) => {
    const hoveredParticle = particles.find(particle => {
      const distance = Math.sqrt(
        (particle.x - mouseX) ** 2 + (particle.y - mouseY) ** 2
      );
      return distance <= particle.size + 10; // 10px 容差
    });
    
    setHoveredParticle(hoveredParticle || null);
  }, [particles, setHoveredParticle]);

  /**
   * 鼠标事件处理
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      updateMousePosition(x, y);
      detectHoveredParticle(x, y);
    };

    const handleMouseLeave = () => {
      updateMousePosition(null, null);
      setHoveredParticle(null);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [canvasRef, updateMousePosition, detectHoveredParticle, setHoveredParticle]);

  /**
   * 启动动画
   */
  const startAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animate();
  }, [animate]);

  /**
   * 停止动画
   */
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
  }, []);

  /**
   * 窗口大小变化处理
   */
  useEffect(() => {
    const handleResize = () => {
      // 重置初始化状态
      isInitializedRef.current = false;
      stopAnimation();
      // 延迟重新初始化
      setTimeout(() => {
        initializeParticles();
        startAnimation();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeParticles, startAnimation, stopAnimation]);

  /**
   * 组件挂载时初始化
   */
  useEffect(() => {
    initializeParticles();
    const timer = setTimeout(() => {
      startAnimation();
    }, 100); // 稍微延迟启动动画
    
    return () => {
      clearTimeout(timer);
      stopAnimation();
    };
  }, [initializeParticles, startAnimation, stopAnimation]);

  return {
    particles,
    startAnimation,
    stopAnimation,
    initializeParticles,
  };
};