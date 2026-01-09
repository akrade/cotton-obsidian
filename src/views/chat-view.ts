/**
 * Cotton Chat Sidebar View
 */

import { ItemView, WorkspaceLeaf, MarkdownRenderer } from 'obsidian';
import type CottonPlugin from '../main';
import type { ChatMessage } from '../types';

export const CHAT_VIEW_TYPE = 'cotton-chat-view';

export class CottonChatView extends ItemView {
  private plugin: CottonPlugin;
  private messages: ChatMessage[] = [];
  private inputEl: HTMLTextAreaElement | null = null;
  private messagesEl: HTMLElement | null = null;
  private isLoading = false;

  constructor(leaf: WorkspaceLeaf, plugin: CottonPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return CHAT_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'Cotton AI';
  }

  getIcon(): string {
    return 'circle';
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass('cotton-chat-container');

    // Header
    const header = container.createDiv({ cls: 'cotton-chat-header' });
    header.createEl('h4', { text: 'Cotton AI' });

    const modelBadge = header.createEl('span', {
      text: this.getModelName(),
      cls: 'cotton-model-badge'
    });

    const clearBtn = header.createEl('button', {
      text: 'Clear',
      cls: 'cotton-clear-btn'
    });
    clearBtn.addEventListener('click', () => this.clearChat());

    // Messages area
    this.messagesEl = container.createDiv({ cls: 'cotton-chat-messages' });

    // Input area
    const inputContainer = container.createDiv({ cls: 'cotton-chat-input-container' });

    this.inputEl = inputContainer.createEl('textarea', {
      cls: 'cotton-chat-input',
      attr: {
        placeholder: 'Ask Claude...',
        rows: '3'
      }
    });

    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Button container (secondary left, primary right)
    const buttonContainer = inputContainer.createDiv({ cls: 'cotton-chat-buttons' });

    const contextBtn = buttonContainer.createEl('button', {
      text: 'Add Context',
      cls: 'cotton-context-btn'
    });
    contextBtn.addEventListener('click', () => this.addCurrentNoteContext());

    const sendBtn = buttonContainer.createEl('button', {
      text: 'Send',
      cls: 'mod-cta cotton-send-btn'
    });
    sendBtn.addEventListener('click', () => this.sendMessage());

    // Load saved messages
    await this.loadMessages();
  }

  async onClose(): Promise<void> {
    // Save messages when view closes
    await this.saveMessages();
  }

  private getModelName(): string {
    const model = this.plugin.settings.model;
    if (model.includes('sonnet')) return 'Sonnet 4';
    if (model.includes('opus')) return 'Opus 4';
    if (model.includes('haiku')) return 'Haiku 3.5';
    return 'Claude';
  }

  private async sendMessage(): Promise<void> {
    if (!this.inputEl || this.isLoading) return;

    const content = this.inputEl.value.trim();
    if (!content) return;

    if (!this.plugin.claude.isConfigured()) {
      this.addSystemMessage('API key not configured. Check settings.');
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    this.messages.push(userMessage);
    this.renderMessage(userMessage);

    // Clear input
    this.inputEl.value = '';
    this.isLoading = true;

    // Add thinking indicator
    const thinkingEl = this.addThinkingIndicator();

    try {
      // Build context
      const activeFile = this.app.workspace.getActiveFile();
      const context = activeFile
        ? await this.plugin.contextBuilder.buildContext(activeFile)
        : null;

      const prefsPrompt = this.plugin.preferences.formatForSystemPrompt();
      const contextPrompt = context
        ? this.plugin.contextBuilder.formatContextForPrompt(context)
        : '';

      const systemPrompt = `You are a helpful AI assistant integrated with Obsidian. You help users with their notes and coding tasks.

${prefsPrompt}

${contextPrompt}

Respond concisely and helpfully. Use markdown formatting.`;

      // Stream response
      let responseContent = '';
      const responseEl = this.messagesEl?.createDiv({ cls: 'cotton-message cotton-message-assistant' });

      if (thinkingEl) thinkingEl.remove();

      await this.plugin.claude.sendMessage(
        this.messages.filter(m => m.role !== 'system'),
        systemPrompt,
        (chunk) => {
          responseContent += chunk;
          if (responseEl) {
            responseEl.textContent = responseContent;
          }
        }
      );

      // Render final markdown
      if (responseEl && responseContent) {
        responseEl.empty();
        await MarkdownRenderer.render(
          this.app,
          responseContent,
          responseEl,
          '',
          this.plugin
        );
      }

      // Save assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseContent,
        timestamp: Date.now(),
      };
      this.messages.push(assistantMessage);

      // Auto-save to note
      await this.saveToNote();

    } catch (error) {
      if (thinkingEl) thinkingEl.remove();
      this.addSystemMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.isLoading = false;
    }
  }

