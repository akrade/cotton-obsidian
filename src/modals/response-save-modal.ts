/**
 * Response Save Modal
 * Modal for selecting where to save an AI response
 */

import { App, Modal, Notice, TFolder, TFile, setIcon } from 'obsidian';
import type CottonPlugin from '../main';
import type { ChatMessage } from '../types';

interface SaveOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  action: () => Promise<void>;
}

export class ResponseSaveModal extends Modal {
  private plugin: CottonPlugin;
  private message: ChatMessage;

  constructor(app: App, plugin: CottonPlugin, message: ChatMessage) {
    super(app);
    this.plugin = plugin;
    this.message = message;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('cotton-save-modal');

    contentEl.createEl('h3', { text: 'Save Response' });

    const optionsContainer = contentEl.createDiv({ cls: 'cotton-save-options' });

    const options: SaveOption[] = [
      {
        id: 'quick-save',
        label: 'Quick Save',
        description: `Save to ${this.plugin.settings.chatFolder}/Responses`,
        icon: 'zap',
        action: () => this.quickSave(),
      },
      {
        id: 'current-note',
        label: 'Append to Current Note',
        description: 'Add response to the active note',
        icon: 'file-plus',
        action: () => this.appendToCurrentNote(),
      },
      {
        id: 'new-note',
        label: 'Create New Note',
        description: 'Save as a new note with custom name',
        icon: 'file-text',
        action: () => this.createNewNote(),
      },
      {
        id: 'browse',
        label: 'Browse...',
        description: 'Choose a specific folder',
        icon: 'folder',
        action: () => this.browseForFolder(),
      },
    ];

    for (const option of options) {
      const optionEl = optionsContainer.createDiv({ cls: 'cotton-save-option' });
      optionEl.addEventListener('click', async () => {
        await option.action();
      });

      const iconEl = optionEl.createDiv({ cls: 'cotton-save-option-icon' });
      setIcon(iconEl, option.icon);

      const textEl = optionEl.createDiv({ cls: 'cotton-save-option-text' });
      textEl.createDiv({ cls: 'cotton-save-option-label', text: option.label });
      textEl.createDiv({ cls: 'cotton-save-option-desc', text: option.description });
    }
  }

  private formatResponseContent(): string {
    const now = new Date();
    const timestamp = now.toISOString();
    const dateStr = now.toLocaleString();

    return `---
source: cotton-ai
saved: ${timestamp}
model: ${this.getModelName()}
---

${this.message.content}

---
*Saved from Cotton AI on ${dateStr}*
`;
  }

  private getModelName(): string {
    const model = this.plugin.settings.model;
    if (model.includes('sonnet')) return 'Sonnet 4';
    if (model.includes('opus')) return 'Opus 4';
    if (model.includes('haiku')) return 'Haiku 3.5';
    return 'Claude';
  }

  private async ensureFolderExists(folderPath: string): Promise<void> {
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      await this.app.vault.createFolder(folderPath);
    }
  }

  private generateFilename(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const preview = this.message.content
      .slice(0, 30)
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'response';
    return `${timestamp}-${preview}`;
  }

  private async quickSave(): Promise<void> {
    try {
      const baseFolder = this.plugin.settings.chatFolder || 'Cotton/Chats';
      const folder = `${baseFolder}/Responses`;
      await this.ensureFolderExists(baseFolder);
      await this.ensureFolderExists(folder);

      const filename = `${folder}/${this.generateFilename()}.md`;
      const content = this.formatResponseContent();

      await this.app.vault.create(filename, content);
      new Notice(`Saved to ${filename}`);
      this.close();
    } catch (error) {
      new Notice(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async appendToCurrentNote(): Promise<void> {
    try {
      const activeFile = this.app.workspace.getActiveFile();
      if (!activeFile) {
        new Notice('No active note to append to');
        return;
      }

      const existingContent = await this.app.vault.read(activeFile);
      const appendContent = `\n\n---\n\n## AI Response\n\n${this.message.content}\n\n*Added from Cotton AI on ${new Date().toLocaleString()}*\n`;

      await this.app.vault.modify(activeFile, existingContent + appendContent);
      new Notice(`Appended to ${activeFile.basename}`);
      this.close();
    } catch (error) {
      new Notice(`Failed to append: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createNewNote(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('cotton-save-modal');

    contentEl.createEl('h3', { text: 'Create New Note' });

    const inputContainer = contentEl.createDiv({ cls: 'cotton-save-input-container' });

    inputContainer.createEl('label', { text: 'Note name:', cls: 'cotton-save-label' });
    const nameInput = inputContainer.createEl('input', {
      type: 'text',
      cls: 'cotton-save-input',
      value: this.generateFilename(),
    });

    inputContainer.createEl('label', { text: 'Folder:', cls: 'cotton-save-label' });
    const folderInput = inputContainer.createEl('input', {
      type: 'text',
      cls: 'cotton-save-input',
      value: this.plugin.settings.chatFolder || 'Cotton/Chats',
    });

    const buttonContainer = contentEl.createDiv({ cls: 'cotton-save-buttons' });

    const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
    cancelBtn.addEventListener('click', () => this.close());

    const saveBtn = buttonContainer.createEl('button', { text: 'Save', cls: 'mod-cta' });
    saveBtn.addEventListener('click', async () => {
      const name = nameInput.value.trim();
      const folder = folderInput.value.trim();

      if (!name) {
        new Notice('Please enter a note name');
        return;
      }

      try {
        await this.ensureFolderExists(folder);
        const filename = `${folder}/${name}.md`;
        const content = this.formatResponseContent();

        await this.app.vault.create(filename, content);
        new Notice(`Created ${filename}`);
        this.close();
      } catch (error) {
        new Notice(`Failed to create: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    nameInput.focus();
    nameInput.select();
  }

  private async browseForFolder(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('cotton-save-modal');

    contentEl.createEl('h3', { text: 'Select Folder' });

    const folderList = contentEl.createDiv({ cls: 'cotton-folder-list' });

    // Get all folders
    const folders = this.getAllFolders();

    // Root option
    const rootOption = folderList.createDiv({ cls: 'cotton-folder-option' });
    setIcon(rootOption.createSpan(), 'home');
    rootOption.createSpan({ text: ' / (root)' });
    rootOption.addEventListener('click', () => this.saveToFolder(''));

    for (const folder of folders) {
      const folderOption = folderList.createDiv({ cls: 'cotton-folder-option' });
      setIcon(folderOption.createSpan(), 'folder');
      folderOption.createSpan({ text: ` ${folder.path}` });
      folderOption.addEventListener('click', () => this.saveToFolder(folder.path));
    }

    const cancelBtn = contentEl.createEl('button', { text: 'Cancel', cls: 'cotton-cancel-btn' });
    cancelBtn.addEventListener('click', () => this.close());
  }

  private getAllFolders(): TFolder[] {
    const folders: TFolder[] = [];
    const rootFolder = this.app.vault.getRoot();

    const traverse = (folder: TFolder) => {
      for (const child of folder.children) {
        if (child instanceof TFolder) {
          folders.push(child);
          traverse(child);
        }
      }
    };

    traverse(rootFolder);
    return folders.sort((a, b) => a.path.localeCompare(b.path));
  }

  private async saveToFolder(folderPath: string): Promise<void> {
    try {
      const filename = folderPath
        ? `${folderPath}/${this.generateFilename()}.md`
        : `${this.generateFilename()}.md`;
      const content = this.formatResponseContent();

      await this.app.vault.create(filename, content);
      new Notice(`Saved to ${filename}`);
      this.close();
    } catch (error) {
      new Notice(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
