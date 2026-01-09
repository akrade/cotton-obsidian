# MCP Server Integration Guide

This guide explains how to integrate Cotton MCP with your AI workflow.

## What is MCP?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) is Anthropic's open standard for connecting AI assistants to external tools and data sources. Think of it as a universal adapter that lets AI tools access your coding standards, design system specs, and project context.

## Why Use Cotton MCP?

Without Cotton MCP, you need to manually explain your coding standards to each AI tool:

- Copy-paste conventions into Claude Desktop
- Re-explain your component patterns in each conversation
- Hope the AI remembers your preferences

With Cotton MCP, your standards are **always available**:

- Same preferences across Obsidian, Claude Desktop, and Claude Code
- AI tools can query specific rules when needed
- Hot-reload when you update `.pref.md` files

## Available Tools

Cotton MCP exposes these tools to AI assistants:

| Tool | Description |
|------|-------------|
| `get_preferences` | Get all merged coding standards with optional tag filtering |
| `get_preference_by_id` | Get a specific preference by its ID |
| `search_preferences` | Search preferences by query string |
| `validate_code` | Validate code against preferences |
| `figma_structure` | Get Figma component layer structure |
| `figma_build` | Get Figma Plugin API code for components |
| `figma_variables` | Get Cotton token to Figma variable mappings |
| `figma_components` | List all available component recipes |

## Setup

### Option 1: Published Package (Recommended)

Use the npm package for production:

```json
{
  "mcpServers": {
    "cotton": {
      "command": "npx",
      "args": ["@akrade/cotton-mcp@0.1.0"]
    }
  }
}
```

### Option 2: Local Development

Use a local path when developing cotton-mcp:

```json
{
  "mcpServers": {
    "cotton": {
      "command": "node",
      "args": ["/path/to/cotton/packages/mcp/bin/cotton-mcp.js"]
    }
  }
}
```

### Option 3: Git Reference

Reference the git repository directly:

```json
{
  "mcpServers": {
    "cotton": {
      "command": "npx",
      "args": ["github:akrade/cotton#packages/mcp"]
    }
  }
}
```

## Client Configuration

### Claude Code (Antigravity)

Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "cotton": {
      "command": "npx",
      "args": ["@akrade/cotton-mcp"]
    }
  }
}
```

Or add globally via CLI:

```bash
claude mcp add cotton npx @akrade/cotton-mcp
```

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "cotton": {
      "command": "npx",
      "args": ["@akrade/cotton-mcp"],
      "env": {
        "COTTON_PERSONAL_PREFS": "~/.cotton/preferences"
      }
    }
  }
}
```

Restart Claude Desktop after editing.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `COTTON_PERSONAL_PREFS` | Personal preferences path | `~/.cotton/preferences` |
| `COTTON_TEAM_PREFS` | Team preferences path | `.cotton/preferences` |
| `COTTON_DEFAULT_PREFS` | Bundled preferences path | (from package) |

## Security Best Practices

### Project-Level vs Global Config

| Approach | Pros | Cons |
|----------|------|------|
| **Project `.mcp.json`** | Scoped, auditable, version controlled | Per-project setup |
| **Global settings** | One-time setup | All projects share servers |

**Recommendation**: Use project-level `.mcp.json` for better security and auditability.

### Secrets Management

- Never commit API keys in `.mcp.json`
- Use environment variables for sensitive data
- Add `.mcp.json` to `.gitignore` if it contains local paths

### Version Pinning

Always pin versions in production:

```json
// Good
"args": ["@akrade/cotton-mcp@0.1.0"]

// Avoid
"args": ["@akrade/cotton-mcp@latest"]
```

## Troubleshooting

### Server Not Loading

1. Check the path/package name is correct
2. Verify Node.js 20+ is installed
3. Check Claude Code/Desktop logs for errors

### Preferences Not Found

1. Verify preference paths exist
2. Check file permissions
3. Ensure `.pref.md` files have valid frontmatter

### Hot Reload Not Working

Cotton MCP watches for file changes by default. If changes aren't detected:

1. Check `watchForChanges` isn't disabled in config
2. Verify file system permissions
3. Try restarting the server

## Related Resources

- [Model Context Protocol](https://modelcontextprotocol.io/) - Official MCP documentation
- [Cotton AI](https://github.com/akrade/cotton) - Main Cotton repository
- [@akrade/cotton-mcp](https://www.npmjs.com/package/@akrade/cotton-mcp) - npm package
