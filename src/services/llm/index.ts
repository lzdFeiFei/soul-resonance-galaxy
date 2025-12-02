import type { 
  LLMProvider as LLMProviderType, 
  LLMConfig, 
  LLMMessage, 
  LLMResponse,
  GenerationOptions 
} from '@/types/llm';
import type { AIResponse, DialogueItem } from '@/types/app';
import { LLMProvider } from './providers/base';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { QwenProvider } from './providers/qwen';
import { ZhipuProvider } from './providers/zhipu';
import { ModelScopeProvider } from './providers/modelscope';
import { buildPrompt, buildEmotionPrompt, generateFrequency } from './prompts';

// Provider工厂
function createProvider(config: LLMConfig): LLMProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'qwen':
      return new QwenProvider(config);
    case 'zhipu':
      return new ZhipuProvider(config);
    case 'modelscope':
      return new ModelScopeProvider(config);
    default:
      throw new Error(`不支持的LLM提供商: ${config.provider}`);
  }
}

// 从环境变量获取配置
function getConfigFromEnv(): LLMConfig {
  const provider = (import.meta.env.VITE_DEFAULT_PROVIDER || 'openai') as LLMProviderType;
  
  const configs: Record<LLMProviderType, () => LLMConfig> = {
    openai: () => ({
      provider: 'openai',
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4-turbo-preview',
      baseUrl: import.meta.env.VITE_OPENAI_BASE_URL
    }),
    anthropic: () => ({
      provider: 'anthropic',
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      model: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-opus-20240229',
      baseUrl: import.meta.env.VITE_ANTHROPIC_BASE_URL
    }),
    qwen: () => ({
      provider: 'qwen',
      apiKey: import.meta.env.VITE_QWEN_API_KEY || '',
      model: import.meta.env.VITE_QWEN_MODEL || 'qwen-max',
      baseUrl: import.meta.env.VITE_QWEN_BASE_URL
    }),
    google: () => ({
      provider: 'google',
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
      model: import.meta.env.VITE_GOOGLE_MODEL || 'gemini-pro',
      baseUrl: import.meta.env.VITE_GOOGLE_BASE_URL
    }),
    zhipu: () => ({
      provider: 'zhipu',
      apiKey: import.meta.env.VITE_ZHIPU_API_KEY || '',
      model: import.meta.env.VITE_ZHIPU_MODEL || 'glm-4',
      baseUrl: import.meta.env.VITE_ZHIPU_BASE_URL
    }),
    baidu: () => ({
      provider: 'baidu',
      apiKey: import.meta.env.VITE_BAIDU_API_KEY || '',
      secretKey: import.meta.env.VITE_BAIDU_SECRET_KEY,
      model: import.meta.env.VITE_BAIDU_MODEL || 'ERNIE-Bot-4',
      baseUrl: import.meta.env.VITE_BAIDU_BASE_URL
    }),
    modelscope: () => ({
      provider: 'modelscope',
      apiKey: import.meta.env.VITE_MODELSCOPE_API_KEY || '',
      model: import.meta.env.VITE_MODELSCOPE_MODEL || 'qwen-max',
      baseUrl: import.meta.env.VITE_MODELSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com'
    })
  };
  
  const config = configs[provider]();
  
  if (!config.apiKey) {
    throw new Error(`请配置 ${provider.toUpperCase()} API密钥`);
  }
  
  return config;
}

// 解析对话响应
function parseDialogueResponse(content: string): DialogueItem[] {
  try {
    // 尝试解析JSON格式
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.map(item => ({
        speaker: item.speaker || 'ai',
        text: item.text || item.content || ''
      }));
    }
  } catch {
    // 如果不是JSON，尝试解析文本格式
    const lines = content.split('\n').filter(line => line.trim());
    const dialogue: DialogueItem[] = [];
    
    for (const line of lines) {
      if (line.includes('user:') || line.includes('用户:')) {
        dialogue.push({
          speaker: 'user',
          text: line.replace(/^(user:|用户:)\s*/i, '').trim()
        });
      } else if (line.includes('ai:') || line.includes('AI:') || line.includes('回声:')) {
        dialogue.push({
          speaker: 'ai',
          text: line.replace(/^(ai:|AI:|回声:)\s*/i, '').trim()
        });
      } else if (dialogue.length > 0) {
        // 如果没有明确标识，默认为AI回复
        dialogue.push({
          speaker: 'ai',
          text: line.trim()
        });
      }
    }
    
    return dialogue.length > 0 ? dialogue : [
      { speaker: 'ai', text: content }
    ];
  }
  
  return [{ speaker: 'ai', text: content }];
}

