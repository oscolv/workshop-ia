export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-12 py-6 text-sm text-muted-foreground">
      <div className="container mx-auto max-w-6xl px-4 flex flex-col md:flex-row justify-between gap-2">
        <span>Workshop IA — UAM Azcapotzalco · 2026</span>
        <span>
          Código MIT · Contenido CC BY 4.0 ·{' '}
          <a className="hover:underline" href="https://github.com/oscolv/workshop-ia">Repo</a>
        </span>
      </div>
    </footer>
  )
}
