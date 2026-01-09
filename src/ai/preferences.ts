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
      console.log('[Cotton] Bundled preferences loaded:', bundledPrefs.length);
      allPreferences.push(...bundledPrefs);
    }

    // 2. Load personal preferences (~/.cotton/preferences)
    if (this.settings.personalPrefsPath) {
      const personalPath = this.expandPath(this.settings.personalPrefsPath);
      console.log('[Cotton] Loading personal prefs from:', personalPath);
      const personalPrefs = await this.loadFromDirectory(personalPath);
      console.log('[Cotton] Personal preferences loaded:', personalPrefs.length);
      allPreferences.push(...personalPrefs);
    } else {
      // Default personal path
      const defaultPersonalPath = path.join(os.homedir(), '.cotton', 'preferences');
      console.log('[Cotton] Checking default personal path:', defaultPersonalPath, 'exists:', fs.existsSync(defaultPersonalPath));
      if (fs.existsSync(defaultPersonalPath)) {
        const personalPrefs = await this.loadFromDirectory(defaultPersonalPath);
        console.log('[Cotton] Default personal preferences loaded:', personalPrefs.length);
        allPreferences.push(...personalPrefs);
      }
    }

    // 3. Load team preferences (.cotton/preferences in project)
    if (this.settings.teamPrefsPath) {
      const teamPath = this.expandPath(this.settings.teamPrefsPath);
      const teamPrefs = await this.loadFromDirectory(teamPath);
      allPreferences.push(...teamPrefs);
    }

    console.log('[Cotton] Total preferences loaded:', allPreferences.length);
    this.preferences = allPreferences;
    return allPreferences;
  }

  private async loadBundledPreferences(): Promise<Preference[]> {
    const preferences: Preference[] = [];

    try {
      // Find the cotton-ai package preferences directory
      // Try multiple possible locations (avoid require.resolve which doesn't work in Electron)
      const possiblePaths = [
        // Development: node_modules in project
        path.join(process.cwd(), 'node_modules', '@akrade', 'cotton-ai', 'preferences'),
        // Obsidian plugin location (relative to bundled main.js)
        path.join(__dirname, 'node_modules', '@akrade', 'cotton-ai', 'preferences'),
        path.join(__dirname, '..', 'node_modules', '@akrade', 'cotton-ai', 'preferences'),
      ];

      let prefsDir: string | null = null;
      for (const p of possiblePaths) {
        console.log('[Cotton] Checking bundled path:', p, 'exists:', fs.existsSync(p));
        if (fs.existsSync(p)) {
          prefsDir = p;
          break;
        }
      }

      if (prefsDir) {
        const files = await glob('*.pref.md', { cwd: prefsDir });
        console.log('[Cotton] Bundled files found:', files.length);

        for (const file of files) {
          const filePath = path.join(prefsDir, file);
          try {
            const pref = parsePreferenceFile(filePath);
            if (pref) {
              preferences.push(pref);
            }
          } catch (parseError) {
            console.warn('[Cotton] Failed to parse bundled preference:', filePath, parseError);
          }
        }
      } else {
        console.warn('[Cotton] Bundled preferences directory not found');
      }
    } catch (error) {
      console.warn('[Cotton] Failed to load bundled preferences:', error);
    }

    return preferences;
  }

  private async loadFromDirectory(dirPath: string): Promise<Preference[]> {
    const preferences: Preference[] = [];

    if (!fs.existsSync(dirPath)) {
      console.log('[Cotton] Directory does not exist:', dirPath);
      return preferences;
    }

    try {
      const files = await glob('**/*.pref.md', { cwd: dirPath });
      console.log('[Cotton] Found files in', dirPath, ':', files.length);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        try {
          const pref = parsePreferenceFile(filePath);
          if (pref) {
            preferences.push(pref);
          }
        } catch (parseError) {
          console.warn('[Cotton] Failed to parse preference file:', filePath, parseError);
        }
      }
    } catch (error) {
      console.warn(`[Cotton] Failed to load preferences from ${dirPath}:`, error);
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
