import { NextRequest, NextResponse } from 'next/server';
import { getAllSkills, shareSkill, unshareSkill } from '@/lib/agents';
import { AgentType, ApiResponse } from '@/types';

// POST /api/skills/[id]/share - スキル共有
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { targetAgents } = body as { targetAgents: AgentType[] };

    const skills = await getAllSkills();
    const skill = skills.find(s => s.id === id);

    if (!skill) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Skill not found',
      }, { status: 404 });
    }

    const skillName = id.split('@')[0];
    await shareSkill(skillName, skill.agent, targetAgents);

    return NextResponse.json<ApiResponse<{ id: string; sharedWith: AgentType[] }>>({
      success: true,
      data: { id, sharedWith: targetAgents },
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// DELETE /api/skills/[id]/share - 共有解除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const targetAgent = searchParams.get('agent') as AgentType | null;

    if (!targetAgent) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Target agent is required',
      }, { status: 400 });
    }

    const skillName = id.split('@')[0];
    await unshareSkill(skillName, targetAgent);

    return NextResponse.json<ApiResponse<{ id: string; unsharedFrom: AgentType }>>({
      success: true,
      data: { id, unsharedFrom: targetAgent },
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
