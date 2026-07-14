import Link from 'next/link'
import type { Route } from 'next'
import { getIndex } from '@/lib/wiki'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const SECTION_DESCS: Record<string, string> = {
  Entidades:  'Personas y organizaciones referenciadas por las fuentes',
  Conceptos:  'Ideas, técnicas y arquitecturas explicadas en el wiki',
  Fuentes:    'Una página resumen por cada fuente ingerida',
  Respuestas: 'Respuestas archivadas del chat (vacío inicialmente)',
}

export default function WikiIndexPage() {
  const index = getIndex()
  const sections = [
    { title: 'Entidades',  pages: index.entidades  },
    { title: 'Conceptos',  pages: index.conceptos  },
    { title: 'Fuentes',    pages: index.fuentes    },
    { title: 'Respuestas', pages: index.respuestas },
  ]

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Wiki</h1>
        <p className="text-muted-foreground">Catálogo del conocimiento ingerido.</p>
      </header>

      {sections.map(s => (
        <section key={s.title} className="space-y-3">
          <h2 className="text-xl font-semibold">{s.title} <span className="text-muted-foreground text-base font-normal">({s.pages.length})</span></h2>
          <p className="text-sm text-muted-foreground">{SECTION_DESCS[s.title]}</p>
          {s.pages.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">Vacío</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {s.pages.map(p => (
                <Link key={p.slug} href={`/wiki/${p.slug}` as Route}>
                  <Card className="hover:bg-muted transition-colors h-full">
                    <CardHeader>
                      <CardTitle className="text-base">{p.frontmatter.titulo}</CardTitle>
                      {p.frontmatter.tags && (
                        <CardDescription className="text-xs">
                          {p.frontmatter.tags.slice(0, 3).join(' · ')}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
