import { NextRequest, NextResponse } from 'next/server';
import { getAllSkills, deleteSkill } from '@/lib/agents';
import { ApiResponse, Skill } from '@/types';

// GET /api/skills/[id] - スキル詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const skills = await getAllSkills();
    const skill = skills.find(s => s.id === id);

    if (!skill) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Skill not found',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<Skill>>({
      success: true,
      data: skill,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// DELETE /api/skills/[id] - スキル削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const skills = await getAllSkills();
    const skill = skills.find(s => s.id === id);

    if (!skill) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Skill not found',
      }, { status: 404 });
    }

    // スキル名を取得（id形式: name@agent）
    const skillName = id.split('@')[0];
    await deleteSkill(skillName, skill.agent);

    return NextResponse.json<ApiResponse<{ deleted: string }>>({
      success: true,
      data: { deleted: id },
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
