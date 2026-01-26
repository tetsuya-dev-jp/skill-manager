import matter from 'gray-matter';
import { SkillMetadata } from '@/types';

export function parseSkillMd(content: string): { metadata: SkillMetadata; content: string } {
  const { data, content: markdownContent } = matter(content);

  const metadata: SkillMetadata = {
    name: data.name || 'unknown',
    description: data.description || '',
    version: data.version || '1.0.0',
    license: data.license,
    author: data.author,
    tags: parseTagsField(data.metadata?.tags || data.tags),
  };

  return { metadata, content: markdownContent.trim() };
}

function parseTagsField(tags: unknown): string[] | undefined {
  if (!tags) return undefined;
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  return undefined;
}

export function serializeSkillMd(metadata: SkillMetadata, content: string): string {
  const frontmatter: Record<string, unknown> = {
    name: metadata.name,
    description: metadata.description,
    version: metadata.version,
  };

  if (metadata.license) frontmatter.license = metadata.license;
  if (metadata.author) frontmatter.author = metadata.author;
  if (metadata.tags && metadata.tags.length > 0) {
    frontmatter.metadata = { tags: metadata.tags.join(', ') };
  }

  return matter.stringify(content, frontmatter);
}

export function generateSkillId(name: string, agent: string): string {
  return `${name}@${agent}`;
}
