# Cotton AI for Obsidian

[![GitHub release](https://img.shields.io/github/v/release/akrade/cotton-obsidian)](https://github.com/akrade/cotton-obsidian/releases)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Obsidian](https://img.shields.io/badge/Obsidian-Plugin-7c3aed)](https://obsidian.md/)

AI assistant plugin for Obsidian with Cotton coding standards and preferences.

## Features

- **Chat Sidebar Panel** - Persistent chat in the right sidebar with conversation history
- **Per-Response Save** - Save individual AI responses to notes with copy/save icons on hover
- **Ask Claude Modal** - Quick AI-powered Q&A with note context
- **Cotton Preferences** - Coding standards loaded automatically from `.pref.md` files
- **Streaming Responses** - See answers as they're generated
- **Note Context** - Includes current note, selection, and backlinks
- **Multiple Models** - Choose Sonnet 4, Opus 4, or Haiku 3.5

## Why Use This?

You're planning a new React component in Obsidian. You select your API notes and ask Claude how to structure it.

**Without Cotton AI:** You copy-paste your team's coding conventions into the chat every time.

**With Cotton AI:** Claude already knows your standards. It responds with code using your `forwardRef` patterns, your naming conventions, your token system - because your `.pref.md` files are loaded automatically.

The plugin turns Obsidian into a context-aware AI workspace where Claude understands "how we do things here."

## Installation

### Via BRAT (Recommended)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) from Community Plugins
2. Open BRAT settings
3. Click "Add Beta Plugin"
4. Enter: `akrade/cotton-obsidian`
5. Enable the plugin

### Manual Installation

1. Download the latest release from [Releases](https://github.com/akrade/cotton-obsidian/releases)
2. Extract to your vault's `.obsidian/plugins/cotton-ai/` folder
3. Reload Obsidian
4. Enable "Cotton AI" in Settings → Community plugins

## Setup

1. Go to Settings → Cotton AI
2. Enter your [Anthropic API key](https://console.anthropic.com/)
3. Choose your preferred model
4. (Optional) Configure preferences paths

## Usage

### Chat Sidebar Panel

Click the Cotton icon in the left ribbon or use `Cotton: Open Chat Panel` from the command palette. The chat panel provides:

- Persistent conversation history
- Add current note as context
- Clear chat to start fresh
- **Hover actions** on each response:
  - Copy icon - Copy response to clipboard
  - Save icon - Save response to a note

### Save Response Options

When you click the save icon on any AI response:

| Option | Description |
|--------|-------------|
| **Quick Save** | Save to `Cotton/Chats/Responses/` with auto-generated filename |
| **Append to Current Note** | Add response to the active note |
| **Create New Note** | Choose custom name and location |
| **Browse...** | Select any folder in your vault |

### Ask Claude Modal

- **Command Palette**: `Cotton: Ask Claude`
- **Keyboard**: Assign a hotkey in Settings → Hotkeys

The command opens a modal where you can ask questions. Your current note's content and any selected text are automatically included as context.

### With Selection

1. Select text in your note
2. Run "Cotton: Ask Claude"
3. Ask about the selected text

## Settings

| Setting | Description |
|---------|-------------|
| **API Key** | Your Anthropic API key |
| **Model** | Claude model (Sonnet 4, Opus 4, or Haiku 3.5) |
| **Personal Prefs** | Path to personal Cotton preferences |
| **Team Prefs** | Path to team Cotton preferences |
| **Stream Responses** | Show responses as they generate |
| **Context Lines** | Lines of note content to include |
| **Include Backlinks** | Add backlink info to context |
| **Chat Folder** | Folder to save chat conversations and responses |

## Cotton Preferences

Cotton AI loads coding standards from `.pref.md` files:

```
~/.cotton/preferences/          # Personal (highest priority)
.cotton/preferences/            # Team
```

These preferences are automatically included in every Claude conversation, ensuring consistent coding standards.

## Development

```bash
# Clone repo
git clone https://github.com/akrade/cotton-obsidian.git
cd cotton-obsidian

# Install dependencies
npm install

# Build
npm run build

# Development (watch mode)
npm run dev

# Type checking
npm run typecheck
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## Related

- [Cotton Design System](https://github.com/akrade/cotton) - Full design system
- [@akrade/cotton-ai](https://www.npmjs.com/package/@akrade/cotton-ai) - AI preferences engine
- [@akrade/cotton-mcp](https://www.npmjs.com/package/@akrade/cotton-mcp) - MCP server for Claude Desktop

## License

Apache License 2.0 - See [LICENSE](LICENSE) for details.

---

Made with Cotton by [Akrade](https://www.akrade.com)
