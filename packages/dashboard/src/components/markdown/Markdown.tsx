/**
 * Renders library markdown (skills, ledgers, reference files).
 *
 * - GitHub-flavoured markdown (tables, task lists, strikethrough).
 * - Heading ids from `rehype-slug`, which match the slugs the core library puts in
 *   `headings`, so the outline and deep links line up with the rendered page.
 * - Relative links resolve against the document's own path and become dashboard
 *   routes; external links open in a new tab.
 */
import { memo, type ComponentProps, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import { Link } from 'react-router';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/cn';
import { routeForLink } from '@/lib/links';

export interface MarkdownProps {
  children: string;
  /** Library-relative path of the document, e.g. `sales/README.md`, for link resolution. */
  sourcePath: string;
  /** Drop the first H1, when the page header already shows the title. */
  hideTitle?: boolean;
  /** Also drop the first paragraph after it, when the header already shows it as a summary. */
  hideLead?: boolean;
  /** Render in the mono face: used for a skill's own text, to read as the raw file. */
  mono?: boolean;
  className?: string;
}

export const Markdown = memo(function Markdown({
  children,
  sourcePath,
  hideTitle,
  hideLead,
  className,
  mono,
}: MarkdownProps) {
  // Without its title, a document may open on a rule or a heading whose top border
  // would double the one above; drop that leading rule too.
  let markdown = hideTitle ? children.replace(/^\s*#\s+.+\n+(?:(?:-{3,}|\*{3,})\s*\n+)?/, '') : children;
  if (hideLead) markdown = markdown.replace(/^\s*(?![#|>\-*+\d<`])[^\n]+(?:\n(?!\s*\n)[^\n]+)*\n+/, '');
  return (
    <div className={cn('prose', mono && 'prose-mono', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={components(sourcePath)}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
});

/** The surface a rendered document sits on: a white card, set apart from the page. */
export function DocumentCard({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-line bg-surface px-6 py-7 sm:px-9 sm:py-8">{children}</div>;
}

// ─── Element overrides ──────────────────────────────────────────────────────

function components(sourcePath: string): Components {
  return {
    a: ({ href = '', children, node: _node, ...props }) => {
      const route = routeForLink(sourcePath, href);
      if (route === null) {
        return (
          <a href={href} target="_blank" rel="noreferrer" {...props}>
            {children}
          </a>
        );
      }
      return route.startsWith('#') ? <a href={route}>{children}</a> : <Link to={route}>{children}</Link>;
    },
    table: ({ node: _node, ...props }) => (
      <div className="table-wrap">
        <table {...props} />
      </div>
    ),
    h2: (props) => <Heading level={2} {...props} />,
    h3: (props) => <Heading level={3} {...props} />,
    h4: (props) => <Heading level={4} {...props} />,
  };
}

type HeadingProps = ComponentProps<'h2'> & { node?: unknown; level: 2 | 3 | 4; children?: ReactNode };

/** A heading with a hover anchor for deep links. */
function Heading({ level, id, children, node: _node, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag id={id} {...props}>
      {children}
      {id && (
        <a href={`#${id}`} className="heading-anchor" aria-label="Link to this section">
          #
        </a>
      )}
    </Tag>
  );
}
