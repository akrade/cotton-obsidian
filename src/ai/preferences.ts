/**
 * Cotton AI Preferences Integration
 */

import type { CottonSettings } from '../types';

// Note: In production, this would import from @akrade/cotton-ai
// For now, we'll use a simplified inline implementation

export interface Preference {
  id: string;
  name: string;
  content: string;
  priority: number;
  tags?: string[];
}

export class PreferencesLoader {
  private settings: CottonSettings;
  private preferences: Preference[] = [];

  constructor(settings: CottonSettings) {
    this.settings = settings;
  }

  updateSettings(settings: CottonSettings): void {
    this.settings = settings;
  }

  async loadPreferences(): Promise<Preference[]> {
    // TODO: Load from cotton-ai package
    // For now, return built-in Cotton preferences
    this.preferences = [
      {
        id: 'cotton-react',
        name: 'Cotton React Conventions',
        priority: 100,
        tags: ['react', 'typescript'],
        content: `## React Conventions

- Use named exports, not default exports
- Use function declarations with forwardRef
- Add displayName for debugging
- Use semantic tokens, never primitives

## Example

\`\`\`tsx
export const CottonButton = forwardRef<HTMLButtonElement, Props>(
  function CottonButton(props, ref) {
    return <button ref={ref} {...props} />;
  }
);
CottonButton.displayName = 'CottonButton';
\`\`\``,
      },
      {
        id: 'cotton-tokens',
        name: 'Cotton Design Tokens',
        priority: 100,
        tags: ['css', 'tokens'],
        content: `## Design Tokens

Always use semantic tokens:
- \`--cotton-color-text-primary\` (not \`--cotton-color-gray-900\`)
- \`--cotton-color-action-primary\` (not \`--cotton-color-blue-500\`)
- \`--cotton-spacing-4\` (not \`16px\`)

## BEM Naming

\`\`\`css
.cotton-btn { }           /* Block */
.cotton-btn--primary { }  /* Modifier */
.cotton-btn__icon { }     /* Element */
\`\`\``,
      },
    ];

    return this.preferences;
  }

  formatForSystemPrompt(): string {
    if (this.preferences.length === 0) {
      return '';
    }

    const sections = this.preferences
      .sort((a, b) => b.priority - a.priority)
      .map((pref) => `### ${pref.name}\n\n${pref.content}`)
      .join('\n\n---\n\n');

    return `## Cotton AI Preferences

The following coding standards and conventions should be followed:

${sections}`;
  }
}
