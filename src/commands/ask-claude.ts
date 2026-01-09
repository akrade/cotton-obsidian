/**
 * Ask Claude Command
 */

import { App, Editor, MarkdownView, Modal, Notice, TextAreaComponent } from 'obsidian';
import type CottonPlugin from '../main';
import type { ChatMessage, NoteContext } from '../types';

export class AskClaudeModal extends Modal {
  private plugin: CottonPlugin;
  private editor: Editor | null;
  private context: NoteContext | null;
  private inputEl: TextAreaComponent | null = null;
  private responseEl: HTMLElement | null = null;

  constructor(app: App, plugin: CottonPlugin, editor: Editor | null, context: NoteContext | null) {
    super(app);
    this.plugin = plugin;
    this.editor = editor;
    this.context = context;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('cotton-ask-claude-modal');

    // Header
    contentEl.createEl('h2', { text: 'Ask Claude' });

    if (this.context) {
      contentEl.createEl('p', {
        text: `Context: ${this.context.name}`,
        cls: 'cotton-context-label',
      });
    }

    // Input area
    const inputContainer = contentEl.createDiv({ cls: 'cotton-input-container' });
    this.inputEl = new TextAreaComponent(inputContainer);
    this.inputEl.inputEl.addClass('cotton-input');
    this.inputEl.setPlaceholder('Ask a question about this note...');
    this.inputEl.inputEl.rows = 3;

    // Selection preview
    if (this.context?.selection) {
      const selectionPreview = contentEl.createDiv({ cls: 'cotton-selection-preview' });
      selectionPreview.createEl('strong', { text: 'Selected: ' });
      selectionPreview.createEl('code', {
        text:
          this.context.selection.length > 100
            ? this.context.selection.slice(0, 100) + '...'
            : this.context.selection,
      });
    }

    // Buttons (secondary left, primary right)
    const buttonContainer = contentEl.createDiv({ cls: 'cotton-button-container' });

    const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });
    cancelButton.addEventListener('click', () => this.close());

    const askButton = buttonContainer.createEl('button', {
      text: 'Ask',
      cls: 'mod-cta',
    });
    askButton.addEventListener('click', () => this.handleAsk());

    // Response area
    this.responseEl = contentEl.createDiv({ cls: 'cotton-response' });
    this.responseEl.style.display = 'none';

    // Focus input
    this.inputEl.inputEl.focus();

    // Handle enter key
    this.inputEl.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        this.handleAsk();
      }
    });
  }

  private async handleAsk(): Promise<void> {
    const query = this.inputEl?.getValue();
    if (!query?.trim()) {
      new Notice('Please enter a question');
      return;
    }

    if (!this.plugin.claude.isConfigured()) {
      new Notice('Claude API key not configured. Check settings.');
      return;
    }

    // Show response area
    if (this.responseEl) {
      this.responseEl.style.display = 'block';
      this.responseEl.empty();
      this.responseEl.createEl('p', { text: 'Thinking...', cls: 'cotton-thinking' });
    }

    try {
      // Build system prompt
      const prefsPrompt = this.plugin.preferences.formatForSystemPrompt();
      const contextPrompt = this.context
        ? this.plugin.contextBuilder.formatContextForPrompt(this.context)
        : '';

      const systemPrompt = `You are a helpful AI assistant integrated with Obsidian. You help users with their notes and coding tasks.

${prefsPrompt}

${contextPrompt}

Respond concisely and helpfully. Use markdown formatting.`;

      // Build messages
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: query,
          timestamp: Date.now(),
        },
      ];

      // Get response
      let response = '';
      if (this.responseEl) {
        this.responseEl.empty();
      }

      response = await this.plugin.claude.sendMessage(messages, systemPrompt, (chunk) => {
        if (this.responseEl) {
          this.responseEl.textContent = (this.responseEl.textContent || '') + chunk;
        }
      });

      // Final render with markdown
      if (this.responseEl && response) {
        this.responseEl.empty();
        // Use Obsidian's markdown renderer
        const responseDiv = this.responseEl.createDiv({ cls: 'cotton-response-content' });
        responseDiv.innerHTML = response;
      }
    } catch (error) {
      new Notice(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (this.responseEl) {
        this.responseEl.empty();
        this.responseEl.createEl('p', {
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          cls: 'cotton-error',
        });
      }
    }
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}

export function registerAskClaudeCommand(plugin: CottonPlugin): void {
  plugin.addCommand({
    id: 'ask-claude',
    name: 'Ask Claude',
    editorCallback: async (editor: Editor, view: MarkdownView) => {
      const selection = editor.getSelection();
      const file = view.file;
      const context = file
        ? await plugin.contextBuilder.buildContext(file, selection || undefined)
        : null;

      new AskClaudeModal(plugin.app, plugin, editor, context).open();
    },
  });

  // Also add a command that works without editor
  plugin.addCommand({
    id: 'ask-claude-general',
    name: 'Ask Claude (General)',
    callback: async () => {
      const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
      const file = view?.file || null;
      const context = file ? await plugin.contextBuilder.buildContext(file) : null;

      new AskClaudeModal(plugin.app, plugin, null, context).open();
    },
  });
}
