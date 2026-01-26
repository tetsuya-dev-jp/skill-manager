'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-10 h-10 brutal-border flex items-center justify-center">
        <div className="w-4 h-4 bg-muted animate-pulse" />
      </button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'w-10 h-10 brutal-border flex items-center justify-center transition-all',
        'hover:bg-muted'
      )}
      title={isDark ? 'Switch to light' : 'Switch to dark'}
    >
      <div className={cn(
        'w-4 h-4 transition-all',
        isDark ? 'bg-transparent border-2 border-current' : 'bg-current'
      )} />
    </button>
  );
}
