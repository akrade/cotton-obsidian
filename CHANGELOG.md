# Changelog

All notable changes to Cotton AI for Obsidian will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-01-09

### Added

- **Chain of thought display** - Claude-style thinking indicator during response generation
  - Animated spinner with stage labels (Understanding, Reviewing context, Thinking, Generating)
  - No more raw streaming text - buffered until complete
  - Smooth fade-in animation for final formatted response
- **ThinkingIndicator component** - Reusable animated thinking UI

### Changed

- Responses now appear fully formatted after generation completes
- Improved UX with polished loading states

## [0.3.0] - 2026-01-09

### Added

- **Per-response save feature** - Save individual AI responses to markdown notes
  - Copy icon on hover to copy response to clipboard
  - Save icon on hover to save response to a note
  - Save options: Quick Save, Append to Current Note, Create New Note, Browse
  - Saved notes include frontmatter metadata (source, timestamp, model)
- **Storage settings** - Configurable chat folder location in settings

### Changed

- Action icons appear on hover for assistant messages (subtle, non-intrusive UI)
- Improved message rendering with separate content container

## [0.2.0] - 2026-01-09

### Added

- **Chat sidebar panel** - Persistent chat interface in the right sidebar
  - Conversation history with message persistence
  - Add current note as context button
  - Clear chat functionality
  - Model badge display
  - Streaming responses in chat
  - Auto-save conversations to markdown notes

### Changed

- Reorganized plugin architecture with dedicated views directory

## [0.1.0] - 2026-01-08

### Added

- Initial release
- **Ask Claude modal** - AI-powered Q&A with note context
- **Cotton preferences** - Automatic loading of `.pref.md` files
- **Streaming responses** - Real-time response display
- **Note context** - Include current note, selection, and backlinks
- **Multiple models** - Support for Sonnet 4, Opus 4, and Haiku 3.5
- Settings for API key, model selection, and preferences paths
- Ribbon icon and command palette integration

[0.4.0]: https://github.com/akrade/cotton-obsidian/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/akrade/cotton-obsidian/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/akrade/cotton-obsidian/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/akrade/cotton-obsidian/releases/tag/v0.1.0
