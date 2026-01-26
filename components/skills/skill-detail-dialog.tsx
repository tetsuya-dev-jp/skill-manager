'use client';

import { Skill } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { getAgentLabel } from '@/lib/agents/specs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SkillDetailDialogProps {
  skill: Skill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SkillDetailDialog({ skill, open, onOpenChange }: SkillDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'metadata'>('content');

  if (!skill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col brutal-border-thick brutal-shadow-lg p-0">
        <DialogHeader className="p-6 border-b-2 border-foreground">
          <DialogTitle className="font-black uppercase tracking-tight text-2xl">
            {skill.name}
          </DialogTitle>
          <DialogDescription className="font-mono text-sm">
            {skill.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 px-6 py-3 border-b-2 border-foreground">
          <Badge variant="outline" className="brutal-border font-bold uppercase text-[10px]">
            {getAgentLabel(skill.agent)}
          </Badge>
          <Badge variant="outline" className="brutal-border font-mono text-[10px]">
            v{skill.version}
          </Badge>
          {skill.isShared && (
            <Badge className="bg-foreground text-background font-bold uppercase text-[10px]">
              SHARED
            </Badge>
          )}
        </div>

        <div className="flex border-b-2 border-foreground">
          <button
            onClick={() => setActiveTab('content')}
            className={cn(
              'flex-1 px-4 py-3 font-bold uppercase text-sm transition-colors border-r-2 border-foreground',
              activeTab === 'content'
                ? 'bg-foreground text-background'
                : 'hover:bg-muted'
            )}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={cn(
              'flex-1 px-4 py-3 font-bold uppercase text-sm transition-colors',
              activeTab === 'metadata'
                ? 'bg-foreground text-background'
                : 'hover:bg-muted'
            )}
          >
            Metadata
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'content' ? (
            <div className="bg-muted brutal-border p-4">
              {skill.content ? (
                <div className="space-y-4 text-sm leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ className, ...props }) => (
                        <h1
                          className={cn('text-2xl font-bold tracking-wide', className)}
                          {...props}
                        />
                      ),
                      h2: ({ className, ...props }) => (
                        <h2
                          className={cn('text-xl font-bold tracking-wide', className)}
                          {...props}
                        />
                      ),
                      h3: ({ className, ...props }) => (
                        <h3
                          className={cn('text-lg font-bold tracking-wide', className)}
                          {...props}
                        />
                      ),
                      p: ({ className, ...props }) => (
                        <p className={cn('text-sm', className)} {...props} />
                      ),
                      ul: ({ className, ...props }) => (
                        <ul className={cn('list-disc pl-5 space-y-2', className)} {...props} />
                      ),
                      ol: ({ className, ...props }) => (
                        <ol className={cn('list-decimal pl-5 space-y-2', className)} {...props} />
                      ),
                      li: ({ className, ...props }) => (
                        <li className={cn('text-sm', className)} {...props} />
                      ),
                      a: ({ className, ...props }) => (
                        <a
                          className={cn('text-[var(--accent)] underline', className)}
                          {...props}
                        />
                      ),
                      blockquote: ({ className, ...props }) => (
                        <blockquote
                          className={cn('border-l-2 border-foreground pl-4 italic', className)}
                          {...props}
                        />
                      ),
                      code: ({ inline, className, ...props }) => (
                        <code
                          className={cn(
                            inline
                              ? 'font-mono text-xs bg-background px-1.5 py-0.5'
                              : 'font-mono text-xs',
                            className
                          )}
                          {...props}
                        />
                      ),
                      pre: ({ className, ...props }) => (
                        <pre
                          className={cn(
                            'bg-background brutal-border p-3 overflow-x-auto text-xs font-mono',
                            className
                          )}
                          {...props}
                        />
                      ),
                    }}
                  >
                    {skill.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm font-mono text-muted-foreground">NO CONTENT</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase mb-2">Path</h4>
                <code className="text-xs font-mono bg-muted brutal-border px-3 py-2 block">
                  {skill.path}
                </code>
              </div>
              {skill.metadata.license && (
                <div>
                  <h4 className="text-xs font-bold uppercase mb-2">License</h4>
                  <p className="text-sm font-mono">{skill.metadata.license}</p>
                </div>
              )}
              {skill.metadata.author && (
                <div>
                  <h4 className="text-xs font-bold uppercase mb-2">Author</h4>
                  <p className="text-sm font-mono">{skill.metadata.author}</p>
                </div>
              )}
              {skill.metadata.tags && skill.metadata.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {skill.metadata.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="brutal-border text-[10px] font-mono">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
