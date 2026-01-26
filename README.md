# Skill Manager

[日本語](README.ja.md)

![Skill Manager dashboard](public/screenshot.png)

## Overview
Skill Manager is a local web UI for managing agent skills across Claude Code and Codex. It scans your local skill directories, lets you filter and inspect skills, shares them via symlinks, and exports backups as ZIP.

## Features
- Unified view of Claude/Codex/shared skills
- Search, filter, and inspect skill metadata
- Share skills between agents (symlink-based)
- Export selected skills to a ZIP backup

## Getting Started

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

## Skill Locations
- Claude Code: `~/.claude/skills`
- Codex: `~/.codex/skills`
- Shared: `~/.agents/skills` (symlinked)

## Notes
- Sharing uses symlinks, so removing a shared skill from one agent does not delete the source.
- The UI reads local files; run it on the same machine where your skills live.
