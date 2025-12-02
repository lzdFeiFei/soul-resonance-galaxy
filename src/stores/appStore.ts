import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { AppStage, AIResponse } from "@/types/app";
import { MOCK_AI_RESPONSES } from "@/utils/constants";
import { llmService } from "@/services/llm";
import type { LLMProvider } from "@/types/llm";

interface AppState {
  // 应用状态
  stage: AppStage;
  currentInput: string;
  currentAIResponse: AIResponse | null;
  isGenerating: boolean;

  // LLM相关状态
  useMockData: boolean;
  currentProvider: LLMProvider | null;
  apiError: string | null;

  // UI 状态
  isEchoPanelOpen: boolean;
  selectedParticleId: string | null;

  // Actions
  setStage: (stage: AppStage) => void;
  setInput: (input: string) => void;
  generateResonance: () => Promise<void>;
  saveToGalaxy: () => void;
  resetInput: () => void;

  // LLM Actions
  toggleMockData: (useMock: boolean) => void;
  switchProvider: (provider: LLMProvider) => void;
  clearError: () => void;

  // UI Actions
  openEchoPanel: (particleId: string) => void;
  closeEchoPanel: () => void;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    stage: "input",
    currentInput: "",
    currentAIResponse: null,
    isGenerating: false,

    // LLM状态
    useMockData:
      !import.meta.env.VITE_OPENAI_API_KEY &&
      !import.meta.env.VITE_ANTHROPIC_API_KEY &&
      !import.meta.env.VITE_QWEN_API_KEY &&
      !import.meta.env.VITE_ZHIPU_API_KEY &&
      !import.meta.env.VITE_MODELSCOPE_API_KEY,
    currentProvider:
      (import.meta.env.VITE_DEFAULT_PROVIDER as LLMProvider) || null,
    apiError: null,

    // UI状态
    isEchoPanelOpen: false,
    selectedParticleId: null,

    // Actions
    setStage: (stage) => set({ stage }),

    setInput: (input) => set({ currentInput: input }),

    generateResonance: async () => {
      const { currentInput, useMockData } = get();
      if (!currentInput.trim()) return;

      set({ isGenerating: true, stage: "loading", apiError: null });

      try {
        let response: AIResponse;

        if (useMockData) {
          // 使用模拟数据
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const isPoem = Math.random() > 0.5;
          const responses = isPoem
            ? MOCK_AI_RESPONSES.poems
            : MOCK_AI_RESPONSES.dialogues;
          response = responses[Math.floor(Math.random() * responses.length)];
          response = {
            ...response,
            metadata: {
              ...response.metadata,
              timestamp: Date.now(),
            },
          };
        } else {
          // 使用真实API
          try {
            response = await llmService.generateResonance(currentInput, {
              emotion: true,
              maxRetries: 3,
            });
          } catch (error: any) {
            console.error("API调用失败:", error);

            // 如果API失败，降级到mock数据
            if (import.meta.env.VITE_DEBUG_MODE === "true") {
              const isPoem = Math.random() > 0.5;
              const responses = isPoem
                ? MOCK_AI_RESPONSES.poems
                : MOCK_AI_RESPONSES.dialogues;
              response =
                responses[Math.floor(Math.random() * responses.length)];
              response = {
                ...response,
                metadata: {
                  ...response.metadata,
                  timestamp: Date.now(),
                },
              };
              set({ apiError: "连接失败，已切换到离线模式" });
            } else {
              throw error;
            }
          }
        }

        set({
          currentAIResponse: response,
          stage: "result",
          isGenerating: false,
        });
      } catch (error: any) {
        set({
          isGenerating: false,
          stage: "input",
          apiError: error.message || "生成失败，请重试",
        });
      }
    },

    saveToGalaxy: () => {
      const { currentAIResponse, currentInput } = get();
      if (!currentAIResponse || !currentInput) return;

      // 动态导入 galaxyStore 避免循环引用
      import("../stores/galaxyStore").then(({ useGalaxyStore }) => {
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
      set({ stage: "galaxy_view" });
    },

    resetInput: () =>
      set({
        currentInput: "",
        currentAIResponse: null,
        stage: "input",
        apiError: null,
      }),

    // LLM Actions
    toggleMockData: (useMock) => set({ useMockData: useMock }),

    switchProvider: (provider) => {
      const { useMockData } = get();
      if (!useMockData) {
        llmService.switchProvider(provider);
      }
      set({ currentProvider: provider, apiError: null });
    },

    clearError: () => set({ apiError: null }),

    // UI Actions
    openEchoPanel: (particleId) =>
      set({
        isEchoPanelOpen: true,
        selectedParticleId: particleId,
      }),

    closeEchoPanel: () =>
      set({
        isEchoPanelOpen: false,
        selectedParticleId: null,
      }),
  }))
);

// galaxyStore 通过动态导入避免循环引用
