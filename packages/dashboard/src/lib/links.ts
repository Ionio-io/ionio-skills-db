/**
 * Turns relative links inside library markdown into dashboard routes, so a ledger
 * that links `youtube-title/SKILL.md` opens the skill page instead of a raw file.
 */

/** Joins a relative href onto the directory of `fromFile`, resolving `.` and `..`. */
function resolvePath(fromFile: string, href: string): string {
  const parts = fromFile.split('/').slice(0, -1);
  for (const segment of href.split('/')) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') parts.pop();
    else parts.push(segment);
  }
  return parts.join('/');
}

/**
 * Maps a link found in `fromFile` (library-relative, e.g. `sales/README.md`) to a
 * dashboard route. Returns `null` for external links, which render as-is.
 */
export function routeForLink(fromFile: string, href: string): string | null {
  if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) return null;
  if (href.startsWith('#')) return href;

  const [pathPart = '', hash = ''] = href.split('#');
  const anchor = hash ? `#${hash}` : '';
  const target = resolvePath(fromFile, decodeURIComponent(pathPart));
  const segments = target.split('/');

  if (target === 'README.md' || target === '') return `/${anchor}`;
  if (segments.length === 2 && segments[1] === 'README.md') return `/departments/${segments[0]}${anchor}`;
  if (segments.length === 1) return `/departments/${segments[0]}`;
  if (segments.length === 3 && segments[2] === 'SKILL.md') return `/skills/${segments[1]}${anchor}`;
  if (segments.length === 2) return `/skills/${segments[1]}`;
  if (segments.length >= 3) {
    return `/skills/${segments[1]}?tab=files&file=${encodeURIComponent(segments.slice(2).join('/'))}`;
  }
  return null;
}
