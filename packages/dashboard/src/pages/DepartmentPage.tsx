/**
 * One department: its skills, and its README ledger rendered with working links.
 * Health issues that belong to the department surface at the top.
 */
import { BookOpenText, FolderSimple, Warning } from '@phosphor-icons/react';
import { useParams, useSearchParams, Link } from 'react-router';

import { RelativeTime } from '@/components/common/RelativeTime';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/common/States';
import { PageHeader } from '@/components/layout/PageHeader';
import { DocumentCard, Markdown } from '@/components/markdown/Markdown';
import { Outline } from '@/components/markdown/Outline';
import { DepartmentDot } from '@/components/skill/DepartmentMark';
import { SkillRow } from '@/components/skill/SkillRow';
import { Card } from '@/components/ui/card';
import { TabPanel, Tabs } from '@/components/ui/tabs';
import { formatCompact, plural } from '@/lib/format';
import { useDepartment, useHealth } from '@/lib/queries';

export function DepartmentPage() {
  const { id = '' } = useParams();
  const { data: department, error } = useDepartment(id);
  const { data: health } = useHealth();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'ledger' ? 'ledger' : 'skills';

  if (error) return <ErrorState error={error} suggestionHref={(name) => `/departments/${name}`} />;
  if (!department) return <PageSkeleton />;

  const issues = (health?.issues ?? []).filter(
    (issue) => issue.department === department.id && issue.severity !== 'info',
  );

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Departments', to: '/' }, { label: department.title }]}
        title={
          <span className="flex items-center gap-3">
            <DepartmentDot id={department.id} className="size-3" />
            {department.title}
          </span>
        }
        description={department.summary || undefined}
        meta={
          <>
            <span>{plural(department.skills.length, 'skill')}</span>
            <span>{formatCompact(department.stats.words)} words</span>
            {department.updated && (
              <span>
                Updated <RelativeTime iso={department.updated.date} />
              </span>
            )}
            <span className="flex items-center gap-1 font-mono text-[11.5px]">
              <FolderSimple size={13} />
              {department.path}/
            </span>
          </>
        }
      />

      {issues.length > 0 && (
        <Link
          to="/health"
          className="mb-6 flex items-center gap-2 rounded-lg bg-warn-soft px-3.5 py-2.5 text-[13px] text-warn transition-opacity hover:opacity-85"
        >
          <Warning size={15} weight="bold" />
          {plural(issues.length, 'issue')} in this department. Review them on the health page.
        </Link>
      )}

      <Tabs
        value={tab}
        onValueChange={(next) => setParams(next === 'skills' ? {} : { tab: next }, { replace: true })}
        items={[
          { value: 'skills', label: 'Skills', count: department.skills.length },
          { value: 'ledger', label: 'Ledger' },
        ]}
      >
        <TabPanel value="skills" className="pt-5">
          {department.skills.length === 0 ? (
            <EmptyState title="No skills yet">
              Add a folder with a SKILL.md inside <code className="font-mono">{department.path}/</code>.
            </EmptyState>
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-line">
                {department.skills.map((skill) => (
                  <li key={skill.name}>
                    <SkillRow skill={skill} showDepartment={false} />
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabPanel>

        <TabPanel value="ledger" className="pt-6">
          {department.hasReadme ? (
            <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_200px]">
              <DocumentCard>
                <Markdown
                  sourcePath={`${department.path}/README.md`}
                  hideTitle
                  hideLead={Boolean(department.summary)}
                >
                  {department.readme}
                </Markdown>
              </DocumentCard>
              <aside className="hidden xl:block">
                <div className="sticky top-10">
                  <Outline headings={department.readmeHeadings} />
                </div>
              </aside>
            </div>
          ) : (
            <EmptyState icon={<BookOpenText size={22} />} title="This department has no ledger">
              Add <code className="font-mono">{department.path}/README.md</code> listing its skills.
            </EmptyState>
          )}
        </TabPanel>
      </Tabs>
    </>
  );
}
