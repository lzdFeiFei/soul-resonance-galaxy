import { LLMProvider } from './base';
import type { LLMMessage, LLMResponse } from '@/types/llm';

export class OpenAIProvider extends LLMProvider {
  async sendRequest(messages: LLMMessage[]): Promise<LLMResponse> {
    const url = `${this.config.baseUrl || 'https://api.openai.com/v1'}/chat/completions`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        model: this.config.model || 'gpt-4-turbo-preview',
        messages: messages,
        max_tokens: this.config.maxTokens || 1000,
        temperature: this.config.temperature || 0.7,
        top_p: this.config.topP || 0.9,
        stream: false
      })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(error.error?.message || `OpenAI API错误: ${response.status}`);
    }
    
    const data = await response.json();
    
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