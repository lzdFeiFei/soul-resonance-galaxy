import { useState } from 'react';
import { useAppStore } from '@/stores';
import { GlassButton } from '@/components/ui/GlassButton';

export const InputStage: React.FC = () => {
  const { currentInput, setInput, generateResonance } = useAppStore();
  const [localInput, setLocalInput] = useState(currentInput);

  const handleSubmit = () => {
    if (!localInput.trim()) return;
    setInput(localInput);
    generateResonance();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-center">
      {/* 标题区域 */}
      <div className="mb-12">
        <h2 className="font-noto-serif text-5xl font-normal mb-4 text-text-primary">
          此刻，你在想什么？
        </h2>
        <p className="text-text-secondary font-noto-serif italic text-lg">
          开始，让思绪发光...
        </p>
      </div>

      {/* 输入区域 */}
      <div className="mb-8">
        <textarea
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="在这里分享你内心的声音..."
          className={`
            w-full min-h-[150px] p-8 
            glass-effect font-noto-serif text-xl leading-relaxed
            text-text-primary placeholder:text-text-secondary/60
            border-l-4 border-text-secondary 
            focus:border-l-soul-gold focus:outline-none focus:bg-white/10
            resize-none transition-all duration-300
          `}
          autoFocus
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center">
        <GlassButton
          onClick={handleSubmit}
          disabled={!localInput.trim()}
          icon="✦"
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          开始共鸣
        </GlassButton>
      </div>

      {/* 提示文本 */}
      <p className="mt-6 text-text-secondary text-sm">
        按 <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Ctrl</kbd> + 
        <kbd className="px-2 py-1 bg-white/10 rounded text-xs ml-1">Enter</kbd> 快速提交
      </p>
    </div>
  );
};