import { promises as fs } from 'fs';
import path from 'path';
import { Skill, Agent, AgentType } from '@/types';
import { AGENT_SPECS, type AgentId } from '@/lib/agents/specs';
import { getGlobalSkillsPath, SHARED_LOCK_FILE, SHARED_SKILLS_DIR } from '@/lib/agents/paths';
import { parseSkillMd, generateSkillId } from '@/lib/skills/parser';
import { getSharedSkills, deleteSharedSkill, shareSkill } from '@/lib/fs/symlink';

const baseAgents: Agent[] = AGENT_SPECS.map((spec) => ({
  id: spec.id,
  name: spec.name,
  skillsPath: getGlobalSkillsPath(spec.id),
  enabled: true,
}));

export const agents: Agent[] = [
  ...baseAgents,
  {
    id: 'shared',
    name: 'Shared',
    skillsPath: SHARED_SKILLS_DIR,
    configPath: SHARED_LOCK_FILE,
    enabled: true,
  },
];

async function isAgentEnabled(agent: Agent): Promise<boolean> {
  try {
    await fs.access(agent.skillsPath);
    return true;
  } catch {
    return false;
  }
}

export async function getAgents(): Promise<Agent[]> {
  const resolved = await Promise.all(
    agents.map(async (agent) => ({
      ...agent,
      enabled: await isAgentEnabled(agent),
    }))
  );

  return resolved;
}

async function getSkillsFromDir(agent: Agent): Promise<Skill[]> {
  const skills: Skill[] = [];

  try {
    const entries = await fs.readdir(agent.skillsPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;

      const skillPath = path.join(agent.skillsPath, entry.name);

      try {
        const stat = await fs.lstat(skillPath);
        const isSymlink = stat.isSymbolicLink();

        let realPath = skillPath;
        if (isSymlink) {
          realPath = await fs.realpath(skillPath);
        }

        const content = await fs.readFile(path.join(realPath, 'SKILL.md'), 'utf-8');
        const { metadata, content: markdownContent } = parseSkillMd(content);
        const isShared = isSymlink && realPath.includes(SHARED_SKILLS_DIR);

        skills.push({
          id: generateSkillId(entry.name, agent.id),
          name: metadata.name || entry.name,
          description: metadata.description,
          version: metadata.version,
          path: skillPath,
          agent: agent.id,
          isShared,
          isSymlink,
          metadata,
          content: markdownContent,
        });
      } catch {
        continue;
      }
    }
  } catch {
    // skillsディレクトリが存在しない
  }

  return skills;
}

export async function getAllSkills(): Promise<Skill[]> {
  const allAgents = await getAgents();
  const skills: Skill[] = [];

  for (const agent of allAgents) {
    if (agent.id === 'shared') {
      if (agent.enabled) {
        skills.push(...await getSharedSkills());
      }
      continue;
    }

    if (!agent.enabled) continue;

    skills.push(...await getSkillsFromDir(agent));
  }

  return skills;
}

export async function getSkillsByAgent(agentId: AgentType): Promise<Skill[]> {
  if (agentId === 'shared') {
    return getSharedSkills();
  }

  const agent = agents.find((item) => item.id === agentId);
  if (!agent) return [];

  const enabled = await isAgentEnabled(agent);
  if (!enabled) return [];

  return getSkillsFromDir(agent);
}

async function deleteSkillAtPath(skillsPath: string, skillName: string): Promise<void> {
  const skillPath = path.join(skillsPath, skillName);
  const stat = await fs.lstat(skillPath);

  if (stat.isSymbolicLink()) {
    await fs.unlink(skillPath);
  } else {
    await fs.rm(skillPath, { recursive: true, force: true });
  }
}

export async function deleteSkill(skillName: string, agent: AgentType): Promise<void> {
  if (agent === 'shared') {
    await deleteSharedSkill(skillName);
    return;
  }

  await deleteSkillAtPath(getGlobalSkillsPath(agent as AgentId), skillName);
}

async function installSkillToPath(
  skillsPath: string,
  skillName: string,
  skillContent: Record<string, string>
): Promise<void> {
  const skillPath = path.join(skillsPath, skillName);
  await fs.mkdir(skillPath, { recursive: true });

  for (const [filename, content] of Object.entries(skillContent)) {
    const filePath = path.join(skillPath, filename);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content);
  }
}

export async function installSkill(
  skillName: string,
  skillContent: Record<string, string>,
  targetAgents: AgentType[]
): Promise<void> {
  const wantsShared = targetAgents.includes('shared');
  const directAgents = targetAgents.filter((agent) => agent !== 'shared');

  if (wantsShared) {
    await installSkillToPath(SHARED_SKILLS_DIR, skillName, skillContent);
    if (directAgents.length > 0) {
      await shareSkill(skillName, 'shared', directAgents);
    }
    return;
  }

  for (const agent of directAgents) {
    await installSkillToPath(getGlobalSkillsPath(agent as AgentId), skillName, skillContent);
  }
}

export { shareSkill, unshareSkill } from '@/lib/fs/symlink';
