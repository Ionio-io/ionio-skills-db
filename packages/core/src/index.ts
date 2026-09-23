/**
 * @ionio-skills/core: reads the skills library from disk.
 *
 *   const library = new SkillLibrary({ root, watch: true });
 *   const snapshot = await library.snapshot();
 *   snapshot.skill('youtube-title');
 */
export { NotFoundError, type NotFoundKind } from './errors.js';
export { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH, NAME_PATTERN } from './health.js';
export { SkillLibrary, type LibraryChange, type SkillLibraryOptions } from './library.js';
export { resolveLibraryRoot } from './root.js';
export type { SearchOptions } from './search.js';
export { LibrarySnapshot, toSummary } from './snapshot.js';
export type * from './types.js';
