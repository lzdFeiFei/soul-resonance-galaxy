import { useEffect, useState } from 'react';

export const LoadingStage: React.FC = () => {
  const [scanProgress, setScanProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    'Analyzing emotional frequencies...',
    'Parsing semantic patterns...',
    'Searching cosmic resonance...',
    'Generating soul echo...',
  ];

  useEffect(() => {
    // 模拟扫描进度
    const progressTimer = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    // 文本步骤切换
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 800);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [steps.length]);

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      {/* 扫描线动画区域 */}
      <div className="relative mb-8 h-32">
        <div className="absolute inset-0 border border-accent-line bg-black/20 backdrop-blur-sm">
          {/* 扫描线 */}
          <div 
            className="absolute top-0 left-0 w-full h-0.5 bg-soul-gold shadow-lg shadow-soul-gold/50"
            style={{
              transform: `translateY(${scanProgress * 1.28}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          />
          
          {/* 进度百分比 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-playfair text-6xl font-light text-soul-gold">
              {scanProgress}%
            </span>
          </div>
        </div>
      </div>

      {/* 状态文本 */}
      <div className="space-y-4">
        <p className="font-noto-serif text-xl text-text-primary">
          {steps[currentStep]}
        </p>
        
        {/* 频率显示 */}
        <div className="flex justify-center items-center space-x-4 text-text-secondary text-sm">
          <span>Frequency: 432Hz</span>
          <span>•</span>
          <span>Resonance: {Math.floor(scanProgress * 0.8 + 20)}%</span>
          <span>•</span>
          <span>Depth: {Math.floor(Math.random() * 3) + 3}D</span>
        </div>
      </div>

      {/* 底部装饰性波形 */}
      <div className="mt-12 flex justify-center space-x-1">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="w-0.5 bg-soul-gold/30"
            style={{
              height: `${Math.sin((scanProgress + i * 10) * 0.1) * 20 + 30}px`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};