/**
 * Primary navigation: pages, departments with their skill counts, and the live
 * connection status. The active item's highlight slides between entries.
 */
import { Books, Heartbeat, House, MagnifyingGlass, Moon, Plugs, Sun, type Icon } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router';

import { DepartmentDot } from '@/components/skill/DepartmentMark';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import { shortSha } from '@/lib/format';
import type { LiveState } from '@/lib/live';
import { useCatalog, useHealth } from '@/lib/queries';
import { useTheme } from '@/lib/theme';

export function Sidebar({
  live,
  onSearch,
  onNavigate,
}: {
  live: LiveState;
  onSearch: () => void;
  onNavigate?: () => void;
}) {
  const { data: catalog } = useCatalog();
  const { data: health } = useHealth();
  const [theme, toggleTheme] = useTheme();
  const problems = (health?.counts.error ?? 0) + (health?.counts.warning ?? 0);

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 px-4">
        <img src="/favicon.svg" alt="" className="size-6 rounded-md ring-1 ring-line" />
        <span className="text-[14px] font-semibold tracking-tight text-ink">Ionio Skills</span>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <button
          onClick={onSearch}
          className="flex h-8 w-full items-center gap-2 rounded-md border border-line bg-surface px-2.5 text-[13px] text-ink-3 transition-colors hover:border-line-strong hover:text-ink-2"
        >
          <MagnifyingGlass size={14} />
          <span className="flex-1 text-left">Search</span>
          <Kbd>⌘K</Kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4" onClick={onNavigate}>
        <NavGroup>
          <NavItem to="/" end icon={House} label="Overview" />
          <NavItem to="/skills" end icon={Books} label="All skills" count={catalog?.stats.skills} />
          <NavItem
            to="/health"
            icon={Heartbeat}
            label="Health"
            trailing={
              health &&
              (problems > 0 ? (
                <span className="tabular rounded-full bg-warn-soft px-1.5 text-[11px] leading-4 font-medium text-warn">
                  {problems}
                </span>
              ) : (
                <span className="size-1.5 rounded-full bg-good" aria-label="All checks pass" />
              ))
            }
          />
          <NavItem to="/connect" icon={Plugs} label="Connect" />
        </NavGroup>

        <p className="mt-6 mb-1.5 px-2 text-[11.5px] font-medium text-ink-3">Departments</p>
        <NavGroup>
          {catalog?.departments.map((department) => (
            <NavItem
              key={department.id}
              to={`/departments/${department.id}`}
              leading={<DepartmentDot id={department.id} />}
              label={department.title}
              count={department.skillNames.length}
            />
          ))}
        </NavGroup>
      </nav>

      {/* Footer: live status, repo position, theme */}
      <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3">
        <Tooltip content={LIVE_COPY[live].hint} side="top">
          <div className="flex min-w-0 items-center gap-2 text-[12px] text-ink-3">
            <span className="relative flex size-2">
              {live === 'live' && (
                <span className="absolute inset-0 animate-ping rounded-full bg-good opacity-40" />
              )}
              <span className={cn('relative size-2 rounded-full', LIVE_COPY[live].dot)} />
            </span>
            <span className="truncate">
              {LIVE_COPY[live].label}
              {catalog?.repo.branch && (
                <span className="font-mono text-[11px]">
                  {' · '}
                  {catalog.repo.branch}
                  {catalog.repo.head && `@${shortSha(catalog.repo.head.commit)}`}
                </span>
              )}
            </span>
          </div>
        </Tooltip>
        <Tooltip content={theme === 'dark' ? 'Light theme' : 'Dark theme'}>
          <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

const LIVE_COPY: Record<LiveState, { label: string; dot: string; hint: string }> = {
  live: { label: 'Live', dot: 'bg-good', hint: 'Edits to skill files show up here automatically' },
  connecting: { label: 'Connecting', dot: 'bg-warn', hint: 'Reconnecting to the server' },
  offline: { label: 'Offline', dot: 'bg-bad', hint: 'The server is not reachable' },
  paused: { label: 'Paused', dot: 'bg-ink-3', hint: 'Live updates resume when this tab is visible again' },
};

// ─── Items ──────────────────────────────────────────────────────────────────

const NavGroup = ({ children }: { children: ReactNode }) => (
  <ul className="flex flex-col gap-px">{children}</ul>
);

function NavItem({
  to,
  end,
  icon: IconComponent,
  leading,
  label,
  count,
  trailing,
}: {
  to: string;
  end?: boolean;
  /** A Phosphor icon (filled when active), or any custom `leading` mark. */
  icon?: Icon;
  leading?: ReactNode;
  label: string;
  count?: number;
  trailing?: ReactNode;
}) {
  const { pathname } = useLocation();
  // Skill pages count as being inside their list, not a department.
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <li>
      <NavLink
        to={to}
        end={end}
        className={cn(
          'relative flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors',
          isActive ? 'font-medium text-ink' : 'text-ink-2 hover:bg-surface-2/70 hover:text-ink',
        )}
      >
        {isActive && (
          <motion.span
            layoutId="sidebar-active"
            className="absolute inset-0 rounded-md bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-line"
            transition={{ type: 'spring', stiffness: 480, damping: 38 }}
          />
        )}
        <span className="relative flex w-4 justify-center text-ink-3">
          {IconComponent ? <IconComponent size={15} weight={isActive ? 'fill' : 'regular'} /> : leading}
        </span>
        <span className="relative flex-1 truncate">{label}</span>
        {trailing ? <span className="relative flex items-center">{trailing}</span> : null}
        {count !== undefined && !trailing && (
          <span className="tabular relative text-[11.5px] text-ink-3">{count}</span>
        )}
      </NavLink>
    </li>
  );
}
