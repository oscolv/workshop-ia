import Link from 'next/link'
import type { Route } from 'next'
import { getIndex } from '@/lib/wiki'

export function WikiSidebar() {
  const index = getIndex()
  const sections: Array<[string, typeof index.conceptos]> = [
    ['Entidades', index.entidades],
    ['Conceptos', index.conceptos],
    ['Fuentes',   index.fuentes],
  ]
  if (index.respuestas.length) sections.push(['Respuestas', index.respuestas])

  return (
    <aside className="text-sm space-y-6 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
      {sections.map(([title, pages]) => (
        <div key={title}>
          <h3 className="font-semibold mb-2 text-muted-foreground uppercase text-xs tracking-wider">{title}</h3>
          <ul className="space-y-1">
            {pages.map(p => (
              <li key={p.slug}>
                <Link href={`/wiki/${p.slug}` as Route} className="hover:underline text-foreground">
                  {p.frontmatter.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  )
}