  private renderMessage(message: ChatMessage): void {
    if (!this.messagesEl) return;

    const msgEl = this.messagesEl.createDiv({
      cls: `cotton-message cotton-message-${message.role}`
    });

    if (message.role === 'user') {
      msgEl.textContent = message.content;
    } else {
      MarkdownRenderer.render(
        this.app,
        message.content,
        msgEl,
        '',
        this.plugin
      );
    }

    // Scroll to bottom
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  private addThinkingIndicator(): HTMLElement | null {
    if (!this.messagesEl) return null;
    const el = this.messagesEl.createDiv({ cls: 'cotton-thinking' });
    el.textContent = 'Thinking...';
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    return el;
  }

  private addSystemMessage(text: string): void {
    if (!this.messagesEl) return;
    const el = this.messagesEl.createDiv({ cls: 'cotton-message cotton-message-system' });
    el.textContent = text;
  }

  private async addCurrentNoteContext(): Promise<void> {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      this.addSystemMessage('No active note to add as context.');
      return;
    }

    if (this.inputEl) {
      const currentText = this.inputEl.value;
      this.inputEl.value = currentText + (currentText ? '\n\n' : '') +
        `[Context: ${activeFile.basename}]`;
      this.inputEl.focus();
    }
  }

  private clearChat(): void {
    this.messages = [];
    if (this.messagesEl) {
      this.messagesEl.empty();
    }
  }

  private async loadMessages(): Promise<void> {
    // Load from plugin data
    const data = await this.plugin.loadData();
    if (data?.chatHistory) {
      this.messages = data.chatHistory;
      this.messages.forEach(msg => this.renderMessage(msg));
    }
  }

  private async saveMessages(): Promise<void> {
    const data = (await this.plugin.loadData()) || {};
    data.chatHistory = this.messages;
    await this.plugin.saveData(data);
  }

  private async saveToNote(): Promise<void> {
    if (this.messages.length === 0) return;

    const folder = this.plugin.settings.chatFolder || 'Cotton/Chats';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const firstUserMsg = this.messages.find(m => m.role === 'user');
    const topic = firstUserMsg
      ? firstUserMsg.content.slice(0, 30).replace(/[^a-zA-Z0-9 ]/g, '').trim()
      : 'chat';

    const filename = `${folder}/${timestamp}-${topic}.md`;

    // Build markdown content
    let content = `# Cotton AI Chat\n\n`;
    content += `Date: ${new Date().toLocaleString()}\n`;
    content += `Model: ${this.getModelName()}\n\n---\n\n`;

    for (const msg of this.messages) {
      if (msg.role === 'user') {
        content += `## Question\n\n${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        content += `## Answer\n\n${msg.content}\n\n---\n\n`;
      }
    }

    try {
      // Ensure folder exists
      const folderPath = folder;
      if (!this.app.vault.getAbstractFileByPath(folderPath)) {
        await this.app.vault.createFolder(folderPath);
      }

      // Create or update file
      const existingFile = this.app.vault.getAbstractFileByPath(filename);
      if (existingFile) {
        await this.app.vault.modify(existingFile as any, content);
      } else {
        await this.app.vault.create(filename, content);
      }
    } catch (error) {
      console.error('Failed to save chat to note:', error);
    }
  }
}