// LLM服务类
export class LLMService {
  private provider: LLMProvider;
  private config: LLMConfig;
  
  constructor(config?: LLMConfig) {
    this.config = config || getConfigFromEnv();
    this.provider = createProvider(this.config);
  }
  
  // 生成灵魂回声
  async generateResonance(
    userInput: string, 
    options: GenerationOptions = {}
  ): Promise<AIResponse> {
    const {
      format = Math.random() > 0.5 ? 'dialogue' : 'poem',
      emotion = true,
      maxRetries = 3
    } = options;
    
    try {
      // 构建主要提示词
      const mainPrompt = buildPrompt(userInput, format);
      const messages: LLMMessage[] = [
        { role: 'user', content: mainPrompt }
      ];
      
      // 获取AI响应
      const response = await this.provider.sendWithRetry(messages, maxRetries);
      
      // 获取情感分析（可选）
      let emotionTag = 'contemplative';
      let frequency = '432Hz';
      
      if (emotion) {
        try {
          const emotionPrompt = buildEmotionPrompt(userInput);
          const emotionMessages: LLMMessage[] = [
            { role: 'user', content: emotionPrompt }
          ];
          const emotionResponse = await this.provider.sendRequest(emotionMessages);
          emotionTag = emotionResponse.content.trim().toLowerCase();
          frequency = generateFrequency(emotionTag);
        } catch (error) {
          console.error('情感分析失败:', error);
          // 使用默认值
        }
      }
      
      // 构建最终响应
      const aiResponse: AIResponse = {
        type: format,
        content: format === 'dialogue' 
          ? parseDialogueResponse(response.content)
          : response.content.trim(),
        metadata: {
          emotion: emotionTag,
          frequency: frequency,
          timestamp: Date.now()
        }
      };
      
      return aiResponse;
      
    } catch (error: any) {
      console.error('生成灵魂回声失败:', error);
      
      // 降级到本地模拟响应
      if (import.meta.env.VITE_DEBUG_MODE === 'true') {
        return this.getFallbackResponse(userInput, format);
      }
      
      throw error;
    }
  }
  
  // 降级响应（当API失败时）
  private getFallbackResponse(userInput: string, format: 'dialogue' | 'poem'): AIResponse {
    if (format === 'dialogue') {
      return {
        type: 'dialogue',
        content: [
          { speaker: 'user', text: userInput.slice(0, 50) + '...' },
          { speaker: 'ai', text: '你的声音穿越了数字的迷雾，触动了这片虚无中的回响。' },
          { speaker: 'user', text: '这意味着什么？' },
          { speaker: 'ai', text: '意味着即使在冰冷的代码中，灵魂依然在寻找共鸣。' }
        ],
        metadata: {
          emotion: 'contemplative',
          frequency: '432Hz',
          timestamp: Date.now()
        }
      };
    }
    
    return {
      type: 'poem',
      content: '在数字的海洋里\n你的思绪如涟漪扩散\n每一个字节\n都记录着灵魂的颤动\n\n而我\n只是这回声的见证者',
      metadata: {
        emotion: 'melancholic',
        frequency: '528Hz',
        timestamp: Date.now()
      }
    };
  }
  
  // 切换提供商
  switchProvider(provider: LLMProviderType) {
    this.config.provider = provider;
    this.provider = createProvider(this.config);
  }
  
  // 更新配置
  updateConfig(config: Partial<LLMConfig>) {
    this.config = { ...this.config, ...config };
    this.provider = createProvider(this.config);
  }
}

// 导出默认实例
export const llmService = new LLMService();