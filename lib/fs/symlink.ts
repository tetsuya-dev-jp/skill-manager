import { promises as fs } from 'fs';
import path from 'path';
import { Skill, SkillLock, AgentType } from '@/types';
import { AGENT_SPECS, type AgentId } from '@/lib/agents/specs';
import { getGlobalSkillsPath, SHARED_LOCK_FILE, SHARED_SKILLS_DIR } from '@/lib/agents/paths';
import { parseSkillMd, generateSkillId } from '@/lib/skills/parser';

const AGENT_PATHS = AGENT_SPECS.reduce((acc, spec) => {
  acc[spec.id] = getGlobalSkillsPath(spec.id);
  return acc;
}, {} as Record<AgentId, string>);

const AGENT_PATHS_WITH_SHARED: Record<AgentType, string> = {
  ...AGENT_PATHS,
  shared: SHARED_SKILLS_DIR,
};

const KNOWN_AGENT_IDS = new Set<AgentType>([
  ...AGENT_SPECS.map((spec) => spec.id),
  'shared',
]);

function normalizeAgentId(value: string): AgentType | null {
  if (value === 'claude') return 'claude-code';
  if (KNOWN_AGENT_IDS.has(value as AgentType)) return value as AgentType;
  return null;
}

export async function ensureSharedDir(): Promise<void> {
  await fs.mkdir(SHARED_SKILLS_DIR, { recursive: true });
}

export async function getSkillLock(): Promise<SkillLock> {
  try {
    const content = await fs.readFile(SHARED_LOCK_FILE, 'utf-8');
    const parsed = JSON.parse(content) as SkillLock;
    const normalized: SkillLock = { version: parsed.version || '1.0.0', skills: {} };

    for (const [skillName, data] of Object.entries(parsed.skills || {})) {
      const source = normalizeAgentId(String(data.source));
      if (!source) continue;

      const sharedWith = Array.isArray(data.sharedWith)
        ? data.sharedWith
            .map((agent) => normalizeAgentId(String(agent)))
            .filter((agent): agent is AgentType => Boolean(agent))
        : [];

      normalized.skills[skillName] = {
        source,
        sharedWith,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    }

    return normalized;
  } catch {
    return { version: '1.0.0', skills: {} };
  }
}

export async function saveSkillLock(lock: SkillLock): Promise<void> {
  await fs.mkdir(path.dirname(SHARED_LOCK_FILE), { recursive: true });
  await fs.writeFile(SHARED_LOCK_FILE, JSON.stringify(lock, null, 2));
}

export async function getSharedSkills(): Promise<Skill[]> {
  const skills: Skill[] = [];

  try {
    await fs.access(SHARED_SKILLS_DIR);
  } catch {
    return skills;
  }

  try {
    const entries = await fs.readdir(SHARED_SKILLS_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const skillPath = path.join(SHARED_SKILLS_DIR, entry.name);

      try {
        const content = await fs.readFile(path.join(skillPath, 'SKILL.md'), 'utf-8');
        const { metadata, content: markdownContent } = parseSkillMd(content);

        skills.push({
          id: generateSkillId(entry.name, 'shared'),
          name: metadata.name || entry.name,
          description: metadata.description,
          version: metadata.version,
          path: skillPath,
          agent: 'shared',
          isShared: true,
          isSymlink: false,
          metadata,
          content: markdownContent,
        });
      } catch {
        continue;
      }
    }
  } catch {
    // ディレクトリが存在しない
  }

  return skills;
}

export async function shareSkill(
  skillName: string,
  sourceAgent: AgentType,
  targetAgents: AgentType[]
): Promise<void> {
  await ensureSharedDir();

  const sourcePath = path.join(AGENT_PATHS_WITH_SHARED[sourceAgent], skillName);
  const sharedPath = path.join(SHARED_SKILLS_DIR, skillName);

  // ソースが共有ディレクトリでない場合、まず共有ディレクトリにコピー
  if (sourceAgent !== 'shared') {
    const stat = await fs.lstat(sourcePath);
    if (stat.isSymbolicLink()) {
      // 既にシンボリックリンクの場合、リンク先を共有ディレクトリとして使用
      const realPath = await fs.realpath(sourcePath);
      if (!realPath.includes('.agents/skills')) {
        // 共有ディレクトリ外を指している場合はコピー
        await copyDir(realPath, sharedPath);
      }
    } else {
      // 通常ディレクトリの場合は移動
      await copyDir(sourcePath, sharedPath);
      await fs.rm(sourcePath, { recursive: true, force: true });
      // 元の場所にシンボリックリンクを作成
      const relativePath = path.relative(AGENT_PATHS_WITH_SHARED[sourceAgent], sharedPath);
      await fs.symlink(relativePath, sourcePath);
    }
  }

  // 各ターゲットエージェントにシンボリックリンクを作成
  for (const targetAgent of targetAgents) {
    if (targetAgent === 'shared' || targetAgent === sourceAgent) continue;

    const targetPath = path.join(AGENT_PATHS_WITH_SHARED[targetAgent], skillName);

    try {
      await fs.access(targetPath);
      // 既に存在する場合は削除
      const stat = await fs.lstat(targetPath);
      if (stat.isSymbolicLink()) {
        await fs.unlink(targetPath);
      } else {
        continue; // 実ディレクトリがある場合はスキップ
      }
    } catch {
      // 存在しない - OK
    }

    await fs.mkdir(AGENT_PATHS_WITH_SHARED[targetAgent], { recursive: true });
    const relativePath = path.relative(AGENT_PATHS_WITH_SHARED[targetAgent], sharedPath);
    await fs.symlink(relativePath, targetPath);
  }

  // ロックファイルを更新
  const lock = await getSkillLock();
  lock.skills[skillName] = {
    source: sourceAgent === 'shared' ? 'shared' : sourceAgent,
    sharedWith: targetAgents.filter(a => a !== 'shared'),
    createdAt: lock.skills[skillName]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveSkillLock(lock);
}

export async function unshareSkill(skillName: string, targetAgent: AgentType): Promise<void> {
  const targetPath = path.join(AGENT_PATHS_WITH_SHARED[targetAgent], skillName);

  try {
    const stat = await fs.lstat(targetPath);
    if (stat.isSymbolicLink()) {
      await fs.unlink(targetPath);
    }
  } catch {
    // 存在しない
  }

  // ロックファイルを更新
  const lock = await getSkillLock();
  if (lock.skills[skillName]) {
    lock.skills[skillName].sharedWith = lock.skills[skillName].sharedWith.filter(
      a => a !== targetAgent
    );
    lock.skills[skillName].updatedAt = new Date().toISOString();
    await saveSkillLock(lock);
  }
}

async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

export async function deleteSharedSkill(skillName: string): Promise<void> {
  // すべてのエージェントからシンボリックリンクを削除
  for (const [agent, agentPath] of Object.entries(AGENT_PATHS_WITH_SHARED)) {
    if (agent === 'shared') continue;
    const linkPath = path.join(agentPath, skillName);
    try {
      const stat = await fs.lstat(linkPath);
      if (stat.isSymbolicLink()) {
        const realPath = await fs.realpath(linkPath);
        if (realPath.includes('.agents/skills')) {
          await fs.unlink(linkPath);
        }
      }
    } catch {
      // 存在しない
    }
  }

  // 共有ディレクトリから削除
  const sharedPath = path.join(SHARED_SKILLS_DIR, skillName);
  await fs.rm(sharedPath, { recursive: true, force: true });

  // ロックファイルから削除
  const lock = await getSkillLock();
  delete lock.skills[skillName];
  await saveSkillLock(lock);
}
