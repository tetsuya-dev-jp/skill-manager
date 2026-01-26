'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { SkillCard } from '@/components/skills/skill-card';
import { SkillDetailDialog } from '@/components/skills/skill-detail-dialog';
import { ShareDialog } from '@/components/skills/share-dialog';
import { ApiResponse, Skill, AgentType } from '@/types';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

type FilterType = 'all' | AgentType;

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'ALL' },
  { value: 'claude', label: 'CLAUDE' },
  { value: 'codex', label: 'CODEX' },
  { value: 'shared', label: 'SHARED' },
];

export default function SkillsPage() {
  const searchParams = useSearchParams();
  const paramFilter = searchParams.get('agent');
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!paramFilter) return;
    const isValidFilter = filterOptions.some((option) => option.value === paramFilter);
    if (isValidFilter) {
      setFilter(paramFilter as FilterType);
    }
  }, [paramFilter]);

  const { data: skillsRes, isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const res = await fetch('/api/skills');
      return res.json() as Promise<ApiResponse<Skill[]>>;
    },
  });

  const skills = skillsRes?.data || [];

  const filteredSkills = skills.filter((skill) => {
    const matchesFilter = filter === 'all' || skill.agent === filter;
    const matchesSearch =
      search === '' ||
      skill.name.toLowerCase().includes(search.toLowerCase()) ||
      skill.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleViewDetail = (skill: Skill) => {
    setSelectedSkill(skill);
    setDetailOpen(true);
  };

  const handleShare = (skill: Skill) => {
    setSelectedSkill(skill);
    setShareOpen(true);
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (filter !== 'all') {
      params.set('agent', filter);
    }
    window.open(`/api/skills/export?${params.toString()}`, '_blank');
  };

  if (isLoading) {
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
    <div className="space-y-8 noise-overlay">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-brutal-display text-6xl md:text-7xl tracking-wide animate-slide-up">
            SKILLS
          </h1>
          <p className="text-[11px] text-muted-foreground tracking-widest mt-2 animate-slide-up stagger-1">
            {filteredSkills.length} OF {skills.length} SKILLS
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="min-w-[190px] flex items-center justify-between gap-4 p-4 brutal-border transition-all text-[11px] uppercase font-bold hover:bg-muted animate-slide-up stagger-2"
        >
          <span>EXPORT</span>
          <span className="text-lg">↓</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-slide-up stagger-3">
        <div className="relative">
          <Input
            placeholder="SEARCH..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-64 brutal-border-thick tracking-widest text-[11px] h-12 pl-4 placeholder:tracking-widest"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex">
          {filterOptions.map((option, idx) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={cn(
                'px-5 py-3 tracking-widest text-[11px] transition-all border-[3px] border-foreground',
                idx > 0 && '-ml-[3px]',
                filter === option.value
                  ? 'bg-foreground text-background z-10'
                  : 'bg-background text-foreground hover:bg-muted'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="text-center py-20 brutal-border-thick animate-slide-up stagger-4">
          <div className="text-brutal-display text-4xl mb-2">NO RESULTS</div>
          <p className="text-[11px] text-muted-foreground tracking-widest">
            TRY A DIFFERENT SEARCH OR FILTER
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((skill, idx) => (
            <div
              key={skill.id}
              className={cn(
                'animate-slide-up',
                `stagger-${Math.min(idx % 5 + 1, 5)}`
              )}
            >
              <SkillCard
                skill={skill}
                onViewDetail={handleViewDetail}
                onShare={handleShare}
              />
            </div>
          ))}
        </div>
      )}

      <SkillDetailDialog
        skill={selectedSkill}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <ShareDialog
        skill={selectedSkill}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </div>
  );
}
