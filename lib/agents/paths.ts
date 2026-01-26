import os from 'os';
import path from 'path';
import { AGENT_SPECS, type AgentId } from '@/lib/agents/specs';

export const SHARED_SKILLS_DIR = path.join(os.homedir(), '.agents', 'skills');
export const SHARED_LOCK_FILE = path.join(os.homedir(), '.agents', '.skill-lock.json');

export function resolveHomePath(input: string): string {
  if (input.startsWith('~/')) {
    return path.join(os.homedir(), input.slice(2));
  }
  return input;
}

export function getGlobalSkillsPath(agentId: AgentId): string {
  const spec = AGENT_SPECS.find((item) => item.id === agentId);
  if (!spec) {
    throw new Error(`Unknown agent id: ${agentId}`);
  }
  return resolveHomePath(spec.globalPath);
}
