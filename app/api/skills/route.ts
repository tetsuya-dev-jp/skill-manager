import { NextRequest, NextResponse } from 'next/server';
import { getAllSkills, getSkillsByAgent, installSkill } from '@/lib/agents';
import { AgentType, ApiResponse, Skill } from '@/types';
import JSZip from 'jszip';
import path from 'path';
import os from 'os';
import { promises as fs } from 'fs';

// GET /api/skills - スキル一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agent = searchParams.get('agent') as AgentType | null;

    let skills: Skill[];
    if (agent) {
      skills = await getSkillsByAgent(agent);
    } else {
      skills = await getAllSkills();
    }

    return NextResponse.json<ApiResponse<Skill[]>>({
      success: true,
      data: skills,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// POST /api/skills - スキルインポート（ZIPファイル）
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const targetAgentsStr = formData.get('targetAgents') as string | null;

    if (!file) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'No file provided',
      }, { status: 400 });
    }

    const targetAgents: AgentType[] = targetAgentsStr
      ? JSON.parse(targetAgentsStr)
      : ['claude'];

    const buffer = await file.arrayBuffer();
    const zip = new JSZip();
    const contents = await zip.loadAsync(buffer);

    // ZIPファイルからスキルを抽出
    const skillFiles: Record<string, Record<string, string>> = {};

    for (const [filePath, zipEntry] of Object.entries(contents.files)) {
      if (zipEntry.dir) continue;

      const parts = filePath.split('/');
      // 最初のディレクトリ名をスキル名として使用
      const skillName = parts[0];
      const relativePath = parts.slice(1).join('/');

      if (!skillName || !relativePath) continue;

      if (!skillFiles[skillName]) {
        skillFiles[skillName] = {};
      }

      const content = await zipEntry.async('string');
      skillFiles[skillName][relativePath] = content;
    }

    // 各スキルをインストール
    const installedSkills: string[] = [];
    for (const [skillName, files] of Object.entries(skillFiles)) {
      await installSkill(skillName, files, targetAgents);
      installedSkills.push(skillName);
    }

    return NextResponse.json<ApiResponse<{ installed: string[] }>>({
      success: true,
      data: { installed: installedSkills },
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
