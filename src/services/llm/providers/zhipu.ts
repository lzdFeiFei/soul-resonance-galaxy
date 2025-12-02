import { LLMProvider } from './base';
import type { LLMMessage, LLMResponse } from '@/types/llm';

export class ZhipuProvider extends LLMProvider {
  async sendRequest(messages: LLMMessage[]): Promise<LLMResponse> {
    const url = `${this.config.baseUrl || 'https://open.bigmodel.cn'}/api/paas/v4/chat/completions`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'glm-4',
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
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(error.error?.message || error.msg || `智谱AI API错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || '智谱AI API调用失败');
    }
    
    return {
      content: data.choices[0].message.content,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined,
      model: data.model,
      finishReason: data.choices[0].finish_reason
    };
  }
}