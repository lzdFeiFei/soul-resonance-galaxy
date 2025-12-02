import { LLMProvider } from './base';
import type { LLMMessage, LLMResponse } from '@/types/llm';

export class ModelScopeProvider extends LLMProvider {
  async sendRequest(messages: LLMMessage[]): Promise<LLMResponse> {
    // 使用魔搭社区的API端点
    const url = `https://api-inference.modelscope.cn/v1/chat/completions`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'Qwen/Qwen2.5-Coder-32B-Instruct',
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        max_tokens: this.config.maxTokens || 1000,
        temperature: this.config.temperature || 0.7,
        top_p: this.config.topP || 0.9,
        stream: false
      })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `魔搭API错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || '魔搭API调用失败');
    }
    
    // 兼容OpenAI格式的响应
    return {
      content: data.choices[0].message.content,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined,
      model: data.model || this.config.model,
      finishReason: data.choices[0].finish_reason
    };
  }
}