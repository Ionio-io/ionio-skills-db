/**
 * ⌘K palette: jump to any page, department or skill, or search skill content.
 *
 * Pages and departments filter locally. Skills come from the server's full-text
 * search once there are two characters, so a query can match inside a skill's
 * instructions, not just its name; the snippet shows where.
 */
import {
  ArrowRight,
  Books,
  Copy,
  Heartbeat,
  House,
  MagnifyingGlass,
  Moon,
  Plugs,
  type Icon,
} from '@phosphor-icons/react';
import { Command } from 'cmdk';
import { useDeferredValue, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { DepartmentDot } from '@/components/skill/DepartmentMark';
import { Kbd } from '@/components/ui/kbd';
import { useCatalog, useSearch, useServerInfo } from '@/lib/queries';
import { useTheme } from '@/lib/theme';

const PAGES: Array<{ to: string; label: string; icon: Icon }> = [
  { to: '/', label: 'Overview', icon: House },
  { to: '/skills', label: 'All skills', icon: Books },
  { to: '/health', label: 'Health', icon: Heartbeat },
  { to: '/connect', label: 'Connect an agent', icon: Plugs },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query.trim());
  const { data: catalog } = useCatalog();
  const { data: search, isFetching } = useSearch(deferred);
  const { data: server } = useServerInfo();
  const [, toggleTheme] = useTheme();

  const matches = (text: string) => text.toLowerCase().includes(deferred.toLowerCase());
  const pages = PAGES.filter((page) => !deferred || matches(page.label));
  const departments = (catalog?.departments ?? []).filter((d) => !deferred || matches(`${d.title} ${d.id}`));
  const skills =
    deferred.length >= 2
      ? (search?.hits ?? []).map((hit) => ({
          name: hit.name,
          department: hit.department,
          detail: hit.snippet,
        }))
      : (catalog?.skills ?? [])
          .filter((skill) => !deferred || matches(skill.name))
          .map((skill) => ({ name: skill.name, department: skill.department, detail: skill.description }));

  function go(to: string) {
    onOpenChange(false);
    setQuery('');
    void navigate(to);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Search"
      shouldFilter={false}
      loop
      overlayClassName="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px] animate-pop-in"
      contentClassName="fixed top-[14vh] left-1/2 z-50 w-[min(640px,calc(100vw-32px))] -translate-x-1/2 animate-pop-in overflow-hidden rounded-xl border border-line bg-surface shadow-pop"
    >
      <div className="flex items-center gap-2.5 border-b border-line px-4">
        <MagnifyingGlass size={16} className="text-ink-3" />
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search skills, departments and pages…"
          className="h-12 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-3"
        />
        {isFetching && (
          <span className="size-3 animate-spin rounded-full border-2 border-line-strong border-t-ink-2" />
        )}
        <Kbd>esc</Kbd>
      </div>

      <Command.List className="max-h-[min(460px,60vh)] overflow-y-auto p-2">
        <Command.Empty className="px-3 py-10 text-center text-[13px] text-ink-3">
          {deferred.length >= 2 && isFetching ? 'Searching…' : `Nothing matches “${query}”.`}
        </Command.Empty>

        {skills.length > 0 && (
          <Group heading={deferred.length >= 2 ? 'Skills matching your search' : 'Skills'}>
            {skills.slice(0, 12).map((skill) => (
              <Item
                key={skill.name}
                value={`skill:${skill.name}`}
                onSelect={() => go(`/skills/${skill.name}`)}
              >
                <DepartmentDot id={skill.department} className="mt-1.5 self-start" />
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[13px] text-ink">{skill.name}</div>
                  <div className="truncate text-[12px] text-ink-3">{skill.detail}</div>
                </div>
              </Item>
            ))}
          </Group>
        )}

        {departments.length > 0 && (
          <Group heading="Departments">
            {departments.map((department) => (
              <Item
                key={department.id}
                value={`dept:${department.id}`}
                onSelect={() => go(`/departments/${department.id}`)}
              >
                <DepartmentDot id={department.id} />
                <span className="flex-1 text-ink">{department.title}</span>
                <span className="text-[12px] text-ink-3">{department.skillNames.length} skills</span>
              </Item>
            ))}
          </Group>
        )}

        {pages.length > 0 && (
          <Group heading="Pages">
            {pages.map(({ to, label, icon: PageIcon }) => (
              <Item key={to} value={`page:${to}`} onSelect={() => go(to)}>
                <PageIcon size={15} className="text-ink-3" />
                <span className="flex-1 text-ink">{label}</span>
                <ArrowRight size={13} className="text-ink-3" />
              </Item>
            ))}
          </Group>
        )}

        {!deferred && (
          <Group heading="Actions">
            <Item
              value="action:theme"
              onSelect={() => {
                toggleTheme();
                onOpenChange(false);
              }}
            >
              <Moon size={15} className="text-ink-3" />
              <span className="text-ink">Toggle light and dark theme</span>
            </Item>
            {server && (
              <Item
                value="action:copy-mcp"
                onSelect={() => {
                  void navigator.clipboard
                    .writeText(server.mcpUrl)
                    .then(() => toast.success('MCP URL copied'));
                  onOpenChange(false);
                }}
              >
                <Copy size={15} className="text-ink-3" />
                <span className="text-ink">Copy MCP server URL</span>
                <span className="ml-auto truncate font-mono text-[11.5px] text-ink-3">{server.mcpUrl}</span>
              </Item>
            )}
          </Group>
        )}
      </Command.List>
    </Command.Dialog>
  );
}

const Group = ({ heading, children }: { heading: string; children: ReactNode }) => (
  <Command.Group
    heading={heading}
    className="mb-1 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[11.5px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-ink-3"
  >
    {children}
  </Command.Group>
);

const Item = ({
  value,
  onSelect,
  children,
}: {
  value: string;
  onSelect: () => void;
  children: ReactNode;
}) => (
  <Command.Item
    value={value}
    onSelect={onSelect}
    className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] data-[selected=true]:bg-surface-2"
  >
    {children}
  </Command.Item>
);
