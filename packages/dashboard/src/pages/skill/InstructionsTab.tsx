/** The rendered SKILL.md body. The title is already in the page header, so it is dropped here. */
import type { Skill } from '@ionio-skills/core/types';

import { Markdown } from '@/components/markdown/Markdown';

export function InstructionsTab({ skill }: { skill: Skill }) {
  return (
    <Markdown sourcePath={`${skill.path}/SKILL.md`} hideTitle>
      {skill.body}
    </Markdown>
  );
}
