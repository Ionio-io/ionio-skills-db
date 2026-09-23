/**
 * All skills: filter by department, narrow by text, and sort. Filters live in the
 * URL (?q=&department=&sort=), so any view can be linked to. Rows animate into
 * their new positions when the order changes.
 */
import { Books, MagnifyingGlass, X } from '@phosphor-icons/react';
import type { SkillSummary } from '@ionio-skills/core/types';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { EmptyState, ErrorState, PageSkeleton } from '@/components/common/States';
import { PageHeader } from '@/components/layout/PageHeader';
import { DepartmentDot } from '@/components/skill/DepartmentMark';
import { SkillRow } from '@/components/skill/SkillRow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Segmented } from '@/components/ui/segmented';
import { plural } from '@/lib/format';
import { useCatalog } from '@/lib/queries';

type SortKey = 'name' | 'updated' | 'size';

const SORTS: Record<SortKey, { label: string; compare: (a: SkillSummary, b: SkillSummary) => number }> = {
  name: { label: 'Name', compare: (a, b) => a.name.localeCompare(b.name) },
  updated: {
    label: 'Recent',
    compare: (a, b) =>
      (b.updated?.date ?? '').localeCompare(a.updated?.date ?? '') || a.name.localeCompare(b.name),
  },
  size: { label: 'Longest', compare: (a, b) => b.stats.words - a.stats.words },
};

export function SkillsPage() {
  const { data: catalog, error } = useCatalog();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const department = params.get('department') ?? 'all';
  const sort = (params.get('sort') as SortKey | null) ?? 'name';

  /** Updates one URL parameter, dropping it when it is back at its default. */
  const update = (key: string, value: string, fallback: string) =>
    setParams(
      (current) => {
        if (value === fallback) current.delete(key);
        else current.set(key, value);
        return current;
      },
      { replace: true },
    );

  const visible = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return (catalog?.skills ?? [])
      .filter((skill) => department === 'all' || skill.department === department)
      .filter((skill) => {
        const haystack = `${skill.name} ${skill.title} ${skill.description}`.toLowerCase();
        return terms.every((term) => haystack.includes(term));
      })
      .sort((SORTS[sort] ?? SORTS.name).compare);
  }, [catalog, query, department, sort]);

  if (error) return <ErrorState error={error} />;
  if (!catalog) return <PageSkeleton />;

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Library', to: '/' }, { label: 'All skills' }]}
        title="All skills"
        description="Every skill in the library. Each description is exactly what an agent reads to decide whether to load the skill."
      />

      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center">
        <Input
          className="xl:w-72"
          icon={<MagnifyingGlass size={14} />}
          placeholder="Filter by name or description"
          value={query}
          onChange={(event) => update('q', event.target.value, '')}
          trailing={
            query && (
              <button
                onClick={() => update('q', '', '')}
                aria-label="Clear filter"
                className="text-ink-3 hover:text-ink"
              >
                <X size={13} />
              </button>
            )
          }
        />
        <Segmented
          label="Department"
          value={department}
          onValueChange={(value) => update('department', value, 'all')}
          options={[
            { value: 'all', label: 'All' },
            ...catalog.departments.map((dept) => ({
              value: dept.id,
              label: (
                <>
                  <DepartmentDot id={dept.id} />
                  {dept.title}
                </>
              ),
            })),
          ]}
        />
        <Segmented
          label="Sort"
          className="xl:ml-auto"
          value={sort}
          onValueChange={(value) => update('sort', value, 'name')}
          options={Object.entries(SORTS).map(([value, { label }]) => ({ value, label }))}
        />
      </div>

      <p className="tabular mb-2 text-[12px] text-ink-3" aria-live="polite">
        {visible.length === catalog.skills.length
          ? plural(visible.length, 'skill')
          : `${visible.length} of ${plural(catalog.skills.length, 'skill')}`}
      </p>

      {visible.length === 0 ? (
        <EmptyState icon={<Books size={22} />} title="No skills match these filters">
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setParams({}, { replace: true })}>
            Clear filters
          </Button>
        </EmptyState>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {visible.map((skill) => (
                <motion.li
                  key={skill.name}
                  layout="position"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, layout: { type: 'spring', stiffness: 500, damping: 45 } }}
                >
                  <SkillRow skill={skill} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </Card>
      )}
    </>
  );
}
