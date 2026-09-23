/**
 * The rendered SKILL.md body, on its own card so the document is clearly separate
 * from the page around it. The title is already in the page header, so it is dropped.
 */
import type { Skill } from '@ionio-skills/core/types';

import { DocumentCard, Markdown } from '@/components/markdown/Markdown';

export function InstructionsTab({ skill }: { skill: Skill }) {
  return (
    <DocumentCard>
      <Markdown sourcePath={`${skill.path}/SKILL.md`} hideTitle>
        {skill.body}
      </Markdown>
    </DocumentCard>
  );
}
