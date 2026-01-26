export const AGENT_SPECS = [
  { id: 'amp', name: 'Amp', projectPath: '.agents/skills', globalPath: '~/.config/agents/skills' },
  { id: 'antigravity', name: 'Antigravity', projectPath: '.agent/skills', globalPath: '~/.gemini/antigravity/global_skills' },
  { id: 'claude-code', name: 'Claude Code', projectPath: '.claude/skills', globalPath: '~/.claude/skills' },
  { id: 'clawdbot', name: 'Clawdbot', projectPath: 'skills', globalPath: '~/.clawdbot/skills' },
  { id: 'cline', name: 'Cline', projectPath: '.cline/skills', globalPath: '~/.cline/skills' },
  { id: 'codex', name: 'Codex', projectPath: '.codex/skills', globalPath: '~/.codex/skills' },
  { id: 'command-code', name: 'Command Code', projectPath: '.commandcode/skills', globalPath: '~/.commandcode/skills' },
  { id: 'continue', name: 'Continue', projectPath: '.continue/skills', globalPath: '~/.continue/skills' },
  { id: 'crush', name: 'Crush', projectPath: '.crush/skills', globalPath: '~/.config/crush/skills' },
  { id: 'cursor', name: 'Cursor', projectPath: '.cursor/skills', globalPath: '~/.cursor/skills' },
  { id: 'droid', name: 'Droid', projectPath: '.factory/skills', globalPath: '~/.factory/skills' },
  { id: 'gemini-cli', name: 'Gemini CLI', projectPath: '.gemini/skills', globalPath: '~/.gemini/skills' },
  { id: 'github-copilot', name: 'GitHub Copilot', projectPath: '.github/skills', globalPath: '~/.copilot/skills' },
  { id: 'goose', name: 'Goose', projectPath: '.goose/skills', globalPath: '~/.config/goose/skills' },
  { id: 'kilo', name: 'Kilo Code', projectPath: '.kilocode/skills', globalPath: '~/.kilocode/skills' },
  { id: 'kiro-cli', name: 'Kiro CLI', projectPath: '.kiro/skills', globalPath: '~/.kiro/skills' },
  { id: 'mcpjam', name: 'MCPJam', projectPath: '.mcpjam/skills', globalPath: '~/.mcpjam/skills' },
  { id: 'opencode', name: 'OpenCode', projectPath: '.opencode/skills', globalPath: '~/.config/opencode/skills' },
  { id: 'openhands', name: 'OpenHands', projectPath: '.openhands/skills', globalPath: '~/.openhands/skills' },
  { id: 'pi', name: 'Pi', projectPath: '.pi/skills', globalPath: '~/.pi/agent/skills' },
  { id: 'qoder', name: 'Qoder', projectPath: '.qoder/skills', globalPath: '~/.qoder/skills' },
  { id: 'qwen-code', name: 'Qwen Code', projectPath: '.qwen/skills', globalPath: '~/.qwen/skills' },
  { id: 'roo', name: 'Roo Code', projectPath: '.roo/skills', globalPath: '~/.roo/skills' },
  { id: 'trae', name: 'Trae', projectPath: '.trae/skills', globalPath: '~/.trae/skills' },
  { id: 'windsurf', name: 'Windsurf', projectPath: '.windsurf/skills', globalPath: '~/.codeium/windsurf/skills' },
  { id: 'zencoder', name: 'Zencoder', projectPath: '.zencoder/skills', globalPath: '~/.zencoder/skills' },
  { id: 'neovate', name: 'Neovate', projectPath: '.neovate/skills', globalPath: '~/.neovate/skills' },
] as const;

export type AgentId = typeof AGENT_SPECS[number]['id'];

export function isAgentId(value: string): value is AgentId {
  return AGENT_SPECS.some((spec) => spec.id === value);
}

export function getAgentName(agentId: string): string {
  if (agentId === 'shared') return 'Shared';
  const spec = AGENT_SPECS.find((item) => item.id === agentId);
  return spec?.name ?? agentId;
}

export function getAgentLabel(agentId: string): string {
  return getAgentName(agentId).toUpperCase();
}

export function getAgentMonogram(agentId: string): string {
  const name = getAgentName(agentId);
  const tokens = name.split(/[\s/]+/).filter(Boolean);
  if (tokens.length === 1) {
    return tokens[0].slice(0, 2).toUpperCase();
  }
  return tokens.map((token) => token[0]).join('').slice(0, 2).toUpperCase();
}
