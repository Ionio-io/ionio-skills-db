/**
 * The rendered SKILL.md body, on its own card so the document is clearly separate
 * from the page around it. The title is already in the page header, so it is dropped.
 */
import type { Skill } from '@ionio-skills/core/types';

import { DocumentCard, Markdown } from '@/components/markdown/Markdown';

export function InstructionsTab({ skill }: { skill: Skill }) {
  return (
    // On desktop the card is the scroll container: only the document moves.
    <DocumentCard className="xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
      <Markdown sourcePath={`${skill.path}/SKILL.md`} hideTitle mono>
        {skill.body}
      </Markdown>
    </DocumentCard>
  );
}
