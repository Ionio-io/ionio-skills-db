/**
 * Builds a small, deliberately imperfect skills library in a temp folder.
 * It is not a git repository, which also covers the "no history" code path.
 */
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

export const FIXTURE: Record<string, string> = {
  'README.md': `# Test Library

| Skill | Department |
|---|---|
| [alpha-writer](writing/alpha-writer/SKILL.md) | writing |
| beta-editor | writing |

**Total: 5 skills**

Tooling docs: [tooling](tools/NOTES.md).
`,
  // Outside the library (reserved folder), but a valid link target all the same.
  'packages/NOTES.md': '# Notes\n',
  'tools/NOTES.md': '# Tools\n',
  'writing/README.md': `# Writing

Skills for words that ship. Second sentence here.

| Skill | What |
|---|---|
| [alpha-writer](alpha-writer/SKILL.md) | Drafts |
| [beta-editor](beta-editor/SKILL.md) | Edits |
`,
  'writing/alpha-writer/SKILL.md': `---
name: alpha-writer
description: Drafts persuasive landing page copy. Use when asked for headlines or hooks.
---

# Alpha Writer

Always finish with a pass of beta-editor. See [the guide](references/guide.md).

## Step one

\`\`\`md
# Not a heading, it is inside a code fence
[not a link](nowhere.md)
\`\`\`

## Step one
`,
  'writing/alpha-writer/references/guide.md': '# Guide\n\nHeadline patterns live here.\n',
  'writing/alpha-writer/references/unused.md': '# Unused\n',
  'writing/beta-editor/SKILL.md': `---
name: beta-editor
description: "OPT-IN ONLY: edits drafts line by line. Use only when explicitly requested."
---

# Beta Editor

Broken link to [missing](../missing/SKILL.md).
`,
  'design/gamma-grid/SKILL.md': `---
name: gamma-renamed
description: Lays out carousels on a grid.
---

# Gamma Grid
`,
  'design/delta-broken/SKILL.md': `---
name: delta-broken
description: this: is: not: valid
---
`,
  'design/delta-broken/logo.png': 'binary-ish',
  // Never departments: reserved, hidden and private folders.
  'packages/core/SKILL.md': '---\nname: nope\ndescription: code\n---\n',
  '_imports/old/SKILL.md': '---\nname: nope\ndescription: archive\n---\n',
  '.hidden/skill/SKILL.md': '---\nname: nope\ndescription: hidden\n---\n',
};

export async function createFixture(
  files: Record<string, string> = FIXTURE,
): Promise<{ root: string; cleanup: () => Promise<void> }> {
  const root = await mkdtemp(path.join(tmpdir(), 'skills-fixture-'));
  for (const [relative, content] of Object.entries(files)) {
    const target = path.join(root, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  return { root, cleanup: () => rm(root, { recursive: true, force: true }) };
}
