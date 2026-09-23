import { SkillLibrary } from '@ionio-skills/core';
import type { Client } from '@modelcontextprotocol/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { connectClient, createFixture, textOf } from './helpers.js';

let client: Client;
let teardown: () => Promise<void>;

beforeAll(async () => {
  const fixture = await createFixture();
  const library = new SkillLibrary({ root: fixture.root });
  const connection = await connectClient(library);
  client = connection.client;
  teardown = async () => {
    await connection.close();
    await fixture.cleanup();
  };
});
afterAll(() => teardown());

const call = (name: string, args: Record<string, unknown> = {}) => client.callTool({ name, arguments: args });

describe('server metadata', () => {
  it('ships instructions with the workflow and a catalog', () => {
    const instructions = client.getInstructions() ?? '';
    expect(instructions).toContain('4 skills across 2 departments');
    expect(instructions).toContain('get_skill');
    expect(instructions).toContain('- alpha-writer: Drafts persuasive landing page copy.');
    expect(instructions).toContain('- beta-editor (opt-in)');
  });
});

describe('tools', () => {
  it('registers six read-only tools', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'get_ledger',
      'get_skill',
      'get_skill_file',
      'list_departments',
      'list_skills',
      'search_skills',
    ]);
    for (const tool of tools)
      expect(tool.annotations).toMatchObject({ readOnlyHint: true, openWorldHint: false });
  });

  it('list_skills groups by department and can filter', async () => {
    const all = textOf(await call('list_skills'));
    expect(all).toContain('## Writing (`writing`)');
    expect(all).toContain('**alpha-writer** _(2 bundled files)_');
    expect(all).toContain('**beta-editor** _(opt-in only)_');

    const design = textOf(await call('list_skills', { department: 'design' }));
    expect(design).toContain('gamma-grid');
    expect(design).not.toContain('alpha-writer');
  });

  it('get_skill returns SKILL.md verbatim plus a manifest of bundled files', async () => {
    const result = await call('get_skill', { name: 'alpha-writer' });
    const [instructions, manifest] = (result.content as Array<{ text: string }>).map((block) => block.text);
    expect(instructions).toMatch(/^---\nname: alpha-writer/);
    expect(manifest).toContain('`references/guide.md`');
    expect(manifest).toContain('skills://skill/alpha-writer/references/guide.md');
    expect(manifest).toContain('Skills this one refers to: `beta-editor`');
  });

  it('get_skill on an unknown name is a tool error with suggestions', async () => {
    const result = await call('get_skill', { name: 'alpha-writr' });
    expect(result.isError).toBe(true);
    expect(textOf(result)).toContain('Did you mean `alpha-writer`');
  });

  it('get_skill_file serves manifest paths and refuses anything else', async () => {
    expect(
      textOf(await call('get_skill_file', { name: 'alpha-writer', path: 'references/guide.md' })),
    ).toContain('Headline patterns');
    const escape = await call('get_skill_file', { name: 'alpha-writer', path: '../../README.md' });
    expect(escape.isError).toBe(true);
  });

  it('search_skills ranks and explains matches', async () => {
    const text = textOf(await call('search_skills', { query: 'carousels' }));
    expect(text).toMatch(/1\. \*\*gamma-grid\*\* \(`design`, matched in description\)/);
    expect(textOf(await call('search_skills', { query: 'zzqx' }))).toContain('No skills match');
  });

  it('get_ledger reads a department ledger or the root index', async () => {
    expect(textOf(await call('get_ledger', { department: 'writing' }))).toContain('# Writing');
    expect(textOf(await call('get_ledger'))).toContain('# Test Library');
    expect(textOf(await call('get_ledger', { department: 'design' }))).toContain('has no README ledger yet');
  });

  it('rejects arguments the schema does not allow', async () => {
    const result = await call('search_skills', { query: 'x', limit: 500 });
    expect(result.isError).toBe(true);
  });
});

describe('resources', () => {
  it('lists the index, ledgers, skills and bundled text files', async () => {
    const { resources } = await client.listResources();
    const uris = resources.map((resource) => resource.uri);
    expect(uris).toEqual(
      expect.arrayContaining([
        'skills://index',
        'skills://department/writing',
        'skills://skill/alpha-writer',
        'skills://skill/alpha-writer/references/guide.md',
      ]),
    );
    expect(uris).not.toContain('skills://skill/delta-broken/logo.png');
  });

  it('reads skills and nested files through the URI templates', async () => {
    const skill = await client.readResource({ uri: 'skills://skill/beta-editor' });
    expect(skill.contents[0]).toMatchObject({ mimeType: 'text/markdown' });
    expect((skill.contents[0] as { text: string }).text).toContain('# Beta Editor');

    const file = await client.readResource({ uri: 'skills://skill/alpha-writer/references/guide.md' });
    expect((file.contents[0] as { text: string }).text).toContain('# Guide');
  });

  it('answers unknown URIs with a not-found error', async () => {
    await expect(client.readResource({ uri: 'skills://skill/nope' })).rejects.toThrow(
      /No skill named `nope`/,
    );
  });

  it('completes skill names', async () => {
    const result = await client.complete({
      ref: { type: 'ref/resource', uri: 'skills://skill/{name}' },
      argument: { name: 'name', value: 'al' },
    });
    expect(result.completion.values).toEqual(['alpha-writer']);
  });
});

describe('prompts', () => {
  it('offers one prompt per skill', async () => {
    const { prompts } = await client.listPrompts();
    expect(prompts.map((prompt) => prompt.name).sort()).toEqual([
      'alpha-writer',
      'beta-editor',
      'delta-broken',
      'gamma-grid',
    ]);
  });

  it('embeds the skill and the task', async () => {
    const { messages } = await client.getPrompt({
      name: 'alpha-writer',
      arguments: { task: 'Write a hero headline' },
    });
    expect(messages[0]!.content).toMatchObject({
      type: 'resource',
      resource: { uri: 'skills://skill/alpha-writer' },
    });
    expect((messages[1]!.content as { text: string }).text).toContain(
      'for this task:\n\nWrite a hero headline',
    );
  });
});
