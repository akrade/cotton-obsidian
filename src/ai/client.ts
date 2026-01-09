/**
 * Claude API Client
 */

import Anthropic from '@anthropic-ai/sdk';
import type { CottonSettings, ChatMessage } from '../types';

export class ClaudeClient {
  private client: Anthropic | null = null;
  private settings: CottonSettings;

  constructor(settings: CottonSettings) {
    this.settings = settings;
    this.initClient();
  }

  private initClient(): void {
    if (this.settings.apiKey) {
      this.client = new Anthropic({
        apiKey: this.settings.apiKey,
      });
    }
  }

  updateSettings(settings: CottonSettings): void {
    this.settings = settings;
    this.initClient();
  }

  isConfigured(): boolean {
    return !!this.client && !!this.settings.apiKey;
  }

  async sendMessage(
    messages: ChatMessage[],
    systemPrompt: string,
    onStream?: (chunk: string) => void
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Claude API key not configured');
    }

    const formattedMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    if (this.settings.streamResponses && onStream) {
      return this.streamMessage(formattedMessages, systemPrompt, onStream);
    }

    const response = await this.client.messages.create({
      model: this.settings.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: formattedMessages,
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    return textBlock?.type === 'text' ? textBlock.text : '';
  }

  private async streamMessage(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt: string,
    onStream: (chunk: string) => void
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Claude API key not configured');
    }

    let fullResponse = '';

    const stream = this.client.messages.stream({
      model: this.settings.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        const chunk = event.delta.text;
        fullResponse += chunk;
        onStream(chunk);
      }
    }

    return fullResponse;
  }
}
