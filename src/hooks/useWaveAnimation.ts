import { useRef, useEffect, useCallback, useState } from 'react';
import { WAVE_CONFIG } from '@/utils/constants';

export const useWaveAnimation = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const animationRef = useRef<number>();
  const [isAnimating, setIsAnimating] = useState(false);
  const timeRef = useRef(0);

  /**
   * 渲染 16 根声波条
   * 严格按照原版规范：1px 线宽，5px 间距，高-低-高 节奏，金色与灰色交替
   */
  const renderWaves = useCallback((time: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { barCount, barWidth, barSpacing, heights, colors } = WAVE_CONFIG;
    const totalWidth = barCount * (barWidth + barSpacing) - barSpacing;
    const startX = (canvas.width - totalWidth) / 2;

    // 绘制每根声波条
    for (let i = 0; i < barCount; i++) {
      const x = startX + i * (barWidth + barSpacing);
      
      // 基础高度 (来自配置的节奏数组)
      const baseHeight = heights[i];
      
      // 动态动画：正弦波叠加，每根条有不同的相位
      const phase = (i * 0.3) + (time * 0.003); // 不同相位和时间推移
      const animation1 = Math.sin(phase) * 0.3;
      const animation2 = Math.sin(phase * 1.5) * 0.2;
      const animation3 = Math.sin(phase * 0.7) * 0.1;
      
      // 组合动画效果
      const animatedHeight = baseHeight + animation1 + animation2 + animation3;
      const clampedHeight = Math.max(0.1, Math.min(1.0, animatedHeight));
      
      // 计算实际像素高度
      const pixelHeight = clampedHeight * canvas.height;
      const y = (canvas.height - pixelHeight) / 2;

      // 颜色交替：偶数索引用金色，奇数索引用灰色
      ctx.fillStyle = i % 2 === 0 ? colors.active : colors.muted;
      
      // 绘制声波条
      ctx.fillRect(x, y, barWidth, pixelHeight);
    }
  }, [canvasRef]);

  /**
   * 动画循环
   */
  const animate = useCallback(() => {
    timeRef.current += 16; // 约 60fps
    renderWaves(timeRef.current);
    
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [renderWaves, isAnimating]);

  /**
   * 启动动画
   */
  const startAnimation = useCallback(() => {
    setIsAnimating(true);
  }, []);

  /**
   * 停止动画
   */
  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  /**
   * 设置画布尺寸
   */
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, [canvasRef]);

  // 开始动画当 isAnimating 变化时
  useEffect(() => {
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animate]);

  // 初始化
  useEffect(() => {
    resizeCanvas();
    startAnimation();
    
    // 窗口大小变化处理
    const handleResize = () => {
      resizeCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      stopAnimation();
      window.removeEventListener('resize', handleResize);
    };
  }, [resizeCanvas, startAnimation, stopAnimation]);

  return {
    startAnimation,
    stopAnimation,
    isAnimating,
  };
};