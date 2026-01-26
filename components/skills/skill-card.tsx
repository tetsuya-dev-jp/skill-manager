'use client';

import { Skill } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getAgentLabel } from '@/lib/agents/specs';

interface SkillCardProps {
  skill: Skill;
  onViewDetail: (skill: Skill) => void;
  onShare: (skill: Skill) => void;
}

export function SkillCard({ skill, onViewDetail, onShare }: SkillCardProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/skills/${skill.id}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast.success('DELETED');
    },
    onError: () => {
      toast.error('DELETE FAILED');
    },
  });

  const handleDelete = () => {
    if (confirm(`Delete "${skill.name}"?`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className={cn(
      'brutal-border-thick brutal-shadow bg-background transition-all group',
      'hover:brutal-shadow-lg hover:-translate-y-1'
    )}>
      {/* Accent bar for shared skills */}
      {skill.isShared && (
        <div className="h-1 bg-[var(--accent)]" />
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold uppercase tracking-wide truncate group-hover:text-[var(--accent)] transition-colors">
              {skill.name}
            </h3>
            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-2 tracking-wider leading-relaxed">
              {skill.description || 'No description'}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 brutal-border opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ≡
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="brutal-border brutal-shadow">
              <DropdownMenuItem
                onClick={() => onViewDetail(skill)}
                className="text-[11px] tracking-wider cursor-pointer"
              >
                → VIEW DETAIL
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onShare(skill)}
                className="text-[11px] tracking-wider cursor-pointer"
              >
                ↗ SHARE
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-foreground h-[2px]" />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-[11px] tracking-wider text-destructive cursor-pointer"
              >
                ✕ DELETE
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border-t-2 border-foreground p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={cn(
              'brutal-border text-[9px] tracking-wider',
              skill.agent === 'claude-code' && 'bg-foreground text-background',
              skill.agent === 'codex' && 'bg-[var(--accent)] text-white border-[var(--accent)]',
              skill.agent === 'shared' && ''
            )}
          >
            {getAgentLabel(skill.agent)}
          </Badge>
          {skill.isShared && (
            <Badge className="bg-[var(--accent)] text-white text-[9px] tracking-wider">
              SHARED
            </Badge>
          )}
          {skill.isSymlink && (
            <Badge variant="outline" className="brutal-border text-[9px] tracking-wider">
              LINK
            </Badge>
          )}
        </div>
        <span className="text-[9px] text-muted-foreground tracking-widest">
          v{skill.version}
        </span>
      </div>
    </div>
  );
}
