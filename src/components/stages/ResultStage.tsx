import { useState } from 'react';
import { useAppStore } from '@/stores';
import { GlassButton } from '@/components/ui/GlassButton';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { ParticleVisualization } from '@/components/ui/ParticleVisualization';
import type { DialogueItem } from '@/types/app';
import type { UserParticle } from '@/types/app';

// 开发环境测试函数
const quickTestGalaxy = () => {
  if (import.meta.env.DEV) {
    // 直接使用已导入的 useAppStore
    const setStage = useAppStore.getState().setStage;
    setStage('galaxy_view');
  }
};

export const ResultStage: React.FC = () => {
  const { currentAIResponse, saveToGalaxy, generateResonance, resetInput } = useAppStore();
  const [showActions, setShowActions] = useState(false);

  if (!currentAIResponse) {
    return null;
  }

  const isDialogue = currentAIResponse.type === 'dialogue';
  const content = currentAIResponse.content;
  
  // 创建临时粒子用于可视化 (基于当前AI响应)
  const tempParticle: UserParticle = {
    id: `temp_${Date.now()}`,
    text: '当前共鸣内容', // 占位文本
    aiResponse: currentAIResponse,
    position: { x: 0, y: 0 },
    timestamp: Date.now(),
    color: { r: 210, g: 190, b: 160 }, // Soul Gold
  };

  const handleTypewriterComplete = () => {
    setShowActions(true);
  };

  const handleSave = () => {
    // 触发坍缩动画，然后保存到星系
    const resultElement = document.querySelector('.result-container');
    if (resultElement) {
      resultElement.classList.add('collapse-animation');
      
      // 添加粒子可视化区域的特殊效果
      const visualizationElement = resultElement.querySelector('.particle-visualization');
      if (visualizationElement) {
        visualizationElement.classList.add('particle-formation');
      }
      
      setTimeout(() => {
        saveToGalaxy();
      }, 1200); // 与动画持续时间匹配 (1.2s)
    }
  };

  const renderDialogue = (dialogue: DialogueItem[]) => (
    <div className="space-y-6">
      {dialogue.map((item, index) => (
        <div key={index} className="flex flex-col space-y-2">
          <div className={`text-sm font-playfair tracking-wider ${
            item.speaker === 'user' ? 'text-soul-gold' : 'text-soul-green'
          }`}>
            {item.speaker === 'user' ? 'YOU' : 'RESONANCE'}
          </div>
          <div className="font-noto-serif text-lg leading-relaxed text-text-primary">
            {index === dialogue.length - 1 ? (
              <TypewriterText 
                text={item.text} 
                onComplete={index === dialogue.length - 1 ? handleTypewriterComplete : undefined}
              />
            ) : (
              item.text
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPoem = (poem: string) => (
    <div className="text-center">
      <div className="font-noto-serif text-xl leading-relaxed text-text-primary italic">
        <TypewriterText 
          text={poem} 
          onComplete={handleTypewriterComplete}
          speed={80}
        />
      </div>
    </div>
  );

  return (
    <div className="result-container w-full max-w-4xl mx-auto">
      {/* 内容展示区域 */}
      <div className="glass-effect p-8 mb-8 border-l-4 border-soul-gold">
        {isDialogue ? renderDialogue(content as DialogueItem[]) : renderPoem(content as string)}
      </div>

      {/* 元信息 */}
      <div className="flex justify-center space-x-6 text-text-secondary text-sm mb-8">
        <span>Emotion: {currentAIResponse.metadata.emotion}</span>
        <span>•</span>
        <span>Frequency: {currentAIResponse.metadata.frequency}</span>
        <span>•</span>
        <span>Generated: {new Date(currentAIResponse.metadata.timestamp).toLocaleTimeString()}</span>
      </div>

      {/* 粒子可视化区域 */}
      <div className="mb-8">
        <div className="text-xs text-text-secondary mb-3 font-mono tracking-wider text-center">
          RESONANCE FIELD VISUALIZATION
        </div>
        <div className="particle-visualization glass-effect h-48 border border-glass-border rounded-lg overflow-hidden flex items-center justify-center">
          <ParticleVisualization particle={tempParticle} width={600} height={192} />
        </div>
      </div>

      {/* 操作按钮 */}
      {showActions && (
        <div className="flex justify-center space-x-6 animate-fade-in">
          <GlassButton
            onClick={handleSave}
            icon="✦"
            className="bg-soul-gold/10 border-soul-gold text-soul-gold hover:bg-soul-gold/20"
          >
            储存灵感
          </GlassButton>
          
          <GlassButton
            onClick={generateResonance}
            variant="small"
            className="text-text-secondary hover:text-text-primary"
          >
            重新生成
          </GlassButton>
          
          <GlassButton
            onClick={resetInput}
            variant="small"
            className="text-text-secondary hover:text-text-primary"
          >
            新的想法
          </GlassButton>
          
          {/* 开发环境测试按钮 */}
          {import.meta.env.DEV && (
            <GlassButton
              onClick={quickTestGalaxy}
              variant="small"
              className="text-soul-blue border-soul-blue hover:bg-soul-blue/10"
            >
              测试星系
            </GlassButton>
          )}
        </div>
      )}
    </div>
  );
};