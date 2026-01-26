import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { Skill, Agent } from '@/types';
import { parseSkillMd, generateSkillId } from '@/lib/skills/parser';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const SKILLS_DIR = path.join(CLAUDE_DIR, 'skills');
const SETTINGS_FILE = path.join(CLAUDE_DIR, 'settings.json');

export const claudeAgent: Agent = {
  id: 'claude',
  name: 'Claude Code',
  skillsPath: SKILLS_DIR,
  configPath: SETTINGS_FILE,
  enabled: true,
};

export async function getClaudeSkills(): Promise<Skill[]> {
  const skills: Skill[] = [];

  try {
    const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;

      const skillPath = path.join(SKILLS_DIR, entry.name);

      try {
        const stat = await fs.lstat(skillPath);
        const isSymlink = stat.isSymbolicLink();

        let realPath = skillPath;
        if (isSymlink) {
          realPath = await fs.realpath(skillPath);
        }

        const content = await fs.readFile(path.join(realPath, 'SKILL.md'), 'utf-8');
        const { metadata, content: markdownContent } = parseSkillMd(content);

        // 共有スキルかどうかの判定（シンボリックリンクで.agents/skillsを指している場合）
        const isShared = isSymlink && realPath.includes('.agents/skills');

        skills.push({
          id: generateSkillId(entry.name, 'claude'),
          name: metadata.name || entry.name,
          description: metadata.description,
          version: metadata.version,
          path: skillPath,
          agent: 'claude',
          isShared,
          isSymlink,
          metadata,
          content: markdownContent,
        });
      } catch {
        // SKILL.mdが存在しない場合はスキップ
        continue;
      }
    }
  } catch {
    // skillsディレクトリが存在しない
  }

  return skills;
}

export async function deleteClaudeSkill(skillName: string): Promise<void> {
  const skillPath = path.join(SKILLS_DIR, skillName);
  const stat = await fs.lstat(skillPath);

  if (stat.isSymbolicLink()) {
    await fs.unlink(skillPath);
  } else {
    await fs.rm(skillPath, { recursive: true, force: true });
  }
}

export async function installSkillToClaude(
  skillName: string,
  skillContent: Record<string, string>
): Promise<void> {
  const skillPath = path.join(SKILLS_DIR, skillName);
  await fs.mkdir(skillPath, { recursive: true });

  for (const [filename, content] of Object.entries(skillContent)) {
    const filePath = path.join(skillPath, filename);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content);
  }
}
