// 大模型提供商类型
export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'qwen' | 'zhipu' | 'baidu' | 'modelscope';

// LLM配置接口
export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
  secretKey?: string; // 百度需要
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
}

// LLM请求消息
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// LLM响应接口
export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  finishReason?: string;
}

// 错误类型
export interface LLMError {
  code: string;
  message: string;
  provider?: LLMProvider;
  retryable?: boolean;
}

// 系统提示词配置
export interface SystemPromptConfig {
  base: string;
  dialogue: string;
  poem: string;
  emotionalAnalysis: string;
}

// 响应格式类型
export type ResponseFormat = 'dialogue' | 'poem' | 'mixed';

// 生成选项
export interface GenerationOptions {
  format?: ResponseFormat;
  emotion?: boolean;
  frequency?: boolean;
  maxRetries?: number;
  timeout?: number;
}