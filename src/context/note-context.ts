/**
 * Note Context Extraction
 */

import { App, TFile } from 'obsidian';
import type { NoteContext, CottonSettings } from '../types';

export class NoteContextBuilder {
  private app: App;
  private settings: CottonSettings;

  constructor(app: App, settings: CottonSettings) {
    this.app = app;
    this.settings = settings;
  }

  updateSettings(settings: CottonSettings): void {
    this.settings = settings;
  }

  async buildContext(file: TFile | null, selection?: string): Promise<NoteContext | null> {
    if (!file) {
      return null;
    }

    const content = await this.app.vault.read(file);
    const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;

    const context: NoteContext = {
      path: file.path,
      name: file.basename,
      content: this.truncateContent(content),
      frontmatter,
      selection,
    };

    if (this.settings.includeBacklinks) {
      context.backlinks = this.getBacklinks(file);
    }

    return context;
  }

  private truncateContent(content: string): string {
    const lines = content.split('\n');
    if (lines.length <= this.settings.contextLines) {
      return content;
    }
    return lines.slice(0, this.settings.contextLines).join('\n') + '\n\n[...truncated]';
  }

  private getBacklinks(file: TFile): string[] {
    const backlinks: string[] = [];
    const resolvedLinks = this.app.metadataCache.resolvedLinks;

    for (const [sourcePath, links] of Object.entries(resolvedLinks)) {
      if (links[file.path]) {
        backlinks.push(sourcePath);
      }
    }

    return backlinks.slice(0, 10); // Limit to 10 backlinks
  }

  formatContextForPrompt(context: NoteContext): string {
    let formatted = `## Current Note: ${context.name}\n\n`;

    if (context.frontmatter) {
      formatted += `### Frontmatter\n\`\`\`yaml\n${JSON.stringify(context.frontmatter, null, 2)}\n\`\`\`\n\n`;
    }

    if (context.selection) {
      formatted += `### Selected Text\n\`\`\`\n${context.selection}\n\`\`\`\n\n`;
    }

    formatted += `### Content\n\`\`\`markdown\n${context.content}\n\`\`\`\n`;

    if (context.backlinks && context.backlinks.length > 0) {
      formatted += `\n### Backlinks\n${context.backlinks.map((b) => `- [[${b}]]`).join('\n')}\n`;
    }

    return formatted;
  }
}
