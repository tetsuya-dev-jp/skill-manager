import { Skill, Agent, AgentType } from '@/types';
import { getClaudeSkills, claudeAgent, deleteClaudeSkill, installSkillToClaude } from './claude';
import { getCodexSkills, codexAgent, deleteCodexSkill, installSkillToCodex } from './codex';
import { getSharedSkills, deleteSharedSkill, shareSkill } from '@/lib/fs/symlink';

export const agents: Agent[] = [
  claudeAgent,
  codexAgent,
  {
    id: 'shared',
    name: 'Shared',
    skillsPath: '~/.agents/skills/',
    configPath: '~/.agents/.skill-lock.json',
    enabled: true,
  },
];

export async function getAllSkills(): Promise<Skill[]> {
  const [claudeSkills, codexSkills, sharedSkills] = await Promise.all([
    getClaudeSkills(),
    getCodexSkills(),
    getSharedSkills(),
  ]);

  return [...claudeSkills, ...codexSkills, ...sharedSkills];
}

export async function getSkillsByAgent(agent: AgentType): Promise<Skill[]> {
  switch (agent) {
    case 'claude':
      return getClaudeSkills();
    case 'codex':
      return getCodexSkills();
    case 'shared':
      return getSharedSkills();
    default:
      return [];
  }
}

export async function deleteSkill(skillName: string, agent: AgentType): Promise<void> {
  switch (agent) {
    case 'claude':
      await deleteClaudeSkill(skillName);
      break;
    case 'codex':
      await deleteCodexSkill(skillName);
      break;
    case 'shared':
      await deleteSharedSkill(skillName);
      break;
  }
}

export async function installSkill(
  skillName: string,
  skillContent: Record<string, string>,
  targetAgents: AgentType[]
): Promise<void> {
  for (const agent of targetAgents) {
    switch (agent) {
      case 'claude':
        await installSkillToClaude(skillName, skillContent);
        break;
      case 'codex':
        await installSkillToCodex(skillName, skillContent);
        break;
      case 'shared':
        // 共有ディレクトリにインストールして他エージェントと共有
        const { installSkillToClaude: installToShared } = await import('./claude');
        // 一時的にClaudeのディレクトリにインストールしてから共有
        await installToShared(skillName, skillContent);
        await shareSkill(skillName, 'claude', targetAgents.filter(a => a !== 'shared'));
        break;
    }
  }
}

export { shareSkill, unshareSkill } from '@/lib/fs/symlink';
