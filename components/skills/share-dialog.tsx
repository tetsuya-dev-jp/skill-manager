'use client';

import { useState } from 'react';
import { Skill, AgentType } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ShareDialogProps {
  skill: Skill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ skill, open, onOpenChange }: ShareDialogProps) {
  const queryClient = useQueryClient();
  const [selectedAgents, setSelectedAgents] = useState<AgentType[]>([]);

  const shareMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/skills/${skill?.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetAgents: selectedAgents }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast.success('SHARED');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('SHARE FAILED');
    },
  });

  if (!skill) return null;

  const allAgents: { id: AgentType; name: string }[] = [
    { id: 'claude', name: 'CLAUDE CODE' },
    { id: 'codex', name: 'CLINE/CODEX' },
  ];
  const agents = allAgents.filter(a => a.id !== skill.agent);

  const handleAgentToggle = (agentId: AgentType) => {
    if (selectedAgents.includes(agentId)) {
      setSelectedAgents(selectedAgents.filter(a => a !== agentId));
    } else {
      setSelectedAgents([...selectedAgents, agentId]);
    }
  };

  const handleShare = () => {
    if (selectedAgents.length === 0) {
      toast.error('SELECT TARGET AGENT');
      return;
    }
    shareMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="brutal-border-thick brutal-shadow-lg p-0">
        <DialogHeader className="p-6 border-b-2 border-foreground">
          <DialogTitle className="font-black uppercase tracking-tight">
            Share Skill
          </DialogTitle>
          <DialogDescription className="font-mono text-sm">
            Share "{skill.name}" with other agents via symlink.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <p className="text-xs font-bold uppercase mb-3">
            Select target agents:
          </p>
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => handleAgentToggle(agent.id)}
              className={cn(
                'w-full flex items-center justify-between p-4 brutal-border transition-all',
                selectedAgents.includes(agent.id)
                  ? 'bg-foreground text-background brutal-shadow'
                  : 'hover:bg-muted'
              )}
            >
              <span className="font-bold uppercase">{agent.name}</span>
              <span className="text-lg">
                {selectedAgents.includes(agent.id) ? '✓' : '○'}
              </span>
            </button>
          ))}
        </div>

        <DialogFooter className="p-6 border-t-2 border-foreground flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="brutal-border font-bold uppercase"
          >
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={shareMutation.isPending || selectedAgents.length === 0}
            className="brutal-border-thick brutal-shadow font-bold uppercase"
          >
            {shareMutation.isPending ? 'SHARING...' : '→ SHARE'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
