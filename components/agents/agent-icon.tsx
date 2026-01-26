'use client';

import {
  Claude,
  Cline,
  Cursor,
  Gemini,
  GithubCopilot,
  Goose,
  Inflection,
  MCP,
  OpenAI,
  Qwen,
  Trae,
  Windsurf,
  type IconType,
} from '@lobehub/icons';
import { Link2, Square } from 'lucide-react';
import type { AgentType } from '@/types';
import { cn } from '@/lib/utils';
import { getAgentName } from '@/lib/agents/specs';

const iconMap: Partial<Record<AgentType, IconType>> = {
  'claude-code': Claude.Color,
  cline: Cline,
  codex: OpenAI,
  cursor: Cursor,
  'gemini-cli': Gemini.Color,
  'github-copilot': GithubCopilot,
  goose: Goose,
  mcpjam: MCP,
  pi: Inflection,
  'qwen-code': Qwen.Color,
  trae: Trae.Color,
  windsurf: Windsurf,
};

const imageMap: Partial<Record<AgentType, string>> = {
  antigravity: '/agent-logos/antigravity.svg',
  'kiro-cli': '/agent-logos/kiro-cli.svg',
  opencode: '/agent-logos/opencode.svg',
};

interface AgentIconProps {
  agentId: AgentType;
  className?: string;
}

export function AgentIcon({ agentId, className }: AgentIconProps) {
  const Icon = iconMap[agentId];
  if (Icon) {
    return (
      <Icon
        aria-label={`${getAgentName(agentId)} logo`}
        className={cn('h-7 w-7', className)}
      />
    );
  }

  const logoSrc = imageMap[agentId];
  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt={`${getAgentName(agentId)} logo`}
        className={cn('h-7 w-7 object-contain', className)}
        loading="lazy"
      />
    );
  }

  const Fallback = agentId === 'shared' ? Link2 : Square;
  return <Fallback className={cn('h-6 w-6', className)} strokeWidth={2} />;
}
