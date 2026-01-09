# Cotton AI for Obsidian

AI assistant plugin for Obsidian with Cotton coding standards and preferences.

## Features

- **Ask Claude** - AI-powered Q&A with note context
- **Cotton Preferences** - Coding standards loaded automatically
- **Streaming Responses** - See answers as they're generated
- **Note Context** - Includes current note, selection, and backlinks
- **Multiple Models** - Choose Sonnet, Opus, or Haiku

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

### Ask Claude

- **Command Palette**: `Cotton: Ask Claude`
- **Keyboard**: Assign a hotkey in Settings → Hotkeys
- **Ribbon**: Click the message icon

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
```

## Related

- [Cotton Design System](https://github.com/akrade/cotton) - Full design system
- [@akrade/cotton-ai](https://www.npmjs.com/package/@akrade/cotton-ai) - AI preferences engine
- [@akrade/cotton-mcp](https://www.npmjs.com/package/@akrade/cotton-mcp) - MCP server for Claude Desktop

## License

Apache License 2.0 - See [LICENSE](LICENSE) for details.
