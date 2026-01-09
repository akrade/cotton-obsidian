/**
 * Cotton AI Plugin for Obsidian
 *
 * AI assistant with Cotton coding standards and preferences.
 */

import { Plugin, WorkspaceLeaf } from 'obsidian';
import { CottonSettingTab } from './settings';
import { ClaudeClient } from './ai/client';
import { PreferencesLoader } from './ai/preferences';
import { NoteContextBuilder } from './context/note-context';
import { registerAskClaudeCommand } from './commands/ask-claude';
import { CottonChatView, CHAT_VIEW_TYPE } from './views/chat-view';
import { DEFAULT_SETTINGS, type CottonSettings } from './types';

export default class CottonPlugin extends Plugin {
  settings: CottonSettings = DEFAULT_SETTINGS;
  claude: ClaudeClient;
  preferences: PreferencesLoader;
  contextBuilder: NoteContextBuilder;

  async onload(): Promise<void> {
    console.log('Loading Cotton AI plugin');

    // Load settings
    await this.loadSettings();

    // Initialize services
    this.claude = new ClaudeClient(this.settings);
    this.preferences = new PreferencesLoader(this.settings);
    this.contextBuilder = new NoteContextBuilder(this.app, this.settings);

    // Load preferences
    await this.preferences.loadPreferences();

    // Add settings tab
    this.addSettingTab(new CottonSettingTab(this.app, this));

    // Register chat view
    this.registerView(
      CHAT_VIEW_TYPE,
      (leaf) => new CottonChatView(leaf, this)
    );

    // Register commands
    registerAskClaudeCommand(this);

    // Add command to toggle chat panel
    this.addCommand({
      id: 'toggle-chat-panel',
      name: 'Toggle Chat Panel',
      callback: () => this.toggleChatPanel(),
    });

    // Add ribbon icon to toggle chat panel
    this.addRibbonIcon('circle', 'Cotton AI', () => {
      this.toggleChatPanel();
    });

    console.log('Cotton AI plugin loaded');
  }

  async toggleChatPanel(): Promise<void> {
    const leaves = this.app.workspace.getLeavesOfType(CHAT_VIEW_TYPE);

    if (leaves.length > 0) {
      // Panel exists, toggle visibility
      const leaf = leaves[0];
      if (leaf.view.containerEl.isShown()) {
        leaf.detach();
      } else {
        this.app.workspace.revealLeaf(leaf);
      }
    } else {
      // Create new panel in left sidebar
      const leaf = this.app.workspace.getLeftLeaf(false);
      if (leaf) {
        await leaf.setViewState({
          type: CHAT_VIEW_TYPE,
          active: true,
        });
        this.app.workspace.revealLeaf(leaf);
      }
    }
  }

  onunload(): void {
    console.log('Unloading Cotton AI plugin');
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);

    // Update services with new settings
    this.claude.updateSettings(this.settings);
    this.preferences.updateSettings(this.settings);
    this.contextBuilder.updateSettings(this.settings);
  }
}
