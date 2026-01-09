/**
 * Cotton AI Preferences Integration
 * Uses @akrade/cotton-ai to load and merge preferences
 */

import {
  parsePreferenceFile,
  mergePreferences,
  formatForLLM,
  type Preference,
  type MergedPreferences,
} from '@akrade/cotton-ai';
import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { CottonSettings } from '../types';

export class PreferencesLoader {
  private settings: CottonSettings;
  private preferences: Preference[] = [];
  private merged: MergedPreferences | null = null;

  constructor(settings: CottonSettings) {
    this.settings = settings;
  }

  updateSettings(settings: CottonSettings): void {
    this.settings = settings;
    // Clear cache when settings change
    this.preferences = [];
    this.merged = null;
  }

  async loadPreferences(): Promise<Preference[]> {
    const allPreferences: Preference[] = [];

    // 1. Load bundled preferences from cotton-ai package
    if (this.settings.useBundledPrefs) {
      const bundledPrefs = await this.loadBundledPreferences();
      allPreferences.push(...bundledPrefs);
    }

    // 2. Load personal preferences (~/.cotton/preferences)
    if (this.settings.personalPrefsPath) {
      const personalPath = this.expandPath(this.settings.personalPrefsPath);
      const personalPrefs = await this.loadFromDirectory(personalPath, 200); // Higher priority
      allPreferences.push(...personalPrefs);
    } else {
      // Default personal path
      const defaultPersonalPath = path.join(os.homedir(), '.cotton', 'preferences');
      if (fs.existsSync(defaultPersonalPath)) {
        const personalPrefs = await this.loadFromDirectory(defaultPersonalPath, 200);
        allPreferences.push(...personalPrefs);
      }
    }

    // 3. Load team preferences (.cotton/preferences in project)
    if (this.settings.teamPrefsPath) {
      const teamPath = this.expandPath(this.settings.teamPrefsPath);
      const teamPrefs = await this.loadFromDirectory(teamPath, 150);
      allPreferences.push(...teamPrefs);
    }

    this.preferences = allPreferences;
    return allPreferences;
  }

  private async loadBundledPreferences(): Promise<Preference[]> {
    const preferences: Preference[] = [];

    try {
      // Find the cotton-ai package preferences directory
      const cottonAiPath = require.resolve('@akrade/cotton-ai');
      const packageDir = path.dirname(path.dirname(cottonAiPath));
      const prefsDir = path.join(packageDir, 'preferences');

      if (fs.existsSync(prefsDir)) {
        const files = await glob('*.pref.md', { cwd: prefsDir });

        for (const file of files) {
          const filePath = path.join(prefsDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const pref = parsePreferenceFile(content, filePath);
          if (pref) {
            // Bundled prefs have base priority of 100
            preferences.push({ ...pref, priority: pref.priority || 100 });
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load bundled preferences:', error);
    }

    return preferences;
  }

  private async loadFromDirectory(dirPath: string, basePriority: number): Promise<Preference[]> {
    const preferences: Preference[] = [];

    if (!fs.existsSync(dirPath)) {
      return preferences;
    }

    try {
      const files = await glob('**/*.pref.md', { cwd: dirPath });

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const pref = parsePreferenceFile(content, filePath);
        if (pref) {
          // User prefs override bundled (higher priority)
          preferences.push({ ...pref, priority: (pref.priority || 100) + basePriority });
        }
      }
    } catch (error) {
      console.warn(`Failed to load preferences from ${dirPath}:`, error);
    }

    return preferences;
  }

  private expandPath(inputPath: string): string {
    if (inputPath.startsWith('~')) {
      return path.join(os.homedir(), inputPath.slice(1));
    }
    return inputPath;
  }

  formatForSystemPrompt(): string {
    if (this.preferences.length === 0) {
      return '';
    }

    // Parse context tags from settings
    const contextTags = this.settings.contextTags
      ? this.settings.contextTags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    // Merge preferences with context tags
    this.merged = mergePreferences(this.preferences, contextTags);

    // Format for LLM consumption
    return formatForLLM(this.merged);
  }

  getLoadedPreferences(): Preference[] {
    return this.preferences;
  }

  getMergedResult(): MergedPreferences | null {
    return this.merged;
  }
}
