# Contributing to Cotton AI for Obsidian

Thank you for your interest in contributing to Cotton AI! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- An Obsidian vault for testing

### Getting Started

```bash
# Clone the repository
git clone https://github.com/akrade/cotton-obsidian.git
cd cotton-obsidian

# Install dependencies
npm install

# Build the plugin
npm run build

# Watch for changes during development
npm run dev
```

### Testing in Obsidian

1. Create a symlink from this repo to your vault's plugins folder:
   ```bash
   ln -s /path/to/cotton-obsidian /path/to/vault/.obsidian/plugins/cotton-ai
   ```

2. Reload Obsidian (Cmd+R / Ctrl+R)

3. Enable "Cotton AI" in Settings → Community plugins

## Git Workflow

### Branch Naming

We use a ticket-based branch naming convention:

```
type/CTN-{ID}--short-description
```

- `type`: `feat`, `fix`, `chore`, `docs`, `refactor`
- `ID`: Next PR number (check with `gh pr list --state all --limit 1`)
- `description`: kebab-case description

Examples:
- `feat/CTN-5--add-voice-input`
- `fix/CTN-6--streaming-timeout`
- `docs/CTN-7--api-documentation`

### Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]
```

Examples:
- `feat(chat): add per-response save with icon actions`
- `fix(modal): handle empty response content`
- `chore: bump version to 0.3.0`

### Pull Requests

1. Create feature branches from `develop`
2. Make your changes with clear, atomic commits
3. Ensure the build passes: `npm run build`
4. Run type checking: `npm run typecheck`
5. Create a PR targeting `develop`
6. After review and merge, changes flow to `main` for releases

## Code Style

### TypeScript

- Use strict TypeScript (no `any` unless absolutely necessary)
- Prefer explicit types over inference for function signatures
- Use interfaces for object shapes

### Obsidian API

- Follow Obsidian's plugin development patterns
- Use Obsidian's built-in components when available (Modal, Setting, etc.)
- Use `setIcon()` for Lucide icons

### CSS

- Use Obsidian's CSS variables for theming (`var(--background-primary)`, etc.)
- Prefix all classes with `cotton-` to avoid conflicts
- Keep specificity low

## Project Structure

```
cotton-obsidian/
├── src/
│   ├── main.ts           # Plugin entry point
│   ├── types.ts          # TypeScript interfaces
│   ├── settings.ts       # Settings tab
│   ├── ai/
│   │   ├── client.ts     # Claude API client
│   │   └── preferences.ts # Preference loading
│   ├── commands/
│   │   └── ask-claude.ts # Ask Claude modal command
│   ├── context/
│   │   └── note-context.ts # Note context builder
│   ├── modals/
│   │   └── response-save-modal.ts # Save response modal
│   └── views/
│       └── chat-view.ts  # Chat sidebar panel
├── styles.css            # Plugin styles
├── manifest.json         # Obsidian plugin manifest
└── versions.json         # Version compatibility
```

## Adding Features

### New Commands

1. Create a file in `src/commands/`
2. Export a registration function
3. Call it from `main.ts` in `onload()`

### New Views

1. Create a file in `src/views/`
2. Extend `ItemView`
3. Register in `main.ts` with `registerView()`

### New Modals

1. Create a file in `src/modals/`
2. Extend `Modal` or `SuggestModal`
3. Import and instantiate where needed

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
