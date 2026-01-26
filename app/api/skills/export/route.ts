import { NextRequest, NextResponse } from 'next/server';
import { getAllSkills, getSkillsByAgent } from '@/lib/agents';
import { AgentType } from '@/types';
import JSZip from 'jszip';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/skills/export - スキルをZIPでエクスポート
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agent = searchParams.get('agent') as AgentType | null;
    const skillIds = searchParams.get('skills')?.split(',') || [];

    let skills = agent ? await getSkillsByAgent(agent) : await getAllSkills();

    // 特定のスキルのみをエクスポートする場合
    if (skillIds.length > 0) {
      skills = skills.filter(s => skillIds.includes(s.id));
    }

    const zip = new JSZip();

    for (const skill of skills) {
      const skillName = skill.id.split('@')[0];
      let skillPath = skill.path;

      // シンボリックリンクの場合は実際のパスを解決
      if (skill.isSymlink) {
        try {
          skillPath = await fs.realpath(skill.path);
        } catch {
          continue;
        }
      }

      // スキルディレクトリの内容をZIPに追加
      await addDirToZip(zip, skillPath, skillName);
    }

    const zipContent = await zip.generateAsync({ type: 'blob' });

    return new Response(zipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="skills-export-${Date.now()}.zip"`,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

async function addDirToZip(zip: JSZip, dirPath: string, zipPath: string): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const entryZipPath = `${zipPath}/${entry.name}`;

      if (entry.isDirectory()) {
        await addDirToZip(zip, fullPath, entryZipPath);
      } else {
        const content = await fs.readFile(fullPath);
        zip.file(entryZipPath, content);
      }
    }
  } catch {
    // ディレクトリの読み取りに失敗
  }
}
