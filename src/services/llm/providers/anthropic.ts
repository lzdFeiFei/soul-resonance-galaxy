import { LLMProvider } from './base';
import type { LLMMessage, LLMResponse } from '@/types/llm';

export class AnthropicProvider extends LLMProvider {
  async sendRequest(messages: LLMMessage[]): Promise<LLMResponse> {
    const url = `${this.config.baseUrl || 'https://api.anthropic.com'}/v1/messages`;
    
    // 转换消息格式（Anthropic不支持system role在messages中）
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-opus-20240229',
        messages: userMessages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        })),
        system: systemMessage?.content,
        max_tokens: this.config.maxTokens || 1000,
        temperature: this.config.temperature || 0.7,
        top_p: this.config.topP || 0.9
      })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(error.error?.message || `Anthropic API错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      content: data.content[0].text,
      usage: data.usage ? {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      } : undefined,
      model: data.model,
      finishReason: data.stop_reason
    };
  }
}