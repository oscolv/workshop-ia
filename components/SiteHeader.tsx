'use client'
import Link from 'next/link'
import type { Route } from 'next'
import { useTheme } from 'next-themes'
import { Moon, Sun, BookOpen, Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'

const NAV: Array<{ href: Route; label: string }> = [
  { href: '/' as Route, label: 'Inicio' },
  { href: '/wiki' as Route, label: 'Wiki' },
  { href: '/chat' as Route, label: 'Chat' },
]

export function SiteHeader() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="container mx-auto max-w-6xl flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5" /> Workshop IA · LLM+Wiki
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {NAV.map(n => <Link key={n.href} href={n.href} className="hover:underline">{n.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Cambiar tema" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="h-4 w-4 dark:hidden" /> <Moon className="h-4 w-4 hidden dark:block" />
          </Button>
          <a href="https://github.com/oscolv/workshop-ia" target="_blank" rel="noreferrer" className="text-sm hover:underline hidden md:inline">GitHub</a>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú" onClick={() => setOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <nav className="flex flex-col gap-4 mt-8 text-base">
          {NAV.map(n => <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="hover:underline">{n.label}</Link>)}
          <a href="https://github.com/oscolv/workshop-ia" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
        </nav>
      </Sheet>
    </header>
  )
}
