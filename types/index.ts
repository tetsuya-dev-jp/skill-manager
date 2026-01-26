import type { AgentId } from '@/lib/agents/specs';

// スキル関連の型定義

export interface SkillMetadata {
  name: string;
  description: string;
  version: string;
  license?: string;
  tags?: string[];
  author?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  path: string;
  agent: AgentType;
  isShared: boolean;
  isSymlink: boolean;
  metadata: SkillMetadata;
  content: string;
}

export type AgentType = AgentId | 'shared';

export interface Agent {
  id: AgentType;
  name: string;
  skillsPath: string;
  configPath?: string;
  enabled: boolean;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Claude Code設定
export interface ClaudeSettings {
  permissions?: {
    allow?: string[];
    deny?: string[];
  };
  enabledPlugins?: Record<string, boolean>;
  language?: string;
  attribution?: {
    commit?: string;
    pr?: string;
  };
}

// Codex設定
export interface CodexConfig {
  model?: string;
  model_reasoning_effort?: string;
  projects?: Record<string, { trust_level?: string }>;
  features?: Record<string, boolean>;
  skills?: {
    enabled?: string[];
    disabled?: string[];
  };
}

// スキルロックファイル（共有スキル管理用）
export interface SkillLock {
  version: string;
  skills: Record<string, {
    source: AgentType;
    sharedWith: AgentType[];
    createdAt: string;
    updatedAt: string;
  }>;
}
