/**
 * Primary navigation.
 *
 *   Overview
 *   All skills            ▾   departments nest here and fold away
 *     ● Copywriting
 *     ● Editorial …
 *   Health
 *   Connect
 *
 * The sidebar collapses to an icon rail (⌘B). Icons keep a fixed column, so the only
 * thing that moves is the width: labels fade out and nothing jumps. In the rail every
 * item, department dots included, gets a tooltip that opens immediately.
 */
import {
  Books,
  CaretDown,
  Heartbeat,
  House,
  MagnifyingGlass,
  Moon,
  Plugs,
  SidebarSimple,
  Sun,
  type Icon,
} from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import type { MouseEvent, ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router';

import { DepartmentDot } from '@/components/skill/DepartmentMark';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import { shortSha } from '@/lib/format';
import type { LiveState } from '@/lib/live';
import { useCatalog, useHealth } from '@/lib/queries';
import { useDepartmentsOpen } from '@/lib/sidebar';
import { useTheme } from '@/lib/theme';

const ICON_SIZE = 19;
const EASE = [0.16, 1, 0.3, 1] as const;

export interface SidebarProps {
  live: LiveState;
  onSearch: () => void;
  /** Called after a link is followed (closes the mobile drawer). */
  onNavigate?: () => void;
  /** Icon-rail mode. The mobile drawer is always expanded. */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function Sidebar({ live, onSearch, onNavigate, collapsed = false, onToggleCollapsed }: SidebarProps) {
  const { data: catalog } = useCatalog();
  const { data: health } = useHealth();
  const [theme, toggleTheme] = useTheme();
  const [departmentsOpen, setDepartmentsOpen] = useDepartmentsOpen();
  const problems = (health?.counts.error ?? 0) + (health?.counts.warning ?? 0);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ─── Brand ─────────────────────────────────────────────────────────── */}
      <div className="flex h-[60px] shrink-0 items-center gap-2.5 px-5">
        <img src="/favicon.svg" alt="" className="size-[26px] shrink-0 rounded-md ring-1 ring-line" />
        <Fade hidden={collapsed} className="text-[15.5px] font-semibold tracking-tight text-ink">
          Ionio Skills
        </Fade>
      </div>

      {/* ─── Search ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-3 pb-2">
        <Tooltip
          content={
            <>
              Search <Kbd className="ml-1 border-0 bg-canvas/20 text-canvas">⌘K</Kbd>
            </>
          }
          side="right"
          delay={0}
          disabled={!collapsed}
        >
          <button
            onClick={onSearch}
            aria-label="Search"
            className="flex h-[35px] w-full items-center gap-2.5 overflow-hidden rounded-md border border-line bg-surface px-[10px] text-[14px] text-ink-3 transition-colors hover:border-line-strong hover:text-ink-2"
          >
            <MagnifyingGlass size={ICON_SIZE - 1} className="shrink-0" />
            <Fade hidden={collapsed} className="flex flex-1 items-center justify-between">
              Search
              <Kbd>⌘K</Kbd>
            </Fade>
          </button>
        </Tooltip>
      </div>

      {/* ─── Navigation ────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-x-hidden overflow-y-auto px-3 pb-4" onClick={onNavigate}>
        <ul className="flex flex-col gap-px">
          <NavRow to="/" end icon={House} label="Overview" collapsed={collapsed} />
          <NavRow
            to="/skills"
            end
            icon={Books}
            label="All skills"
            collapsed={collapsed}
            meta={catalog?.stats.skills}
            // Clicking the row while already on All skills folds or unfolds the group,
            // the same as the arrow. Arriving from elsewhere always shows it.
            onActiveClick={collapsed ? undefined : () => setDepartmentsOpen(!departmentsOpen)}
            onFollow={() => setDepartmentsOpen(true)}
            action={
              <button
                onClick={(event) => {
                  // Toggle the group without following the link.
                  event.preventDefault();
                  event.stopPropagation();
                  setDepartmentsOpen(!departmentsOpen);
                }}
                aria-label={departmentsOpen ? 'Hide departments' : 'Show departments'}
                aria-expanded={departmentsOpen}
                className="flex size-5 items-center justify-center rounded text-ink-3 transition-colors hover:bg-surface-3 hover:text-ink"
              >
                <CaretDown
                  size={12}
                  weight="bold"
                  className={cn('transition-transform duration-200', !departmentsOpen && '-rotate-90')}
                />
              </button>
            }
          >
            {/* The rail always lists departments: its dots are how you reach them when collapsed. */}
            <AnimatePresence initial={false}>
              {(departmentsOpen || collapsed) && catalog && (
                <motion.ul
                  // Folds with a soft blur so the rows dissolve rather than clip. The list
                  // clips its overflow only while the height animates: at rest it must not,
                  // or it cuts off the active row's ring and shadow at its edges.
                  initial={{ height: 0, opacity: 0, filter: 'blur(3px)', overflow: 'hidden' }}
                  animate={{
                    height: 'auto',
                    opacity: 1,
                    filter: 'blur(0px)',
                    transitionEnd: { overflow: 'visible', filter: 'none' },
                  }}
                  exit={{ height: 0, opacity: 0, filter: 'blur(3px)', overflow: 'hidden' }}
                  transition={{ duration: 0.2875, ease: EASE }}
                  className="relative flex flex-col gap-px"
                >
                  {/* Guide line under the parent icon, tying the group to "All skills". */}
                  <span
                    aria-hidden
                    className={cn(
                      'absolute top-1 bottom-1 left-[21px] w-px bg-line transition-opacity duration-200',
                      collapsed && 'opacity-0',
                    )}
                  />
                  {catalog.departments.map((department) => (
                    <NavRow
                      key={department.id}
                      to={`/departments/${department.id}`}
                      nested
                      collapsed={collapsed}
                      leading={<DepartmentDot id={department.id} />}
                      label={department.title}
                      tooltip={`${department.title} · ${department.skillNames.length} skills`}
                      meta={department.skillNames.length}
                    />
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </NavRow>
          <NavRow
            to="/health"
            icon={Heartbeat}
            label="Health"
            collapsed={collapsed}
            tooltip={
              health ? (problems > 0 ? `Health · ${problems} issues` : 'Health · all checks pass') : 'Health'
            }
            meta={
              health &&
              (problems > 0 ? (
                <span className="tabular rounded-full bg-warn-soft px-1.5 text-[12px] leading-[18px] font-medium text-warn">
                  {problems}
                </span>
              ) : (
                <span className="size-[7px] rounded-full bg-good" aria-label="All checks pass" />
              ))
            }
          />
          <NavRow to="/connect" icon={Plugs} label="Connect" collapsed={collapsed} />
        </ul>
      </nav>

      {/* ─── Footer: live status, theme, collapse ─────────────────────────── */}
      <div
        className={cn(
          'flex shrink-0 gap-1 border-t border-line px-3 py-3',
          collapsed ? 'flex-col items-center' : 'items-center',
        )}
      >
        <Tooltip
          content={`${LIVE_COPY[live].label}: ${LIVE_COPY[live].hint}`}
          side={collapsed ? 'right' : 'top'}
          delay={collapsed ? 0 : undefined}
        >
          <div
            className={cn(
              'flex min-w-0 items-center gap-2 text-[13px] text-ink-3',
              collapsed ? 'h-7 justify-center' : 'flex-1 pl-1.5',
            )}
          >
            <span className="relative flex size-2 shrink-0">
              {live === 'live' && (
                <span className="absolute inset-0 animate-ping rounded-full bg-good opacity-40" />
              )}
              <span className={cn('relative size-2 rounded-full', LIVE_COPY[live].dot)} />
            </span>
            {!collapsed && (
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
            )}
          </div>
        </Tooltip>
        <Tooltip
          content={theme === 'dark' ? 'Light theme' : 'Dark theme'}
          side={collapsed ? 'right' : 'top'}
          delay={collapsed ? 0 : undefined}
        >
          <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={ICON_SIZE - 1} /> : <Moon size={ICON_SIZE - 1} />}
          </Button>
        </Tooltip>
        {onToggleCollapsed && (
          <Tooltip
            content={collapsed ? 'Expand sidebar  ⌘B' : 'Collapse sidebar  ⌘B'}
            side={collapsed ? 'right' : 'top'}
            delay={collapsed ? 0 : undefined}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <SidebarSimple size={ICON_SIZE - 1} />
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

const LIVE_COPY: Record<LiveState, { label: string; dot: string; hint: string }> = {
  live: { label: 'Live', dot: 'bg-good', hint: 'edits to skill files show up here automatically' },
  connecting: { label: 'Connecting', dot: 'bg-warn', hint: 'reconnecting to the server' },
  offline: { label: 'Offline', dot: 'bg-bad', hint: 'the server is not reachable' },
  paused: { label: 'Paused', dot: 'bg-ink-3', hint: 'live updates resume when this tab is visible again' },
  static: {
    label: 'Deployed',
    dot: 'bg-ink-3',
    hint: 'this is a published copy of the library; redeploy to update it',
  },
};

// ─── Pieces ─────────────────────────────────────────────────────────────────

/** Content that fades (rather than jumps) away when the sidebar collapses. */
function Fade({ hidden, className, children }: { hidden: boolean; className?: string; children: ReactNode }) {
  return (
    <span
      aria-hidden={hidden || undefined}
      className={cn(
        'min-w-0 whitespace-nowrap transition-opacity duration-200',
        hidden && 'pointer-events-none opacity-0',
        className,
      )}
    >
      {children}
    </span>
  );
}

interface NavRowProps {
  to: string;
  end?: boolean;
  /** A Phosphor icon (filled when active), or any custom `leading` mark. */
  icon?: Icon;
  leading?: ReactNode;
  label: string;
  collapsed: boolean;
  /** Tooltip text in the rail. Defaults to the label. */
  tooltip?: string;
  /** Count or status shown at the end of the row. */
  meta?: ReactNode;
  /** A control at the end of the row (e.g. the group toggle). */
  action?: ReactNode;
  /** Indented child row. */
  nested?: boolean;
  /** Nested rows rendered below this one. */
  children?: ReactNode;
  /** Replaces navigation when the row is clicked while its page is already open. */
  onActiveClick?: () => void;
  /** Called when a click navigates to the row's page. */
  onFollow?: () => void;
}

function NavRow({
  to,
  end,
  icon: IconComponent,
  leading,
  label,
  collapsed,
  tooltip,
  meta,
  action,
  nested,
  children,
  onActiveClick,
  onFollow,
}: NavRowProps) {
  const { pathname } = useLocation();
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (isActive && onActiveClick) {
      // Already here: the click is a toggle, not a navigation (and keeps a mobile drawer open).
      event.preventDefault();
      event.stopPropagation();
      onActiveClick();
    } else {
      onFollow?.();
    }
  }

  return (
    <li>
      <Tooltip content={tooltip ?? label} side="right" delay={0} disabled={!collapsed}>
        <NavLink
          to={to}
          end={end}
          onClick={onClick}
          aria-label={collapsed ? (tooltip ?? label) : undefined}
          className={cn(
            'group/row relative flex h-[35px] items-center gap-2.5 rounded-md text-[14.3px] transition-[color,background-color,padding,margin] duration-200',
            // Nested rows line their dot up with the parent's label, or with the icon column in the rail.
            // Nested rows start just right of the guide line (at 21px), so their hover and
            // active shading never covers it; the dot still lines up with the parent's label.
            nested && !collapsed ? 'ml-[29px] pr-2 pl-3' : 'px-[11px]',
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
          <span
            className={cn(
              'relative flex shrink-0 justify-center text-ink-3',
              nested && !collapsed ? 'w-2' : 'w-5',
            )}
          >
            {IconComponent ? (
              <IconComponent size={ICON_SIZE} weight={isActive ? 'fill' : 'regular'} />
            ) : (
              leading
            )}
          </span>
          <Fade hidden={collapsed} className="relative flex flex-1 items-center gap-2 truncate">
            <span className="flex-1 truncate">{label}</span>
            {meta !== undefined &&
              (typeof meta === 'number' ? (
                <span className="tabular text-[12.5px] font-normal text-ink-3">{meta}</span>
              ) : (
                <span className="flex items-center">{meta}</span>
              ))}
            {action}
          </Fade>
        </NavLink>
      </Tooltip>
      {children}
    </li>
  );
}
