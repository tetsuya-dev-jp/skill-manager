'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'DASHBOARD' },
  { href: '/skills', label: 'SKILLS' },
];

export function Topbar() {
  const pathname = usePathname();

  return (
    <header className="relative border-b-[4px] border-foreground bg-background noise-overlay overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 right-10 h-20 w-48 bg-[var(--accent)]/15 rotate-[-6deg]" />
        <div className="absolute bottom-0 left-0 h-[6px] w-32 bg-[var(--accent)]" />
        <div className="absolute top-0 left-0 h-full w-[3px] bg-foreground" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Link
            href="/"
            aria-label="Go to dashboard"
            className="leading-none transition-opacity hover:opacity-80"
          >
            <div className="text-brutal-display text-3xl tracking-wide md:hidden">
              SKILL <span className="text-[var(--accent)]">MANAGER</span>
            </div>
            <div className="hidden md:block">
              <div className="text-brutal-display text-4xl tracking-wide">
                SKILL
              </div>
              <div className="text-brutal-display text-4xl tracking-wide text-[var(--accent)] -mt-2">
                MANAGER
              </div>
            </div>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            <span className="h-2 w-2 bg-[var(--accent)] animate-pulse" />
            System active
          </div>
          <nav className="flex flex-wrap">
            {navItems.map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-5 py-3 tracking-widest text-[11px] transition-all border-[3px] border-foreground uppercase font-bold',
                    idx > 0 && '-ml-[3px]',
                    isActive
                      ? 'bg-foreground text-background z-10'
                      : 'bg-background text-foreground hover:bg-muted'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
