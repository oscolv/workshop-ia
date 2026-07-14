import { wikiConfig } from '@/wiki.config'

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-12 py-6 text-sm text-muted-foreground">
      <div className="container mx-auto max-w-6xl px-4 flex flex-col md:flex-row justify-between gap-2">
        <span>{wikiConfig.footer.atribucion}</span>
        <span>
          {wikiConfig.footer.licencia} ·{' '}
          <a className="hover:underline" href={wikiConfig.githubUrl}>Repo</a>
        </span>
      </div>
    </footer>
  )
}
