/**
 * Cotton AI Plugin for Obsidian
 *
 * AI assistant with Cotton coding standards and preferences.
 */

import { Plugin } from 'obsidian';
import { CottonSettingTab } from './settings';
import { ClaudeClient } from './ai/client';
import { PreferencesLoader } from './ai/preferences';
import { NoteContextBuilder } from './context/note-context';
import { registerAskClaudeCommand } from './commands/ask-claude';
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

    // Register commands
    registerAskClaudeCommand(this);

    // Add ribbon icon
    this.addRibbonIcon('message-circle', 'Cotton AI', () => {
      this.app.commands.executeCommandById('cotton-ai:ask-claude-general');
    });

    console.log('Cotton AI plugin loaded');
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
