import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { Skill, CodexConfig, Agent } from '@/types';
import { parseSkillMd, generateSkillId } from '@/lib/skills/parser';

const CODEX_DIR = path.join(os.homedir(), '.codex');
const SKILLS_DIR = path.join(CODEX_DIR, 'skills');
const CONFIG_FILE = path.join(CODEX_DIR, 'config.toml');

export const codexAgent: Agent = {
  id: 'codex',
  name: 'Cline/Codex',
  skillsPath: SKILLS_DIR,
  configPath: CONFIG_FILE,
  enabled: true,
};

// 簡易的なTOML解析（必要最小限）
function parseToml(content: string): CodexConfig {
  const config: CodexConfig = {};
  const lines = content.split('\n');
  let currentSection = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // セクションヘッダー
    const sectionMatch = trimmed.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      continue;
    }

    // キー = 値
    const kvMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
    if (kvMatch) {
      const [, key, rawValue] = kvMatch;
      let value: string | boolean = rawValue;

      // 文字列の引用符を除去
      if (rawValue.startsWith('"') && rawValue.endsWith('"')) {
        value = rawValue.slice(1, -1);
      } else if (rawValue === 'true') {
        value = true;
      } else if (rawValue === 'false') {
        value = false;
      }

      if (!currentSection) {
        (config as Record<string, unknown>)[key] = value;
      }
    }
  }

  return config;
}

export async function getCodexConfig(): Promise<CodexConfig> {
  try {
    const content = await fs.readFile(CONFIG_FILE, 'utf-8');
    return parseToml(content);
  } catch {
    return {};
  }
}

export async function getCodexSkills(): Promise<Skill[]> {
  const skills: Skill[] = [];

  try {
    await fs.access(SKILLS_DIR);
  } catch {
    return skills;
  }

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

        const isShared = isSymlink && realPath.includes('.agents/skills');

        skills.push({
          id: generateSkillId(entry.name, 'codex'),
          name: metadata.name || entry.name,
          description: metadata.description,
          version: metadata.version,
          path: skillPath,
          agent: 'codex',
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

export async function deleteCodexSkill(skillName: string): Promise<void> {
  const skillPath = path.join(SKILLS_DIR, skillName);
  const stat = await fs.lstat(skillPath);

  if (stat.isSymbolicLink()) {
    await fs.unlink(skillPath);
  } else {
    await fs.rm(skillPath, { recursive: true, force: true });
  }
}

export async function installSkillToCodex(
  skillName: string,
  skillContent: Record<string, string>
): Promise<void> {
  await fs.mkdir(SKILLS_DIR, { recursive: true });
  const skillPath = path.join(SKILLS_DIR, skillName);
  await fs.mkdir(skillPath, { recursive: true });

  for (const [filename, content] of Object.entries(skillContent)) {
    const filePath = path.join(skillPath, filename);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content);
  }
}
