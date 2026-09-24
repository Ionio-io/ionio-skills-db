/**
 * MCP prompts: one per skill, for people rather than models.
 *
 * Clients surface prompts as commands (in Claude Code, `/mcp__ionio-skills__<skill>`),
 * so a person can pull a skill into the conversation by name. Each prompt embeds
 * the skill's SKILL.md as a resource and, when given, the task to apply it to.
 *
 * Prompts are registered from the snapshot the server was built with. HTTP builds a
 * server per request, so it is always current; a long-lived stdio connection sees
 * skills added after it connected once the client reconnects.
 */
import type { LibrarySnapshot } from '@ionio-skills/core';
import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';

import { renderSkillManifest } from './render.js';
import { skillUri } from './uris.js';

const argsSchema = z.object({
  task: z.string().optional().describe('What to apply the skill to. Leave empty to just load the skill.'),
});

export function registerPrompts(server: McpServer, snapshot: LibrarySnapshot): void {
  for (const summary of snapshot.skills()) {
    server.registerPrompt(
      summary.name,
      { title: summary.title, description: summary.description, argsSchema },
      ({ task }) => {
        const skill = snapshot.skill(summary.name);
        const instruction = task?.trim()
          ? `Follow the ${skill.name} skill above for this task:\n\n${task.trim()}`
          : `Load the ${skill.name} skill above and follow it for the task I give you next.`;

        return {
          description: skill.description,
          messages: [
            {
              role: 'user' as const,
              content: {
                type: 'resource' as const,
                resource: { uri: skillUri(skill.name), mimeType: 'text/markdown', text: skill.raw },
              },
            },
            {
              role: 'user' as const,
              content: { type: 'text' as const, text: `${instruction}\n\n${renderSkillManifest(skill)}` },
            },
          ],
        };
      },
    );
  }
}
