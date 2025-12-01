import { useEffect, useRef, useState } from 'react';
import { useAppStore, useGalaxyStore } from '@/stores';
import { GlassButton } from '@/components/ui/GlassButton';
import { EchoPanel } from '@/components/ui/EchoPanel';
import { calculateSpiralPosition, generateRandomGalaxyPosition, smoothMove, isNearTarget } from '@/utils/galaxyMath';
import { OTHER_GALAXIES_DATA } from '@/utils/constants';
import type { Galaxy, UserParticle } from '@/types/galaxy';

export const GalaxyStage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const cameraRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedParticle, setSelectedParticle] = useState<string | null>(null);
  const [echoPanelOpen, setEchoPanelOpen] = useState(false);
  const [echoPanelParticle, setEchoPanelParticle] = useState<UserParticle | null>(null);
  
  const { setStage } = useAppStore();
  const { userGalaxy, otherGalaxies, viewingTarget, setViewingTarget } = useGalaxyStore();

  /**
   * 初始化星系数据 (如果还没有其他星系)
   */
  useEffect(() => {
    const { addOtherGalaxy } = useGalaxyStore.getState();
    
    // 如果还没有其他星系，创建初始星系
    if (otherGalaxies.length === 0) {
      const existingPositions = [userGalaxy.position];
      
      OTHER_GALAXIES_DATA.forEach((data, index) => {
        const position = generateRandomGalaxyPosition(existingPositions);
        existingPositions.push(position);
        
        addOtherGalaxy({
          id: data.id,
          content: data.content,
          position,
        });
      });
    }
  }, [otherGalaxies.length, userGalaxy.position]);

  /**
   * 渲染星系
   */
  const renderGalaxies = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const camera = cameraRef.current;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 设置坐标系中心
    ctx.save();
    ctx.translate(width / 2 - camera.x, height / 2 - camera.y);
    
    // 渲染用户星系
    renderUserGalaxy(ctx);
    
    // 渲染其他星系
    otherGalaxies.forEach(galaxy => {
      renderOtherGalaxy(ctx, galaxy);
    });
    
    ctx.restore();
  };

  /**
   * 渲染用户星系 (黄金角度螺旋) - 添加动态效果
   */
  const renderUserGalaxy = (ctx: CanvasRenderingContext2D) => {
    const { position, particles } = userGalaxy;
    const time = timeRef.current;
    
    // 绘制星系中心标记 (添加呼吸动画)
    ctx.save();
    const centerPulse = 1 + Math.sin(time * 0.003) * 0.2;
    const centerAlpha = 0.8 + Math.sin(time * 0.005) * 0.2;
    ctx.fillStyle = `rgba(210, 190, 160, ${centerAlpha})`;
    ctx.beginPath();
    ctx.arc(position.x, position.y, 8 * centerPulse, 0, Math.PI * 2);
    ctx.fill();
    
    // 中心发光环
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(position.x, position.y, 15 * centerPulse, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制星系名称
    ctx.globalAlpha = centerAlpha;
    ctx.fillStyle = 'rgba(210, 190, 160, 0.9)';
    ctx.font = '14px "Noto Serif SC"';
    ctx.textAlign = 'center';
    ctx.fillText('我的星系', position.x, position.y - 20);
    ctx.restore();
    
    // 绘制螺旋中的粒子 (添加浮动和闪烁动画)
    particles.forEach((particle, index) => {
      // 重新计算螺旋位置
      const spiralPos = calculateSpiralPosition(index, position.x, position.y);
      
      // 粒子动画参数
      const phase = time * 0.002 + index * 0.5;
      const floatX = Math.sin(phase) * 2;
      const floatY = Math.cos(phase * 1.3) * 1.5;
      const twinkle = 0.6 + Math.sin(time * 0.004 + index * 0.3) * 0.4;
      const size = 3 + Math.sin(time * 0.003 + index * 0.8) * 0.5;
      
      const finalX = spiralPos.x + floatX;
      const finalY = spiralPos.y + floatY;
      
      // 检查是否为被选中的粒子
      const isSelected = selectedParticle === particle.id;
      const selectedScale = isSelected ? 1.5 : 1;
      const selectedGlow = isSelected ? 1.2 : 1;
      
      ctx.save();
      ctx.globalAlpha = twinkle * (isSelected ? 1.2 : 1);
      
      // 如果被选中，添加选中特效
      if (isSelected) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)'; // 金色选中光环
        ctx.beginPath();
        ctx.arc(finalX, finalY, size * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // 主粒子
      ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.9)`;
      ctx.beginPath();
      ctx.arc(finalX, finalY, size * selectedScale, 0, Math.PI * 2);
      ctx.fill();
      
      // 内部亮点
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(finalX, finalY, size * 0.3 * selectedScale, 0, Math.PI * 2);
      ctx.fill();
      
      // 粒子发光光晕
      ctx.globalAlpha = twinkle * 0.4 * selectedGlow;
      ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.3)`;
      ctx.beginPath();
      ctx.arc(finalX, finalY, size * 3 * selectedScale, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
  };

  /**
   * 渲染其他星系 - 添加动态效果
   */
  const renderOtherGalaxy = (ctx: CanvasRenderingContext2D, galaxy: Galaxy) => {
    const { position, id } = galaxy;
    const time = timeRef.current;
    const galaxyHash = id.length; // 简单hash作为相位差
    
    // 动画参数
    const pulse = 1 + Math.sin(time * 0.002 + galaxyHash) * 0.15;
    const alpha = 0.7 + Math.sin(time * 0.003 + galaxyHash * 0.5) * 0.2;
    const particleFloat = Math.sin(time * 0.001 + galaxyHash * 0.8) * 1;
    
    ctx.save();
    
    // 绘制星系中心 (呼吸效果)
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(140, 160, 150, 0.8)'; // soul-green
    ctx.beginPath();
    ctx.arc(position.x, position.y, 6 * pulse, 0, Math.PI * 2);
    ctx.fill();
    
    // 中心发光
    ctx.globalAlpha = alpha * 0.4;
    ctx.beginPath();
    ctx.arc(position.x, position.y, 12 * pulse, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制星系 ID
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(140, 160, 150, 0.7)';
    ctx.font = '12px "Playfair Display"';
    ctx.textAlign = 'center';
    ctx.fillText(id, position.x, position.y - 15);
    
    // 绘制浮动粒子
    const particleX = position.x + particleFloat;
    const particleY = position.y;
    const particleSize = 2 + Math.sin(time * 0.004 + galaxyHash) * 0.5;
    
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(180, 170, 190, 0.8)'; // soul-purple
    ctx.beginPath();
    ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 粒子发光
    ctx.globalAlpha = alpha * 0.3;
    ctx.beginPath();
    ctx.arc(particleX, particleY, particleSize * 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  /**
   * 检测鼠标点击是否在粒子范围内
   */
  const isPointInParticle = (mouseX: number, mouseY: number, particleX: number, particleY: number, radius: number = 8) => {
    const distance = Math.sqrt((mouseX - particleX) ** 2 + (mouseY - particleY) ** 2);
    return distance <= radius;
  };

  /**
   * 将屏幕坐标转换为世界坐标
   */
  const screenToWorldCoords = (screenX: number, screenY: number, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const camera = cameraRef.current;
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;
    
    return {
      x: canvasX - canvas.width / 2 + camera.x,
      y: canvasY - canvas.height / 2 + camera.y
    };
  };

  /**
   * 处理Canvas点击事件 - 检测粒子点击
   */
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const worldCoords = screenToWorldCoords(event.clientX, event.clientY, canvas);
    const time = timeRef.current;
    
    // 检测用户星系中的粒子点击
    if (viewingTarget === 'user-galaxy') {
      for (let index = 0; index < userGalaxy.particles.length; index++) {
        const particle = userGalaxy.particles[index];
        const spiralPos = calculateSpiralPosition(index, userGalaxy.position.x, userGalaxy.position.y);
        
        // 计算粒子的实时动画位置 (与渲染逻辑保持一致)
        const phase = time * 0.002 + index * 0.5;
        const floatX = Math.sin(phase) * 2;
        const floatY = Math.cos(phase * 1.3) * 1.5;
        const currentSize = 3 + Math.sin(time * 0.003 + index * 0.8) * 0.5;
        
        const finalX = spiralPos.x + floatX;
        const finalY = spiralPos.y + floatY;
        
        if (isPointInParticle(worldCoords.x, worldCoords.y, finalX, finalY, currentSize + 3)) {
          console.log('粒子被点击:', particle.id, particle.text);
          setSelectedParticle(particle.id);
          setEchoPanelParticle(particle);
          setEchoPanelOpen(true);
          return;
        }
      }
    }
    
    // 清除选择状态
    setSelectedParticle(null);
  };

  /**
   * 关闭回声面板
   */
  const handleEchoPanelClose = () => {
    setEchoPanelOpen(false);
    setSelectedParticle(null);
    // 延迟清除 particle 数据，等待关闭动画完成
    setTimeout(() => {
      setEchoPanelParticle(null);
    }, 300);
  };

  /**
   * 摄像机移动到目标星系
   */
  const moveCameraToGalaxy = (galaxyId: string) => {
    let targetPosition: { x: number; y: number };
    
    if (galaxyId === 'user-galaxy') {
      targetPosition = userGalaxy.position;
    } else {
      const galaxy = otherGalaxies.find(g => g.id === galaxyId);
      targetPosition = galaxy?.position || { x: 0, y: 0 };
    }
    
    setIsTransitioning(true);
    setViewingTarget(galaxyId);
    
    // 平滑移动动画
    const animateCamera = () => {
      const current = cameraRef.current;
      const newPosition = smoothMove(current, targetPosition, 0.05);
      
      cameraRef.current = newPosition;
      
      if (isNearTarget(current, targetPosition, 10)) {
        setIsTransitioning(false);
        return;
      }
      
      requestAnimationFrame(animateCamera);
    };
    
    animateCamera();
  };

  /**
   * 主要渲染循环
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateCanvasSize();

    // 渲染循环
    const animate = () => {
      updateCanvasSize();
      timeRef.current += 16; // 添加时间进度，约60fps
      renderGalaxies(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 窗口大小变化
    const handleResize = () => updateCanvasSize();
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [userGalaxy, otherGalaxies]);

  return (
    <div className="relative w-full h-full">
      {/* Canvas 渲染层 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer"
        style={{ background: 'transparent' }}
        onClick={handleCanvasClick}
      />

      {/* 右侧星系列表 */}
      <div className="absolute top-32 right-12 text-right pointer-events-auto">
        <div className="text-text-secondary text-xs mb-5 border-b border-glass-border inline-block pb-1">
          OTHER SOULS
        </div>
        <ul className="space-y-3">
          {otherGalaxies.map((galaxy) => (
            <li
              key={galaxy.id}
              className={`
                font-playfair text-sm cursor-pointer transition-all duration-400 opacity-60
                hover:opacity-100 hover:text-text-primary hover:translate-x-2
                ${viewingTarget === galaxy.id ? 'opacity-100 text-soul-gold' : 'text-text-secondary'}
              `}
              onClick={() => moveCameraToGalaxy(galaxy.id)}
            >
              {galaxy.id}
            </li>
          ))}
        </ul>
      </div>

      {/* 底部控制区域 */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center pointer-events-auto">
        <div className="space-y-4">
          {/* 我的星系信息 */}
          <div 
            className={`
              transition-opacity duration-500
              ${viewingTarget === 'user-galaxy' ? 'opacity-100' : 'opacity-60'}
            `}
          >
            <div className="text-soul-gold text-sm font-playfair mb-2">
              MY SOUL GALAXY
            </div>
            <div className="text-text-secondary text-xs">
              Level {userGalaxy.metadata?.level} • {userGalaxy.particles.length} particles
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center space-x-6">
            <GlassButton
              onClick={() => moveCameraToGalaxy('user-galaxy')}
              variant="small"
              className={viewingTarget === 'user-galaxy' ? 'border-soul-gold text-soul-gold' : ''}
              disabled={isTransitioning}
            >
              回到我的星系
            </GlassButton>
            
            <GlassButton
              onClick={() => setStage('input')}
              icon="✦"
              className="border-soul-gold text-soul-gold bg-soul-gold/10 hover:bg-soul-gold/20"
            >
              点亮新灵感
            </GlassButton>
          </div>
        </div>
      </div>

      {/* 回声面板 */}
      <EchoPanel 
        isOpen={echoPanelOpen}
        particle={echoPanelParticle}
        onClose={handleEchoPanelClose}
      />
    </div>
  );
};