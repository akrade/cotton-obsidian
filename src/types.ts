/**
 * Cotton Obsidian Plugin Types
 */

export interface CottonSettings {
  /** Claude API key */
  apiKey: string;

  /** Claude model to use */
  model: 'claude-sonnet-4-20250514' | 'claude-opus-4-20250514' | 'claude-3-5-haiku-20241022';

  /** Path to personal preferences directory */
  personalPrefsPath: string;

  /** Path to team preferences directory */
  teamPrefsPath: string;

  /** Enable streaming responses */
  streamResponses: boolean;

  /** Number of context lines to include from current note */
  contextLines: number;

  /** Include backlinks in context */
  includeBacklinks: boolean;

  /** Folder to save chat conversations */
  chatFolder: string;

  /** Use bundled Cotton preferences */
  useBundledPrefs: boolean;

  /** Context tags to filter preferences */
  contextTags: string;
}

export const DEFAULT_SETTINGS: CottonSettings = {
  apiKey: '',
  model: 'claude-sonnet-4-20250514',
  personalPrefsPath: '',
  teamPrefsPath: '',
  streamResponses: true,
  contextLines: 100,
  includeBacklinks: true,
  chatFolder: 'Cotton/Chats',
  useBundledPrefs: true,
  contextTags: '',
};

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface NoteContext {
  path: string;
  name: string;
  content: string;
  frontmatter?: Record<string, unknown>;
  backlinks?: string[];
  selection?: string;
}
