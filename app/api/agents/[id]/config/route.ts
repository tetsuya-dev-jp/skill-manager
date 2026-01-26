import { NextRequest, NextResponse } from 'next/server';
import { getCodexConfig } from '@/lib/agents/codex';
import { getSkillLock } from '@/lib/fs/symlink';
import { ApiResponse, AgentType } from '@/types';

// GET /api/agents/[id]/config - エージェント設定取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agentType = id as AgentType;

    let config: unknown;

    switch (agentType) {
      case 'claude':
        // Claude Code設定は別途管理されるため、ここでは空を返す
        config = {};
        break;
      case 'codex':
        config = await getCodexConfig();
        break;
      case 'shared':
        config = await getSkillLock();
        break;
      default:
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: 'Unknown agent',
        }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<unknown>>({
      success: true,
      data: config,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
