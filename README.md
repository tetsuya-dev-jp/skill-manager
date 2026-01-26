# Skill Manager
Local control center for agent skills on your machine.

[日本語](README.ja.md)

![Skill Manager dashboard](public/screenshot.png)

## What it does
- Indexes skills across multiple agents and shared libraries
- Lets you search, filter, and inspect skill metadata
- Renders skill content as markdown with syntax highlighting
- Shares skills across agents via symlinks
- Exports filtered skills as a ZIP backup

## Quickstart
### Requirements
- Node.js 18+ (20+ recommended)

### Install
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run start
```

## How skills are detected
Each skill is a directory (or symlink) that contains `SKILL.md`.
The app scans the agent paths below and builds the UI from what it finds.

## Supported Agents
- Antigravity: `~/.gemini/antigravity/global_skills`
- Claude Code: `~/.claude/skills`
- Cline: `~/.cline/skills`
- Codex: `~/.codex/skills`
- Cursor: `~/.cursor/skills`
- Gemini CLI: `~/.gemini/skills`
- GitHub Copilot: `~/.copilot/skills`
- Goose: `~/.config/goose/skills`
- Kiro CLI: `~/.kiro/skills`
- MCPJam: `~/.mcpjam/skills`
- OpenCode: `~/.config/opencode/skills`
- Pi: `~/.pi/agent/skills`
- Qwen Code: `~/.qwen/skills`
- Trae: `~/.trae/skills`
- Windsurf: `~/.codeium/windsurf/skills`
- Shared: `~/.agents/skills` (symlinked)

## Notes
- Sharing uses symlinks, so removing a shared skill from one agent does not delete the source.
- The UI reads local files; run it on the same machine where your skills live.
