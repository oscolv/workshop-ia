import { Badge } from '@/components/ui/badge'
import type { WikiPage } from '@/lib/wiki'

export function PageHeader({ page }: { page: WikiPage }) {
  const fm = page.frontmatter
  return (
    <header className="mb-6 not-prose space-y-3 border-b border-border pb-4">
      <h1 className="text-3xl font-bold tracking-tight">{fm.titulo}</h1>
      <div className="flex flex-wrap gap-2 text-sm">
        <Badge>{fm.tipo}</Badge>
        {fm.fecha_actualizacion && <Badge variant="muted">actualizada {fm.fecha_actualizacion}</Badge>}
        {fm.tags?.map(t => <Badge key={t} variant="outline">{t}</Badge>)}
      </div>
      {fm.tipo === 'fuente' && (
        <div className="text-sm text-muted-foreground space-y-1">
          {fm.autores && <p><strong>Autores:</strong> {fm.autores.join(', ')}</p>}
          {fm.fecha_publicacion && <p><strong>Publicada:</strong> {fm.fecha_publicacion}</p>}
          {fm.url && <p><a className="text-accent hover:underline" href={fm.url} target="_blank" rel="noreferrer">{fm.url}</a></p>}
        </div>
      )}
    </header>
  )
}
