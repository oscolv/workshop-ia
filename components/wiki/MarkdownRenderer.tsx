import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeCallouts from 'rehype-callouts'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import Link from 'next/link'
import type { Route } from 'next'
import { remarkWikilinks, remarkNormalizeCalloutTypes } from '@/lib/markdown'
import 'rehype-callouts/theme/obsidian'

const calloutOptions = {
  // <aside> para markup semántico (y es lo que verifica el plan en Task 14)
  tags: { nonCollapsibleContainerTagName: 'aside' },
  callouts: {
    // tipo generado por remarkNormalizeCalloutTypes a partir de [!contradicción]
    contradiccion: {
      title: 'Contradicción',
      indicator:
        '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    },
  },
}

// Schema permisivo: permite los atributos que genera rehype-callouts
// (clases y data-* en div/aside) además de los defaults seguros.
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className', 'dataCallout', 'dataCalloutType', 'dataCalloutTitle', 'dataCalloutBody', 'style'],
    aside: ['className', 'role', 'ariaLabel', 'ariaLabelledBy'],
    // los indicadores de rehype-callouts son SVGs inline (nuestros, no de la fuente)
    svg: ['xmlns', 'width', 'height', 'viewBox', 'fill', 'stroke', 'strokeWidth', 'strokeLinecap', 'strokeLinejoin'],
    path: ['d', 'fill', 'stroke', 'strokeWidth', 'strokeLinecap', 'strokeLinejoin'],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), 'aside', 'svg', 'path'],
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-code:bg-muted prose-code:rounded prose-code:px-1">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkNormalizeCalloutTypes, remarkWikilinks]}
        rehypePlugins={[[rehypeCallouts, calloutOptions], [rehypeSanitize, schema]]}
        components={{
          a: ({ href, children, node: _node, ...props }) => {
            const anchorProps = props as React.AnchorHTMLAttributes<HTMLAnchorElement>
            if (href?.startsWith('/wiki/')) {
              return <Link {...anchorProps} href={href as Route}>{children}</Link>
            }
            return <a {...anchorProps} href={href} target="_blank" rel="noreferrer">{children}</a>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
