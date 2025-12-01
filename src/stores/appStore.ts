import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { AppStage, AIResponse } from '@/types/app';
import { MOCK_AI_RESPONSES } from '@/utils/constants';

interface AppState {
  // 应用状态
  stage: AppStage;
  currentInput: string;
  currentAIResponse: AIResponse | null;
  isGenerating: boolean;
  
  // UI 状态
  isEchoPanelOpen: boolean;
  selectedParticleId: string | null;
  
  // Actions
  setStage: (stage: AppStage) => void;
  setInput: (input: string) => void;
  generateResonance: () => Promise<void>;
  saveToGalaxy: () => void;
  resetInput: () => void;
  
  // UI Actions
  openEchoPanel: (particleId: string) => void;
  closeEchoPanel: () => void;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    stage: 'input',
    currentInput: '',
    currentAIResponse: null,
    isGenerating: false,
    isEchoPanelOpen: false,
    selectedParticleId: null,

    // Actions
    setStage: (stage) => set({ stage }),
    
    setInput: (input) => set({ currentInput: input }),

    generateResonance: async () => {
      const { currentInput } = get();
      if (!currentInput.trim()) return;

      set({ isGenerating: true, stage: 'loading' });

      // 模拟 AI 生成延迟
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 随机选择对话或诗歌
      const isPoem = Math.random() > 0.5;
      const responses = isPoem ? MOCK_AI_RESPONSES.poems : MOCK_AI_RESPONSES.dialogues;
      const response = responses[Math.floor(Math.random() * responses.length)];

      set({
        currentAIResponse: {
          ...response,
          metadata: {
            ...response.metadata,
            timestamp: Date.now(),
          },
        },
        stage: 'result',
        isGenerating: false,
      });
    },

    saveToGalaxy: () => {
      const { currentAIResponse, currentInput } = get();
      if (!currentAIResponse || !currentInput) return;

      // 动态导入 galaxyStore 避免循环引用
      import('../stores/galaxyStore').then(({ useGalaxyStore }) => {
        const galaxyStore = useGalaxyStore.getState();
        galaxyStore.addUserParticle({
          id: `particle_${Date.now()}`,
          text: currentInput,
          aiResponse: currentAIResponse,
          position: { x: 0, y: 0 }, // 将在 galaxy store 中计算实际位置
          timestamp: Date.now(),
          color: { r: 210, g: 190, b: 160 }, // soul-gold
        });
      });

      // 切换到星系视图
      set({ stage: 'galaxy_view' });
    },

    resetInput: () => set({ 
      currentInput: '', 
      currentAIResponse: null, 
      stage: 'input' 
    }),

    // UI Actions
    openEchoPanel: (particleId) => set({ 
      isEchoPanelOpen: true, 
      selectedParticleId: particleId 
    }),
    
    closeEchoPanel: () => set({ 
      isEchoPanelOpen: false, 
      selectedParticleId: null 
    }),
  }))
);

// galaxyStore 通过动态导入避免循环引用