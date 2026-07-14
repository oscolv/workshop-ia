import Link from 'next/link'
import type { Route } from 'next'
import { getIndex } from '@/lib/wiki'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, MessageCircle, Network } from 'lucide-react'

export default function HomePage() {
  const index = getIndex()
  const stats = [
    { label: 'Conceptos', value: index.conceptos.length },
    { label: 'Fuentes',   value: index.fuentes.length },
    { label: 'Entidades', value: index.entidades.length },
  ]

  return (
    <div className="space-y-12">
      <section className="space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Una base de conocimiento que tu agente LLM <em>construye</em>.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Implementación de referencia del patrón <strong>LLM+Wiki</strong>: en vez de
          que la IA re-procese tus fuentes en cada pregunta, las acumula en un wiki
          markdown que crece y se mantiene solo. Tú curas; el agente escribe.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild size="lg"><Link href="/wiki">Explorar wiki →</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href={'/chat' as Route}>Preguntarle al wiki</Link></Button>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-4xl">{s.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <BookOpen className="h-5 w-5 mb-2 text-accent" />
            <CardTitle>Tú curas las fuentes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Drop papers, artículos, notas en <code>raw/</code>. Inmutables.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Network className="h-5 w-5 mb-2 text-accent" />
            <CardTitle>El agente escribe el wiki</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Cross-references, callouts de contradicción, frontmatter — todo en
            markdown en <code>wiki/</code>.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <MessageCircle className="h-5 w-5 mb-2 text-accent" />
            <CardTitle>Pregunta o navega</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Lee páginas, sigue los enlaces, o chatea con el agente (que usa el
            mismo wiki como base).
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
