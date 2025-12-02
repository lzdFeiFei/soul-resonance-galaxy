import React, { useState } from 'react';
import { useAppStore } from '@/stores';
import { GlassButton } from '@/components/ui/GlassButton';
import type { LLMProvider } from '@/types/llm';

const providers: { value: LLMProvider; label: string; description: string }[] = [
  { value: 'openai', label: 'OpenAI', description: 'GPT-4 Turbo' },
  { value: 'anthropic', label: 'Anthropic', description: 'Claude 3 Opus' },
  { value: 'qwen', label: '通义千问', description: 'Qwen Max' },
  { value: 'modelscope', label: '魔搭社区', description: '通义千问 (DashScope)' },
  { value: 'google', label: 'Google', description: 'Gemini Pro' },
  { value: 'zhipu', label: '智谱AI', description: 'GLM-4' },
  { value: 'baidu', label: '百度', description: '文心一言 4.0' },
];

export const LLMSettings: React.FC = () => {
  const {
    useMockData,
    currentProvider,
    apiError,
    toggleMockData,
    switchProvider,
    clearError
  } = useAppStore();
  
  const [isOpen, setIsOpen] = useState(false);
  
  const hasApiKey = !!(
    import.meta.env.VITE_OPENAI_API_KEY ||
    import.meta.env.VITE_ANTHROPIC_API_KEY ||
    import.meta.env.VITE_QWEN_API_KEY ||
    import.meta.env.VITE_MODELSCOPE_API_KEY ||
    import.meta.env.VITE_GOOGLE_API_KEY ||
    import.meta.env.VITE_ZHIPU_API_KEY ||
    import.meta.env.VITE_BAIDU_API_KEY
  );
  
  return (
    <>
      {/* 设置按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 p-2 glass-effect rounded-lg hover:bg-white/10 transition-colors"
        aria-label="设置"
      >
        <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      
      {/* 错误提示 */}
      {apiError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
          bg-red-500/20 backdrop-blur-lg border border-red-500/30 rounded-lg p-4
          flex items-center gap-3 max-w-md">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-100 text-sm">{apiError}</span>
          <button 
            onClick={clearError}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* 设置面板 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-effect rounded-2xl p-6 space-y-6">
            {/* 标题 */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-noto-serif text-text-primary">大模型设置</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* 模式切换 */}
            <div className="space-y-3">
              <label className="text-text-primary font-medium">数据源</label>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleMockData(true)}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                    useMockData 
                      ? 'bg-soul-gold/20 border-2 border-soul-gold text-soul-gold' 
                      : 'glass-effect text-text-secondary hover:bg-white/10'
                  }`}
                >
                  <div className="font-medium">离线模式</div>
                  <div className="text-xs mt-1 opacity-80">使用本地模拟数据</div>
                </button>
                
                <button
                  onClick={() => hasApiKey && toggleMockData(false)}
                  disabled={!hasApiKey}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                    !useMockData && hasApiKey
                      ? 'bg-soul-gold/20 border-2 border-soul-gold text-soul-gold' 
                      : 'glass-effect text-text-secondary hover:bg-white/10'
                  } ${!hasApiKey ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-medium">在线模式</div>
                  <div className="text-xs mt-1 opacity-80">
                    {hasApiKey ? '连接真实大模型' : '需要配置API密钥'}
                  </div>
                </button>
              </div>
            </div>
            
            {/* 提供商选择 */}
            {!useMockData && hasApiKey && (
              <div className="space-y-3">
                <label className="text-text-primary font-medium">选择模型</label>
                <div className="grid grid-cols-2 gap-2">
                  {providers.map(provider => {
                    const hasKey = !!import.meta.env[`VITE_${provider.value.toUpperCase()}_API_KEY`];
                    return (
                      <button
                        key={provider.value}
                        onClick={() => hasKey && switchProvider(provider.value)}
                        disabled={!hasKey}
                        className={`p-3 rounded-lg text-left transition-all ${
                          currentProvider === provider.value && hasKey
                            ? 'bg-soul-gold/20 border-2 border-soul-gold' 
                            : 'glass-effect hover:bg-white/10'
                        } ${!hasKey ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="font-medium text-text-primary">
                          {provider.label}
                          {!hasKey && <span className="text-xs ml-1 text-text-secondary">(未配置)</span>}
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          {provider.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* 配置说明 */}
            {!hasApiKey && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-amber-100">
                    <p className="mb-2">要使用真实大模型，请按以下步骤配置：</p>
                    <ol className="list-decimal list-inside space-y-1 text-amber-200">
                      <li>复制 <code className="px-1 bg-black/20 rounded">.env.local.example</code> 为 <code className="px-1 bg-black/20 rounded">.env.local</code></li>
                      <li>填入你的API密钥</li>
                      <li>重启开发服务器</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
            
            {/* 关闭按钮 */}
            <div className="flex justify-end">
              <GlassButton onClick={() => setIsOpen(false)}>
                确定
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};