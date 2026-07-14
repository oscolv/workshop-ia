import Link from 'next/link'
import type { Route } from 'next'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="text-center py-20 space-y-4">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-lg text-muted-foreground">Esa página no existe en este wiki.</p>
      <div className="flex justify-center gap-3 pt-4">
        <Button asChild><Link href="/wiki">Ir al índice</Link></Button>
        <Button asChild variant="outline"><Link href={'/chat' as Route}>Preguntarle al chat</Link></Button>
      </div>
    </div>
  )
}
