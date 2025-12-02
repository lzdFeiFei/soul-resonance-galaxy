import { useEffect, useRef, useState } from 'react';
import { GlassButton } from '@/components/ui/GlassButton';
import { ParticleVisualization } from '@/components/ui/ParticleVisualization';
import type { UserParticle } from '@/types/app';

interface EchoPanelProps {
  isOpen: boolean;
  particle: UserParticle | null;
  onClose: () => void;
}

export const EchoPanel: React.FC<EchoPanelProps> = ({ isOpen, particle, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [animationState, setAnimationState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');

  useEffect(() => {
    if (isOpen && particle) {
      setAnimationState('opening');
      // 短暂延迟后设置为 open 状态
      const timeout = setTimeout(() => {
        setAnimationState('open');
      }, 50);
      return () => clearTimeout(timeout);
    } else if (!isOpen && animationState !== 'closed') {
      setAnimationState('closing');
      // 等待关闭动画完成后设置为 closed
      const timeout = setTimeout(() => {
        setAnimationState('closed');
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, particle, animationState]);

  // 处理背景点击关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 处理 ESC 键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (animationState === 'closed' || !particle) {
    return null;
  }

  const shouldShow = animationState === 'opening' || animationState === 'open';

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex justify-end
        transition-all duration-300 ease-out
        ${shouldShow ? 'bg-black/20 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-0'}
      `}
      onClick={handleBackdropClick}
    >
      <div 
        ref={panelRef}
        className={`
          w-[500px] h-full glass-effect
          transform transition-all duration-300 ease-out
          flex flex-col overflow-hidden
          border-l border-glass-border
          ${shouldShow ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        {/* 头部区域 */}
        <div className="flex items-center justify-between p-6 border-b border-glass-border">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-soul-gold animate-pulse"></div>
            <h2 className="text-text-primary font-playfair text-lg">
              ECHO RESONANCE
            </h2>
          </div>
          <GlassButton
            onClick={onClose}
            variant="small"
            className="text-text-secondary hover:text-text-primary"
          >
            ✕
          </GlassButton>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 粒子信息 */}
          <div className="mb-6">
            <div className="text-xs text-text-secondary mb-2 font-mono tracking-wider">
              PARTICLE #{particle.id.slice(-8).toUpperCase()}
            </div>
            <div className="text-sm text-soul-gold mb-1">
              Original Input
            </div>
            <div className="text-text-primary font-noto-serif text-base leading-relaxed mb-4">
              {particle.text}
            </div>
          </div>

          {/* AI 响应内容 */}
          <div className="mb-6">
            <div className="text-sm text-soul-green mb-3 flex items-center space-x-2">
              <span>AI Resonance</span>
              <span className="px-2 py-1 bg-soul-green/10 border border-soul-green/20 rounded text-xs">
                {particle.aiResponse.type.toUpperCase()}
              </span>
            </div>
            
            {particle.aiResponse.type === 'dialogue' ? (
              <div className="space-y-4">
                {(particle.aiResponse.content as any[]).map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className={`text-xs font-playfair tracking-wider ${
                      item.speaker === 'user' ? 'text-soul-gold' : 'text-soul-green'
                    }`}>
                      {item.speaker === 'user' ? 'YOU' : 'RESONANCE'}
                    </div>
                    <div className="text-text-primary font-noto-serif leading-relaxed">
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-text-primary font-noto-serif leading-relaxed italic">
                {particle.aiResponse.content as string}
              </div>
            )}
          </div>

          {/* 元数据 */}
          <div className="border-t border-glass-border pt-4">
            <div className="text-xs text-text-secondary mb-3 font-mono tracking-wider">
              RESONANCE METADATA
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-secondary">Emotion:</span>
                <span className="text-text-primary ml-2">{particle.aiResponse.metadata.emotion}</span>
              </div>
              <div>
                <span className="text-text-secondary">Frequency:</span>
                <span className="text-text-primary ml-2">{particle.aiResponse.metadata.frequency}</span>
              </div>
              <div className="col-span-2">
                <span className="text-text-secondary">Created:</span>
                <span className="text-text-primary ml-2">
                  {new Date(particle.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 粒子可视化区域 */}
          <div className="mt-6">
            <div className="text-xs text-text-secondary mb-2 font-mono tracking-wider">
              PARTICLE RESONANCE FIELD
            </div>
            <div className="h-32 glass-effect border border-glass-border rounded-lg overflow-hidden">
              <ParticleVisualization particle={particle} width={440} height={128} />
            </div>
          </div>
        </div>

        {/* 底部操作区域 */}
        <div className="border-t border-glass-border p-6">
          <div className="flex justify-between items-center">
            <GlassButton
              variant="small"
              className="text-text-secondary hover:text-text-primary"
            >
              Export Resonance
            </GlassButton>
            <GlassButton
              onClick={onClose}
              className="bg-soul-gold/10 border-soul-gold text-soul-gold hover:bg-soul-gold/20"
            >
              Close Echo
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
};