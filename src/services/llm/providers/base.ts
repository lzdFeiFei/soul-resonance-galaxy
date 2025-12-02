import type { LLMConfig, LLMMessage, LLMResponse, LLMError } from '@/types/llm';

// LLM提供商基类
export abstract class LLMProvider {
  protected config: LLMConfig;
  
  constructor(config: LLMConfig) {
    this.config = config;
  }
  
  // 发送请求的抽象方法
  abstract sendRequest(messages: LLMMessage[]): Promise<LLMResponse>;
  
  // 通用的错误处理
  protected handleError(error: any): LLMError {
    const isNetworkError = error.message?.includes('fetch') || 
                          error.message?.includes('network') ||
                          error.code === 'ECONNREFUSED';
    
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || '发生未知错误',
      provider: this.config.provider,
      retryable: isNetworkError || error.status === 429 || error.status >= 500
    };
  }
  
  // 通用的重试逻辑
  async sendWithRetry(
    messages: LLMMessage[], 
    maxRetries: number = 3
  ): Promise<LLMResponse> {
    let lastError: LLMError | null = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.sendRequest(messages);
      } catch (error: any) {
        lastError = this.handleError(error);
        
        if (!lastError.retryable || i === maxRetries - 1) {
          throw lastError;
        }
        
        // 指数退避
        await this.delay(Math.pow(2, i) * 1000);
      }
    }
    
    throw lastError;
  }
  
  // 延迟函数
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // 构建请求头
  protected buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`
    };
  }
}