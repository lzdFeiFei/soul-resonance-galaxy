import { LLMProvider } from './base';
import type { LLMMessage, LLMResponse } from '@/types/llm';

export class QwenProvider extends LLMProvider {
  async sendRequest(messages: LLMMessage[]): Promise<LLMResponse> {
    const url = `${this.config.baseUrl || 'https://dashscope.aliyuncs.com'}/api/v1/services/aigc/text-generation/generation`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'qwen-max',
        input: {
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        },
        parameters: {
          max_tokens: this.config.maxTokens || 1000,
          temperature: this.config.temperature || 0.7,
          top_p: this.config.topP || 0.9,
          result_format: 'message'
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `通义千问API错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code && data.code !== 'Success') {
      throw new Error(data.message || '通义千问API调用失败');
    }
    
    return {
      content: data.output.choices[0].message.content,
      usage: data.usage ? {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined,
      model: data.output.choices[0].model,
      finishReason: data.output.choices[0].finish_reason
    };
  }
}