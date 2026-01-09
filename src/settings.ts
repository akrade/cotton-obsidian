/**
 * Cotton Settings Tab
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import type CottonPlugin from './main';
import type { CottonSettings } from './types';

export class CottonSettingTab extends PluginSettingTab {
  plugin: CottonPlugin;

  constructor(app: App, plugin: CottonPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Cotton AI Settings' });

    // API Key
    new Setting(containerEl)
      .setName('Claude API Key')
      .setDesc('Your Anthropic API key for Claude')
      .addText((text) =>
        text
          .setPlaceholder('sk-ant-...')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          })
      );

    // Model Selection
    new Setting(containerEl)
      .setName('Model')
      .setDesc('Claude model to use for responses')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('claude-sonnet-4-20250514', 'Claude Sonnet 4 (Recommended)')
          .addOption('claude-opus-4-20250514', 'Claude Opus 4 (Most capable)')
          .addOption('claude-3-5-haiku-20241022', 'Claude 3.5 Haiku (Fastest)')
          .setValue(this.plugin.settings.model)
          .onChange(async (value) => {
            this.plugin.settings.model = value as CottonSettings['model'];
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl('h3', { text: 'Preferences' });

    // Personal Preferences Path
    new Setting(containerEl)
      .setName('Personal Preferences Path')
      .setDesc('Path to your personal Cotton preferences (e.g., ~/.cotton/preferences)')
      .addText((text) =>
        text
          .setPlaceholder('~/.cotton/preferences')
          .setValue(this.plugin.settings.personalPrefsPath)
          .onChange(async (value) => {
            this.plugin.settings.personalPrefsPath = value;
            await this.plugin.saveSettings();
          })
      );

    // Team Preferences Path
    new Setting(containerEl)
      .setName('Team Preferences Path')
      .setDesc('Path to team Cotton preferences (e.g., .cotton/preferences)')
      .addText((text) =>
        text
          .setPlaceholder('.cotton/preferences')
          .setValue(this.plugin.settings.teamPrefsPath)
          .onChange(async (value) => {
            this.plugin.settings.teamPrefsPath = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl('h3', { text: 'Behavior' });

    // Streaming
    new Setting(containerEl)
      .setName('Stream Responses')
      .setDesc('Show responses as they are generated')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.streamResponses)
          .onChange(async (value) => {
            this.plugin.settings.streamResponses = value;
            await this.plugin.saveSettings();
          })
      );

    // Context Lines
    new Setting(containerEl)
      .setName('Context Lines')
      .setDesc('Number of lines from current note to include as context')
      .addSlider((slider) =>
        slider
          .setLimits(0, 500, 10)
          .setValue(this.plugin.settings.contextLines)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.contextLines = value;
            await this.plugin.saveSettings();
          })
      );

    // Include Backlinks
    new Setting(containerEl)
      .setName('Include Backlinks')
      .setDesc('Include backlink information in context')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.includeBacklinks)
          .onChange(async (value) => {
            this.plugin.settings.includeBacklinks = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
