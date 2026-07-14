import { notFound } from 'next/navigation'
import { listPages, getPage } from '@/lib/wiki'
import { MarkdownRenderer } from '@/components/wiki/MarkdownRenderer'
import { PageHeader } from '@/components/wiki/PageHeader'

export function generateStaticParams() {
  return listPages().map(p => ({ slug: p.slug.split('/') }))
}

// Next.js 15+: `params` es Promise — hay que await.
export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const page = getPage(slug.join('/'))
  if (!page) return { title: 'No encontrado' }
  return { title: `${page.frontmatter.titulo} · Workshop IA` }
}

export default async function WikiSlugPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const page = getPage(slug.join('/'))
  if (!page) notFound()
  return (
    <article>
      <PageHeader page={page} />
      <MarkdownRenderer content={page.body} />
    </article>
  )
}
