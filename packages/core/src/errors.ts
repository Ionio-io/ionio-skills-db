/**
 * Errors the library raises for lookups that cannot be satisfied.
 * They carry enough context for the API to answer 404 and for the MCP server to
 * tell an agent what to try instead.
 */

export type NotFoundKind = 'skill' | 'department' | 'file';

export class NotFoundError extends Error {
  constructor(
    readonly kind: NotFoundKind,
    readonly id: string,
    /** Close matches worth suggesting to the caller. */
    readonly suggestions: string[] = [],
  ) {
    const hint =
      suggestions.length > 0 ? ` Did you mean ${suggestions.map((s) => `\`${s}\``).join(', ')}?` : '';
    super(`No ${kind} named \`${id}\`.${hint}`);
    this.name = 'NotFoundError';
  }
}
