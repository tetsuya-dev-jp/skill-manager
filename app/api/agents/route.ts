import { NextResponse } from 'next/server';
import { agents, getAllSkills } from '@/lib/agents';
import { ApiResponse, Agent } from '@/types';

// GET /api/agents - エージェント一覧取得
export async function GET() {
  try {
    const skills = await getAllSkills();

    // 各エージェントのスキル数を計算
    const agentsWithCount = agents.map(agent => ({
      ...agent,
      skillCount: skills.filter(s => s.agent === agent.id).length,
    }));

    return NextResponse.json<ApiResponse<(Agent & { skillCount: number })[]>>({
      success: true,
      data: agentsWithCount,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
