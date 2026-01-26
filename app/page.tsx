'use client';

import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ApiResponse, Skill, Agent } from '@/types';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { data: skillsRes, isLoading: skillsLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const res = await fetch('/api/skills');
      return res.json() as Promise<ApiResponse<Skill[]>>;
    },
  });

  const { data: agentsRes, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await fetch('/api/agents');
      return res.json() as Promise<ApiResponse<(Agent & { skillCount: number })[]>>;
    },
  });

  const skills = skillsRes?.data || [];
  const agents = agentsRes?.data || [];

  const recentSkills = [...skills]
    .sort((a, b) => b.name.localeCompare(a.name))
    .slice(0, 5);

  const sharedCount = skills.filter(s => s.isShared).length;
  const handleExport = () => {
    window.open('/api/skills/export', '_blank');
  };

  if (skillsLoading || agentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[var(--accent)] animate-pulse" />
          <span className="text-sm tracking-widest uppercase">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 noise-overlay">
      {/* Hero Header */}
      <div className="relative">
        <h1 className="text-brutal-display text-7xl md:text-8xl tracking-wide animate-slide-up">
          DASH
        </h1>
        <h1 className="text-brutal-display text-7xl md:text-8xl tracking-wide text-[var(--accent)] -mt-4 animate-slide-up stagger-1">
          BOARD
        </h1>
        <div className="absolute right-0 top-0 text-[10px] tracking-widest text-muted-foreground animate-slide-up stagger-2">
          CONTROL CENTER<br/>
          <span className="text-[var(--accent)]">SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Stats Grid - Asymmetric */}
      <div className="grid grid-cols-12 gap-4 animate-slide-up stagger-3">
        {/* Large stat */}
        <div className="col-span-5 brutal-border-thick brutal-shadow p-8 bg-background relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)] opacity-10 transform rotate-45 translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-500" />
          <p className="text-[10px] tracking-widest text-muted-foreground uppercase">Total Skills</p>
          <p className="text-brutal-display text-8xl mt-2">{skills.length}</p>
        </div>

        {/* Medium stat with accent */}
        <div className="col-span-4 brutal-border-thick brutal-shadow-accent p-8 bg-[var(--accent)] text-white relative">
          <p className="text-[10px] tracking-widest opacity-70 uppercase">Shared</p>
          <p className="text-brutal-display text-7xl mt-2">{sharedCount}</p>
          <div className="absolute bottom-4 right-4 text-6xl opacity-20">↗</div>
        </div>

        {/* Small stat */}
        <div className="col-span-3 brutal-border-thick brutal-shadow p-8 bg-background flex flex-col justify-between">
          <p className="text-[10px] tracking-widest text-muted-foreground uppercase">Agents</p>
          <p className="text-brutal-display text-6xl">{agents.length}</p>
        </div>
      </div>

      {/* Agents Section */}
      <div className="animate-slide-up stagger-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-8 h-[3px] bg-[var(--accent)]" />
          <h2 className="text-brutal-display text-3xl tracking-wide">AGENTS</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {agents.map((agent, idx) => (
            <div
              key={agent.id}
              className={cn(
                'brutal-border-thick brutal-shadow-hover p-6 bg-background transition-all'
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-12 h-12 brutal-border flex items-center justify-center text-2xl',
                  agent.id === 'claude' && 'bg-foreground text-background',
                  agent.id === 'codex' && 'bg-[var(--accent)] text-white',
                  agent.id === 'shared' && 'diagonal-stripe'
                )}>
                  {agent.id === 'claude' && '▲'}
                  {agent.id === 'codex' && '■'}
                  {agent.id === 'shared' && '●'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold uppercase tracking-wide">{agent.name}</h3>
                  <p className="text-[9px] text-muted-foreground truncate tracking-wider">
                    {agent.skillsPath}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-foreground flex items-baseline gap-2">
                <span className="text-brutal-display text-5xl">{agent.skillCount}</span>
                <span className="text-[10px] text-muted-foreground tracking-widest">SKILLS</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills List */}
      <div className="brutal-border-thick brutal-shadow-lg animate-slide-up stagger-5">
        <div className="border-b-[3px] border-foreground p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-[var(--accent)]" />
            <h2 className="text-brutal-display text-2xl tracking-wide">RECENT SKILLS</h2>
          </div>
          <span className="text-[10px] tracking-widest text-muted-foreground">
            {recentSkills.length} OF {skills.length}
          </span>
        </div>

        <div className="divide-y-2 divide-foreground">
          {recentSkills.map((skill, idx) => (
            <div
              key={skill.id}
              className="flex items-center justify-between p-5 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-muted-foreground w-6">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="font-bold uppercase tracking-wide group-hover:text-[var(--accent)] transition-colors">
                    {skill.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-md tracking-wider">
                    {skill.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {skill.isShared && (
                  <Badge className="bg-[var(--accent)] text-white text-[9px] tracking-wider">
                    SHARED
                  </Badge>
                )}
                <Badge variant="outline" className="brutal-border text-[9px] tracking-wider">
                  {skill.agent.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t-[3px] border-foreground p-4">
          <Link
            href="/skills"
            className="inline-flex items-center gap-2 text-sm tracking-wider hover:text-[var(--accent)] transition-colors group"
          >
            <span>VIEW ALL SKILLS</span>
            <span className="group-hover:translate-x-2 transition-transform">→</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-8 h-[3px] bg-foreground" />
          <h2 className="text-brutal-display text-3xl tracking-wide">QUICK ACTIONS</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/skills" className="group">
            <div className="brutal-border-thick brutal-shadow-hover p-6 bg-background transition-all h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-foreground text-background flex items-center justify-center text-xl">
                  ◈
                </div>
                <h3 className="text-brutal-display text-2xl">MANAGE</h3>
              </div>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
                Browse, edit, and share skills
              </p>
            </div>
          </Link>

          <Link href="/skills?agent=shared" className="group">
            <div className="brutal-border-thick brutal-shadow-hover p-6 bg-muted transition-all h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-foreground text-background flex items-center justify-center text-xl">
                  ⇄
                </div>
                <h3 className="text-brutal-display text-2xl">SHARED</h3>
              </div>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
                Jump to shared skills across agents
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleExport}
            className="group text-left w-full"
          >
            <div className="brutal-border-thick brutal-shadow-accent brutal-shadow-accent-hover p-6 bg-[var(--accent)] text-white transition-all h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white text-[var(--accent)] flex items-center justify-center text-xl">
                  ↓
                </div>
                <h3 className="text-brutal-display text-2xl">EXPORT</h3>
              </div>
              <p className="text-[10px] opacity-80 tracking-widest uppercase">
                Download a full skills backup
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
