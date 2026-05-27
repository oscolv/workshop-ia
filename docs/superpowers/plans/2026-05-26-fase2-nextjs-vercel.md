# Fase 2 — Next.js + Vercel sobre LLM+Wiki — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una app Next.js 16 sobre el wiki de fase 1 que (a) renderiza las páginas con wikilinks y callouts Obsidian, (b) ofrece un chat agentic via Vercel AI Gateway con 3 tools read-only sobre el wiki, (c) se despliega público en Vercel con rate limit + BotID.

**Architecture:** App Router en el root del repo, coexistiendo con fase 1. `lib/wiki.ts` es la única puerta al filesystem del wiki; alimenta tanto las páginas estáticas (SSG) como las tools del chat. Chat usa AI SDK v6 + `streamText` + AI Gateway con Claude Sonnet 4.6 por default. UI con shadcn/ui + AI SDK Elements + Tailwind 4.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript estricto · Tailwind CSS 4 · shadcn/ui · AI SDK v6 (`ai`, `@ai-sdk/react`, `@ai-sdk/elements`, `@ai-sdk/gateway`) · `gray-matter` · `react-markdown` + `remark-gfm` + `rehype-callouts` · `botid` · `vitest` (tests de lib/) · pnpm via corepack.

**Reference spec:** `docs/superpowers/specs/2026-05-26-fase2-nextjs-vercel-design.md`

**Existing state (fase 1, no se toca):** `CLAUDE.md`, `README.md`, `LICENSE`, `.gitignore`, `.editorconfig`, `_config.yml`, `.claude/`, `raw/`, `wiki/`, `docs/`.

---

### Task 1: Scaffolding manual de Next.js + Tailwind 4

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `next-env.d.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `app/globals.css`
- Modify: `.gitignore` (añadir node_modules/, .next/, .vercel/, .env*.local)
- Create: `.env.example`

Scaffolding manual (no `create-next-app`) para no sobreescribir `README.md` y otros archivos de fase 1.

- [ ] **Step 1: Verificar que pnpm está disponible (activar via corepack si no)**

Run:
```bash
which pnpm || (corepack enable && corepack prepare pnpm@latest --activate)
pnpm --version
```
Expected: imprime un version string (ej. `9.x` o `10.x`).

- [ ] **Step 2: Verificar que no hay package.json existente**

Run:
```bash
test -f package.json && echo "EXISTS" || echo "OK"
```
Expected: `OK`.

- [ ] **Step 3: Crear `package.json`**

```json
{
  "name": "workshop-ia",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "ai": "^6.0.0",
    "@ai-sdk/react": "^2.0.0",
    "@ai-sdk/elements": "^1.0.0",
    "@ai-sdk/gateway": "^2.0.0",
    "zod": "^3.23.0",
    "gray-matter": "^4.0.3",
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "rehype-callouts": "^2.0.0",
    "rehype-sanitize": "^6.0.0",
    "next-themes": "^0.4.0",
    "lucide-react": "^0.460.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "botid": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.0",
    "vitest": "^2.1.0",
    "@vitejs/plugin-react": "^4.3.0"
  },
  "packageManager": "pnpm@10.0.0"
}
```

- [ ] **Step 4: Crear `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "wiki", "raw", "docs"]
}
```

- [ ] **Step 5: Crear `next.config.ts`**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
}

export default nextConfig
```

- [ ] **Step 6: Crear `next-env.d.ts`**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 7: Crear `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [],
}

export default config
```

- [ ] **Step 8: Crear `postcss.config.mjs`**

```js
export default {
  plugins: { '@tailwindcss/postcss': {} },
}
```

- [ ] **Step 9: Crear `app/globals.css`**

```css
@import "tailwindcss";

:root {
  --background: 48 33% 97%;
  --foreground: 220 13% 18%;
  --muted: 48 20% 92%;
  --muted-foreground: 220 9% 46%;
  --accent: 33 92% 51%;
  --accent-foreground: 0 0% 100%;
  --border: 48 15% 85%;
  --ring: 33 92% 51%;
}

.dark {
  --background: 25 15% 12%;
  --foreground: 48 20% 92%;
  --muted: 25 12% 18%;
  --muted-foreground: 48 10% 65%;
  --accent: 33 75% 55%;
  --accent-foreground: 25 15% 12%;
  --border: 25 12% 22%;
  --ring: 33 75% 55%;
}

@layer base {
  body { @apply bg-background text-foreground; }
  .bg-background { background-color: hsl(var(--background)); }
  .text-foreground { color: hsl(var(--foreground)); }
}
```

- [ ] **Step 10: Modificar `.gitignore`** — añadir entradas de Next/Vercel sin duplicar (las que ya están de fase 1: `node_modules/`, `.next/`, `.vercel/`)

Run:
```bash
cat .gitignore
```
Verifica que ya contiene `node_modules/`, `.next/`, `.vercel/`. Si SÍ ya están, añadir solo:
```
# Env locales (no commitear secrets)
.env*.local
```

Si no están, añadirlos también al final del archivo.

- [ ] **Step 11: Crear `.env.example`**

```bash
# Vercel AI Gateway — requerido para chat en producción
# Obtén una key en: vercel.com/dashboard/ai-gateway
AI_GATEWAY_API_KEY=

# Modelo default para el chat — formato "provider/model"
# Cambiable sin redeploy via vercel env
CHAT_MODEL=anthropic/claude-sonnet-4-6

# Rate limit del chat: mensajes/hora/IP
CHAT_RATE_LIMIT_PER_HOUR=10

# Vercel BotID — desactivar en local para no fricción
BOTID_ENABLED=false
```

- [ ] **Step 12: Instalar dependencias**

Run:
```bash
pnpm install
```
Expected: instala todas las deps, crea `pnpm-lock.yaml` y `node_modules/`. Puede tardar 30-60 segundos.

- [ ] **Step 13: Verificar que el typecheck pasa**

Run:
```bash
pnpm exec tsc --noEmit
```
Expected: sin errores (puede haber warnings de `@types/*` faltantes que se resuelven con `pnpm install`).

- [ ] **Step 14: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json next.config.ts next-env.d.ts \
        tailwind.config.ts postcss.config.mjs app/globals.css .gitignore .env.example
git commit -m "feat(fase2): scaffold Next.js 16 + Tailwind 4 + TypeScript estricto"
```

---

### Task 2: `lib/wiki.ts` — loader del filesystem (con tests)

**Files:**
- Create: `lib/wiki.ts`
- Create: `lib/wiki.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Crear `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'lib/**/*.test.tsx'],
  },
})
```

- [ ] **Step 2: Crear test fallando `lib/wiki.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { listPages, getPage, getIndex, search } from './wiki'

describe('lib/wiki', () => {
  it('listPages devuelve las 16 páginas de contenido del seed (4 fuentes + 5 entidades + 7 conceptos)', () => {
    const pages = listPages()
    expect(pages.length).toBe(16)
  })

  it('getPage("conceptos/transformer") devuelve la página con frontmatter correcto', () => {
    const page = getPage('conceptos/transformer')
    expect(page).not.toBeNull()
    expect(page!.frontmatter.titulo).toBe('Transformer')
    expect(page!.frontmatter.tipo).toBe('concepto')
    expect(page!.frontmatter.fuentes).toContain('2017-vaswani-attention')
    expect(page!.frontmatter.fuentes).toContain('2018-alammar-illustrated-transformer')
    expect(page!.body).toContain('Arquitectura de red neuronal')
  })

  it('getPage de slug inexistente devuelve null', () => {
    expect(getPage('conceptos/no-existe')).toBeNull()
  })

  it('getIndex agrupa por categoría', () => {
    const index = getIndex()
    expect(index.conceptos.length).toBe(7)
    expect(index.fuentes.length).toBe(4)
    expect(index.entidades.length).toBe(5)
    expect(index.respuestas.length).toBe(0)
  })

  it('search("RAG") encuentra al menos rag.md', () => {
    const results = search('RAG')
    const slugs = results.map(p => p.slug)
    expect(slugs).toContain('conceptos/rag')
  })

  it('search("transformer") rankea transformer.md alto', () => {
    const results = search('transformer')
    expect(results[0].slug).toBe('conceptos/transformer')
  })
})
```

- [ ] **Step 3: Correr el test (debe fallar)**

Run:
```bash
pnpm test
```
Expected: FAIL — `Cannot find module './wiki'` o similar.

- [ ] **Step 4: Crear `lib/wiki.ts`**

```ts
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { cache } from 'react'

export type WikiCategory = 'entidades' | 'conceptos' | 'fuentes' | 'respuestas'

export type WikiFrontmatter = {
  titulo: string
  tipo: 'concepto' | 'entidad' | 'fuente' | 'respuesta'
  fecha_creacion?: string
  fecha_actualizacion?: string
  fuentes?: string[]
  tags?: string[]
  autores?: string[]
  url?: string
  fecha_publicacion?: string
  formato_original?: string
}

export type WikiPage = {
  slug: string
  category: WikiCategory
  frontmatter: WikiFrontmatter
  body: string
}

const WIKI_DIR = path.join(process.cwd(), 'wiki')
const CATEGORIES: WikiCategory[] = ['entidades', 'conceptos', 'fuentes', 'respuestas']

function readAllPages(): WikiPage[] {
  const pages: WikiPage[] = []
  for (const category of CATEGORIES) {
    const dir = path.join(WIKI_DIR, category)
    if (!fs.existsSync(dir)) continue
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md') || file.startsWith('.')) continue
      const fullPath = path.join(dir, file)
      const raw = fs.readFileSync(fullPath, 'utf-8')
      const { data, content } = matter(raw)
      const slug = `${category}/${file.replace(/\.md$/, '')}`
      pages.push({
        slug,
        category,
        frontmatter: data as WikiFrontmatter,
        body: content.trimStart(),
      })
    }
  }
  return pages
}

export const listPages = cache((): WikiPage[] => readAllPages())

export const getPage = cache((slug: string): WikiPage | null => {
  return listPages().find(p => p.slug === slug) ?? null
})

export const getIndex = cache(() => {
  const pages = listPages()
  return {
    entidades:  pages.filter(p => p.category === 'entidades'),
    conceptos:  pages.filter(p => p.category === 'conceptos'),
    fuentes:    pages.filter(p => p.category === 'fuentes'),
    respuestas: pages.filter(p => p.category === 'respuestas'),
  }
})

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-záéíóúñü0-9]+/i).filter(t => t.length > 1)
}

export const search = cache((query: string): WikiPage[] => {
  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) return []
  const pages = listPages()

  const N = pages.length
  const df: Record<string, number> = {}
  const docTokens: string[][] = pages.map(p => {
    const tokens = tokenize(`${p.frontmatter.titulo} ${(p.frontmatter.tags ?? []).join(' ')} ${p.body}`)
    const unique = new Set(tokens)
    for (const t of unique) df[t] = (df[t] ?? 0) + 1
    return tokens
  })

  const avgdl = docTokens.reduce((s, d) => s + d.length, 0) / N
  const k1 = 1.5, b = 0.75

  const scored = pages.map((page, i) => {
    const tokens = docTokens[i]
    const tf: Record<string, number> = {}
    for (const t of tokens) tf[t] = (tf[t] ?? 0) + 1
    let score = 0
    for (const q of queryTokens) {
      const dfq = df[q] ?? 0
      if (dfq === 0) continue
      const idf = Math.log((N - dfq + 0.5) / (dfq + 0.5) + 1)
      const tfq = tf[q] ?? 0
      const denom = tfq + k1 * (1 - b + b * (tokens.length / avgdl))
      score += idf * (tfq * (k1 + 1)) / (denom || 1)
    }
    return { page, score }
  })

  return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).map(s => s.page)
})
```

- [ ] **Step 5: Correr el test (debe pasar)**

Run:
```bash
pnpm test
```
Expected: 6 tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/wiki.ts lib/wiki.test.ts vitest.config.ts
git commit -m "feat(fase2): lib/wiki.ts loader de filesystem + BM25 search con tests"
```

---

### Task 3: `lib/markdown.ts` — plugins remark/rehype para wikilinks (con tests)

**Files:**
- Create: `lib/markdown.ts`
- Create: `lib/markdown.test.ts`

- [ ] **Step 1: Crear test fallando `lib/markdown.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { remarkWikilinks } from './markdown'

function process(input: string): string {
  return String(
    unified()
      .use(remarkParse)
      .use(remarkWikilinks)
      .use(remarkStringify)
      .processSync(input)
  )
}

describe('remarkWikilinks', () => {
  it('convierte [[conceptos/transformer]] en link a /wiki/conceptos/transformer', () => {
    const out = process('Ver [[conceptos/transformer]] para más.')
    expect(out).toContain('[conceptos/transformer](/wiki/conceptos/transformer)')
  })

  it('soporta alias [[slug|texto visible]]', () => {
    const out = process('Más en [[conceptos/rag|RAG]].')
    expect(out).toContain('[RAG](/wiki/conceptos/rag)')
  })

  it('deja texto sin wikilinks intacto', () => {
    const out = process('Sin links aquí.')
    expect(out.trim()).toBe('Sin links aquí.')
  })

  it('procesa múltiples wikilinks en una línea', () => {
    const out = process('[[conceptos/rag]] y [[conceptos/transformer]].')
    expect(out).toContain('/wiki/conceptos/rag')
    expect(out).toContain('/wiki/conceptos/transformer')
  })

  it('ignora wikilinks dentro de code blocks', () => {
    const out = process('```\n[[no-conviertas]]\n```')
    expect(out).toContain('[[no-conviertas]]')
    expect(out).not.toContain('/wiki/no-conviertas')
  })
})
```

- [ ] **Step 2: Instalar deps de test (unified ya está como transitive, pero remark-stringify no)**

Run:
```bash
pnpm add -D unified remark-parse remark-stringify
```

- [ ] **Step 3: Correr el test (debe fallar)**

Run:
```bash
pnpm test lib/markdown.test.ts
```
Expected: FAIL — `Cannot find module './markdown'`.

- [ ] **Step 4: Crear `lib/markdown.ts`**

```ts
import { visit, SKIP } from 'unist-util-visit'
import type { Root, Text, Link } from 'mdast'

const WIKILINK_RE = /\[\[([^\]|#\n]+)(?:\|([^\]\n]+))?\]\]/g

export function remarkWikilinks() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || typeof index !== 'number') return
      if (parent.type === 'link') return
      const value = node.value
      WIKILINK_RE.lastIndex = 0
      if (!WIKILINK_RE.test(value)) return

      WIKILINK_RE.lastIndex = 0
      const newChildren: (Text | Link)[] = []
      let lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = WIKILINK_RE.exec(value)) !== null) {
        if (m.index > lastIndex) {
          newChildren.push({ type: 'text', value: value.slice(lastIndex, m.index) })
        }
        const slug = m[1].trim()
        const alias = m[2]?.trim()
        const url = `/wiki/${slug}`
        const text = alias ?? slug
        newChildren.push({
          type: 'link',
          url,
          children: [{ type: 'text', value: text }],
        } as Link)
        lastIndex = m.index + m[0].length
      }
      if (lastIndex < value.length) {
        newChildren.push({ type: 'text', value: value.slice(lastIndex) })
      }

      parent.children.splice(index, 1, ...newChildren)
      return [SKIP, index + newChildren.length]
    })
  }
}
```

- [ ] **Step 5: Instalar deps faltantes**

Run:
```bash
pnpm add unist-util-visit
pnpm add -D @types/mdast
```

- [ ] **Step 6: Correr el test (debe pasar)**

Run:
```bash
pnpm test lib/markdown.test.ts
```
Expected: 5 tests pass.

- [ ] **Step 7: Commit**

```bash
git add lib/markdown.ts lib/markdown.test.ts package.json pnpm-lock.yaml
git commit -m "feat(fase2): remarkWikilinks plugin con tests"
```

---

### Task 4: shadcn init + UI shell (layout, header, footer, theme)

**Files:**
- Create: `components.json`
- Create: `lib/utils.ts`
- Create: `components/ui/button.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/sheet.tsx`
- Create: `components/ui/scroll-area.tsx`
- Create: `components/ui/badge.tsx`
- Create: `components/theme-provider.tsx`
- Create: `components/SiteHeader.tsx`
- Create: `components/SiteFooter.tsx`
- Create: `app/layout.tsx`

Nota: shadcn primitives son archivos que se copian al repo (no son una dependencia versionada). Para mantener el plan auto-contenido, este task incluye el código exacto de los 5 primitives que usaremos. Si en el futuro necesitas más, instala con `pnpm dlx shadcn@latest add <name>`.

- [ ] **Step 1: Crear `components.json`** (config del CLI de shadcn para futura referencia)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/components/hooks"
  }
}
```

- [ ] **Step 2: Crear `lib/utils.ts`** (helper estándar de shadcn)

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 3: Crear `components/ui/button.tsx`**

```tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-accent text-accent-foreground hover:opacity-90',
        outline: 'border border-border bg-background hover:bg-muted',
        ghost: 'hover:bg-muted',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'
```

- [ ] **Step 4: Crear `components/ui/card.tsx`**

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-lg border border-border bg-background text-foreground shadow-sm', className)} {...props} />
  )
)
Card.displayName = 'Card'

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'
```

- [ ] **Step 5: Crear `components/ui/badge.tsx`**

```tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-accent text-accent-foreground',
        outline: 'border-border text-foreground',
        muted: 'border-transparent bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
```

- [ ] **Step 6: Crear `components/ui/scroll-area.tsx`** (stub usando overflow nativo; primitive real de shadcn usa Radix, lo añadimos cuando lo necesitemos)

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export function ScrollArea({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('overflow-y-auto', className)} {...props}>
      {children}
    </div>
  )
}
```

- [ ] **Step 7: Crear `components/ui/sheet.tsx`** (drawer mobile, stub minimal con `<dialog>` nativo)

```tsx
'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

export function Sheet({ open, onClose, children, side = 'left' }: { open: boolean; onClose: () => void; children: React.ReactNode; side?: 'left' | 'right' }) {
  const ref = React.useRef<HTMLDialogElement>(null)
  React.useEffect(() => {
    if (open) ref.current?.showModal()
    else ref.current?.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
      className={cn(
        'm-0 h-full max-h-full w-80 max-w-[80vw] bg-background text-foreground p-4 backdrop:bg-black/40',
        side === 'left' ? 'mr-auto' : 'ml-auto'
      )}
    >
      {children}
    </dialog>
  )
}
```

- [ ] **Step 8: Instalar deps adicionales**

Run:
```bash
pnpm add @radix-ui/react-slot
```

- [ ] **Step 9: Crear `components/theme-provider.tsx`**

```tsx
'use client'
import * as React from 'react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

- [ ] **Step 10: Crear `components/SiteHeader.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Moon, Sun, BookOpen, Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/wiki', label: 'Wiki' },
  { href: '/chat', label: 'Chat' },
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
```

- [ ] **Step 11: Crear `components/SiteFooter.tsx`**

```tsx
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
```

- [ ] **Step 12: Crear `app/layout.tsx`**

```tsx
import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'Workshop IA · LLM+Wiki',
  description: 'Implementación de referencia del patrón LLM+Wiki para el Taller IA (UAM Azcapotzalco)',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteHeader />
          <main className="container mx-auto px-4 py-6 max-w-6xl flex-1">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 13: Crear stub temporal `app/page.tsx`** para que el build no falle

```tsx
export default function HomePage() {
  return <div>Home placeholder — implementado en Task 5</div>
}
```

- [ ] **Step 14: Verificar que el build pasa**

Run:
```bash
pnpm build
```
Expected: build exitoso, sin errores. Warnings de "no images optimized" o similar son OK.

- [ ] **Step 15: Commit**

```bash
git add components.json lib/utils.ts components/ app/layout.tsx app/page.tsx package.json pnpm-lock.yaml
git commit -m "feat(fase2): shell de UI (layout, header, footer, theme, shadcn primitives)"
```

---

### Task 5: Home page `/`

**Files:**
- Modify: `app/page.tsx` (reemplazar el stub de Task 4)

- [ ] **Step 1: Reemplazar `app/page.tsx`** con la home real

```tsx
import Link from 'next/link'
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
          <Button asChild size="lg" variant="outline"><Link href="/chat">Preguntarle al wiki</Link></Button>
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
```

- [ ] **Step 2: Verificar render en dev**

Run (en background):
```bash
pnpm dev &
sleep 5
curl -s http://localhost:3000 | grep -E "Conceptos|Fuentes|Entidades|construye" | head -5
kill %1
```
Expected: ve referencias a "Conceptos", "Fuentes", "Entidades", y la palabra "construye". Si no aparecen, el SSR falló.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(fase2): home page con hero, stats y 'cómo funciona'"
```

---

### Task 6: Wiki index `/wiki` + sidebar

**Files:**
- Create: `app/wiki/layout.tsx`
- Create: `app/wiki/page.tsx`
- Create: `components/wiki/WikiSidebar.tsx`

- [ ] **Step 1: Crear `components/wiki/WikiSidebar.tsx`**

```tsx
import Link from 'next/link'
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
                <Link href={`/wiki/${p.slug}`} className="hover:underline text-foreground">
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
```

- [ ] **Step 2: Crear `app/wiki/layout.tsx`**

```tsx
import { WikiSidebar } from '@/components/wiki/WikiSidebar'

export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
      <div className="hidden md:block">
        <WikiSidebar />
      </div>
      <div>{children}</div>
    </div>
  )
}
```

- [ ] **Step 3: Crear `app/wiki/page.tsx`**

```tsx
import Link from 'next/link'
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
                <Link key={p.slug} href={`/wiki/${p.slug}`}>
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
```

- [ ] **Step 4: Verificar build y render**

Run:
```bash
pnpm build 2>&1 | tail -10
```
Expected: build pasa. La salida debe mencionar `/wiki` como ruta generada.

- [ ] **Step 5: Commit**

```bash
git add app/wiki components/wiki/WikiSidebar.tsx
git commit -m "feat(fase2): /wiki índice con cards por categoría + sidebar"
```

---

### Task 7: Wiki dynamic page `/wiki/[...slug]` + MarkdownRenderer + PageHeader

**Files:**
- Create: `components/wiki/MarkdownRenderer.tsx`
- Create: `components/wiki/PageHeader.tsx`
- Create: `app/wiki/[...slug]/page.tsx`

- [ ] **Step 1: Crear `components/wiki/MarkdownRenderer.tsx`**

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeCallouts from 'rehype-callouts'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import Link from 'next/link'
import { remarkWikilinks } from '@/lib/markdown'

// Schema permisivo: permite class+role en aside (callouts) + atributos típicos
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    aside: [...(defaultSchema.attributes?.aside ?? []), 'className', 'role', 'aria-label', 'aria-labelledby'],
    div: [...(defaultSchema.attributes?.div ?? []), 'className'],
    span: [...(defaultSchema.attributes?.span ?? []), 'className'],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), 'aside'],
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-code:bg-muted prose-code:rounded prose-code:px-1">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkWikilinks]}
        rehypePlugins={[rehypeCallouts, [rehypeSanitize, schema]]}
        components={{
          a: ({ href, children, ...props }) => {
            if (href?.startsWith('/wiki/')) {
              return <Link href={href} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</Link>
            }
            return <a href={href} target="_blank" rel="noreferrer" {...props}>{children}</a>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

- [ ] **Step 2: Instalar `@tailwindcss/typography` para `prose`**

Run:
```bash
pnpm add -D @tailwindcss/typography
```

Y modificar `tailwind.config.ts` para incluirlo:

```ts
import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [typography],
}

export default config
```

- [ ] **Step 3: Crear `components/wiki/PageHeader.tsx`**

```tsx
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
```

- [ ] **Step 4: Crear `app/wiki/[...slug]/page.tsx`**

```tsx
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
```

- [ ] **Step 5: Verificar build genera todas las rutas estáticas**

Run:
```bash
pnpm build 2>&1 | grep -E '/wiki/' | head -20
```
Expected: ≥16 líneas, una por cada página del wiki bajo `/wiki/<categoría>/<slug>`.

- [ ] **Step 6: Test manual con `curl`**

Run:
```bash
pnpm dev &
sleep 5
curl -s http://localhost:3000/wiki/conceptos/transformer | grep -E 'Transformer|atencion|encoder' | head -3
curl -s http://localhost:3000/wiki/conceptos/rlhf | grep -i 'contradicción' | head -2
kill %1
```
Expected: el primer comando ve referencias al contenido de Transformer; el segundo encuentra el callout de contradicción.

- [ ] **Step 7: Commit**

```bash
git add components/wiki/MarkdownRenderer.tsx components/wiki/PageHeader.tsx \
        app/wiki/\[...slug\]/page.tsx tailwind.config.ts package.json pnpm-lock.yaml
git commit -m "feat(fase2): página dinámica /wiki/[...slug] con MarkdownRenderer + PageHeader"
```

---

### Task 8: 404 page

**Files:**
- Create: `app/not-found.tsx`

- [ ] **Step 1: Crear `app/not-found.tsx`**

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="text-center py-20 space-y-4">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-lg text-muted-foreground">Esa página no existe en este wiki.</p>
      <div className="flex justify-center gap-3 pt-4">
        <Button asChild><Link href="/wiki">Ir al índice</Link></Button>
        <Button asChild variant="outline"><Link href="/chat">Preguntarle al chat</Link></Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/not-found.tsx
git commit -m "feat(fase2): not-found.tsx con links a wiki y chat"
```

---

### Task 9: `lib/tools.ts` — tools del agente con tests

**Files:**
- Create: `lib/tools.ts`
- Create: `lib/tools.test.ts`

- [ ] **Step 1: Crear test fallando `lib/tools.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { tools } from './tools'

describe('lib/tools', () => {
  it('listar_paginas devuelve las 4 categorías', async () => {
    const result = await tools.listar_paginas.execute({}, {} as any)
    expect(result).toHaveProperty('entidades')
    expect(result).toHaveProperty('conceptos')
    expect(result).toHaveProperty('fuentes')
    expect(result).toHaveProperty('respuestas')
    expect(result.conceptos.length).toBe(7)
  })

  it('leer_pagina("conceptos/transformer") devuelve frontmatter + body', async () => {
    const result = await tools.leer_pagina.execute({ slug: 'conceptos/transformer' }, {} as any)
    expect(result).toHaveProperty('frontmatter')
    expect(result).toHaveProperty('body')
    if (!('error' in result)) {
      expect(result.frontmatter.titulo).toBe('Transformer')
      expect(result.body).toContain('Arquitectura')
    }
  })

  it('leer_pagina("noexiste") devuelve error', async () => {
    const result = await tools.leer_pagina.execute({ slug: 'noexiste' }, {} as any)
    expect(result).toHaveProperty('error')
  })

  it('buscar("RAG") devuelve resultados que incluyen conceptos/rag', async () => {
    const result = await tools.buscar.execute({ query: 'RAG' }, {} as any)
    expect(result.length).toBeGreaterThan(0)
    expect(result.map(r => r.slug)).toContain('conceptos/rag')
  })
})
```

- [ ] **Step 2: Correr el test (debe fallar)**

Run:
```bash
pnpm test lib/tools.test.ts
```
Expected: FAIL — `Cannot find module './tools'`.

- [ ] **Step 3: Crear `lib/tools.ts`**

```ts
import { tool } from 'ai'
import { z } from 'zod'
import { listPages, getPage, search, getIndex } from './wiki'

export const tools = {
  listar_paginas: tool({
    description: 'Lista todas las páginas del wiki agrupadas por categoría (entidades, conceptos, fuentes, respuestas). Úsalo PRIMERO antes de cualquier otra tool, para entender qué hay disponible.',
    inputSchema: z.object({}),
    execute: async () => {
      const index = getIndex()
      return {
        entidades:  index.entidades.map(p => ({ slug: p.slug, titulo: p.frontmatter.titulo })),
        conceptos:  index.conceptos.map(p => ({ slug: p.slug, titulo: p.frontmatter.titulo, tags: p.frontmatter.tags })),
        fuentes:    index.fuentes.map(p => ({ slug: p.slug, titulo: p.frontmatter.titulo, autores: p.frontmatter.autores })),
        respuestas: index.respuestas.map(p => ({ slug: p.slug, titulo: p.frontmatter.titulo })),
      }
    },
  }),

  leer_pagina: tool({
    description: 'Lee el contenido completo de una página dado su slug. Ej: "conceptos/transformer", "fuentes/2017-vaswani-attention", "entidades/openai".',
    inputSchema: z.object({
      slug: z.string().describe('Slug de la página (categoría/nombre, ej. "conceptos/transformer")'),
    }),
    execute: async ({ slug }) => {
      const page = getPage(slug)
      if (!page) return { error: `No existe página con slug "${slug}". Usa listar_paginas para ver las disponibles.` }
      return { frontmatter: page.frontmatter, body: page.body }
    },
  }),

  buscar: tool({
    description: 'Busca en el wiki por texto (BM25 sobre títulos, tags y body). Útil para preguntas exploratorias antes de leer páginas específicas.',
    inputSchema: z.object({
      query: z.string().describe('Términos de búsqueda en español o inglés'),
    }),
    execute: async ({ query }) => {
      const results = search(query)
      return results.slice(0, 5).map(p => ({
        slug: p.slug,
        titulo: p.frontmatter.titulo,
        snippet: p.body.slice(0, 200),
      }))
    },
  }),
}
```

- [ ] **Step 4: Correr el test (debe pasar)**

Run:
```bash
pnpm test lib/tools.test.ts
```
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/tools.ts lib/tools.test.ts
git commit -m "feat(fase2): lib/tools.ts con 3 tools del agente (listar/leer/buscar) y tests"
```

---

### Task 10: `lib/rate-limit.ts` con tests

**Files:**
- Create: `lib/rate-limit.ts`
- Create: `lib/rate-limit.test.ts`

- [ ] **Step 1: Crear test fallando**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { _resetForTest, rateLimit } from './rate-limit'

describe('rateLimit', () => {
  beforeEach(() => {
    _resetForTest()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-26T12:00:00Z'))
  })

  it('permite hasta `limit` requests en la ventana', async () => {
    for (let i = 0; i < 3; i++) {
      expect(await rateLimit('k', { limit: 3, windowSec: 60 })).toBe(true)
    }
  })

  it('bloquea la (limit+1)-ésima request', async () => {
    for (let i = 0; i < 3; i++) await rateLimit('k', { limit: 3, windowSec: 60 })
    expect(await rateLimit('k', { limit: 3, windowSec: 60 })).toBe(false)
  })

  it('vuelve a permitir cuando la ventana expira', async () => {
    for (let i = 0; i < 3; i++) await rateLimit('k', { limit: 3, windowSec: 60 })
    expect(await rateLimit('k', { limit: 3, windowSec: 60 })).toBe(false)
    vi.advanceTimersByTime(61_000)
    expect(await rateLimit('k', { limit: 3, windowSec: 60 })).toBe(true)
  })

  it('keys distintas no interfieren', async () => {
    for (let i = 0; i < 3; i++) await rateLimit('a', { limit: 3, windowSec: 60 })
    expect(await rateLimit('a', { limit: 3, windowSec: 60 })).toBe(false)
    expect(await rateLimit('b', { limit: 3, windowSec: 60 })).toBe(true)
  })
})
```

- [ ] **Step 2: Correr el test (debe fallar)**

Run:
```bash
pnpm test lib/rate-limit.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Crear `lib/rate-limit.ts`** (in-memory por simplicidad; Vercel Fluid Compute reusa instancias así que sobrevive entre requests del mismo region)

```ts
type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export type RateLimitOptions = { limit: number; windowSec: number }

export async function rateLimit(key: string, { limit, windowSec }: RateLimitOptions): Promise<boolean> {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSec * 1000 })
    return true
  }
  if (bucket.count >= limit) return false
  bucket.count += 1
  return true
}

/** Solo para tests. */
export function _resetForTest() {
  buckets.clear()
}
```

- [ ] **Step 4: Correr el test (debe pasar)**

Run:
```bash
pnpm test lib/rate-limit.test.ts
```
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/rate-limit.ts lib/rate-limit.test.ts
git commit -m "feat(fase2): rate limit in-memory por key con tests"
```

---

### Task 11: System prompt + API route del chat

**Files:**
- Create: `lib/prompts.ts`
- Create: `app/api/chat/route.ts`

- [ ] **Step 1: Crear `lib/prompts.ts`**

```ts
export function systemPrompt(): string {
  return `Eres un asistente que responde preguntas usando exclusivamente el wiki
de este repositorio (un wiki sobre fundamentos de LLMs, en español, generado
con el patrón LLM+Wiki del Taller IA).

PROTOCOLO:
1. Empieza llamando \`listar_paginas\` para ver qué hay disponible.
2. Identifica páginas relevantes a la pregunta. Si no es obvio, usa \`buscar\`.
3. Lee las páginas relevantes con \`leer_pagina\` (puedes leer varias).
4. Sintetiza la respuesta en español.
5. **Cita siempre** con el formato markdown wikilink: \`(ver [[conceptos/transformer]])\`.
   La UI los renderiza como enlaces clickeables al wiki.
6. Si la pregunta no se puede responder con el wiki, dilo explícitamente y
   sugiere qué fuente faltaría ingerir.

NO inventes información que no esté en las páginas. Si una página tiene un
callout > [!contradicción], menciona la tensión en tu respuesta — no la ocultes.

Idioma: responde siempre en español, aunque la pregunta venga en inglés.`
}
```

- [ ] **Step 2: Crear `app/api/chat/route.ts`**

```ts
import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { checkBotId } from 'botid/server'
import { tools } from '@/lib/tools'
import { systemPrompt } from '@/lib/prompts'
import { rateLimit } from '@/lib/rate-limit'

export const maxDuration = 60

export async function POST(req: Request) {
  if (process.env.BOTID_ENABLED === 'true') {
    const bot = await checkBotId()
    if (bot.isBot) return new Response('Bot detected', { status: 403 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anon'
  const limit = Number(process.env.CHAT_RATE_LIMIT_PER_HOUR ?? 10)
  const ok = await rateLimit(`chat:${ip}`, { limit, windowSec: 3600 })
  if (!ok) {
    return new Response(JSON.stringify({ error: `Has hecho ${limit} preguntas esta hora. Vuelve en una hora o corre el repo en local con tu propia API key.` }), {
      status: 429,
      headers: { 'content-type': 'application/json' },
    })
  }

  const { messages }: { messages: UIMessage[] } = await req.json()
  const model = process.env.CHAT_MODEL ?? 'anthropic/claude-sonnet-4-6'

  const result = streamText({
    model: gateway(model),
    system: systemPrompt(),
    messages: convertToModelMessages(messages),
    tools,
    stopWhen: { steps: 8 },
  })

  return result.toUIMessageStreamResponse()
}
```

- [ ] **Step 3: Verificar typecheck**

Run:
```bash
pnpm exec tsc --noEmit
```
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add lib/prompts.ts app/api/chat/route.ts
git commit -m "feat(fase2): API route /api/chat con AI Gateway + BotID + rate limit"
```

---

### Task 12: ChatPanel + página `/chat`

**Files:**
- Create: `components/chat/ChatPanel.tsx`
- Create: `app/chat/page.tsx`

- [ ] **Step 1: Crear `components/chat/ChatPanel.tsx`**

```tsx
'use client'
import { useChat } from '@ai-sdk/react'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@ai-sdk/elements/conversation'
import { Message, MessageContent } from '@ai-sdk/elements/message'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from '@ai-sdk/elements/prompt-input'
import { Tool, ToolHeader, ToolContent } from '@ai-sdk/elements/tool'
import { MarkdownRenderer } from '@/components/wiki/MarkdownRenderer'

const EXAMPLE_PROMPTS = [
  '¿Qué es RAG y cómo se relaciona con el Transformer?',
  '¿Cuál es la diferencia entre fine-tuning y RLHF?',
  'Resume las contradicciones marcadas en el wiki.',
]

export function ChatPanel() {
  const { messages, sendMessage, status } = useChat()

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-4">
      <Conversation className="flex-1 border border-border rounded-lg" aria-live="polite">
        <ConversationContent>
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground space-y-3 p-4">
              <p>Pregunta lo que quieras sobre el wiki. Algunos ejemplos:</p>
              <ul className="space-y-1">
                {EXAMPLE_PROMPTS.map(p => (
                  <li key={p}>
                    <button
                      type="button"
                      className="text-accent hover:underline text-left"
                      onClick={() => sendMessage({ text: p })}
                    >
                      → {p}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {messages.map(m => (
            <Message key={m.id} from={m.role}>
              <MessageContent>
                {m.parts.map((part, i) => {
                  if (part.type === 'text') {
                    return <MarkdownRenderer key={i} content={part.text} />
                  }
                  if (part.type.startsWith('tool-')) {
                    return (
                      <Tool key={i} defaultOpen={false}>
                        <ToolHeader type={part.type as `tool-${string}`} state={(part as any).state} />
                        <ToolContent input={(part as any).input} output={(part as any).output} />
                      </Tool>
                    )
                  }
                  return null
                })}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput
        onSubmit={({ text }) => {
          if (text) sendMessage({ text })
        }}
      >
        <PromptInputTextarea placeholder="¿Qué es RAG? ¿Cómo se relaciona InstructGPT con el Transformer?" />
        <PromptInputSubmit status={status} />
      </PromptInput>
    </div>
  )
}
```

- [ ] **Step 2: Crear `app/chat/page.tsx`**

```tsx
import { ChatPanel } from '@/components/chat/ChatPanel'

export const metadata = { title: 'Chat · Workshop IA' }

export default function ChatPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
        <p className="text-muted-foreground">
          Pregúntale al agente. Solo responde a partir del wiki — sin alucinaciones añadidas.
          Cada turn puedes ver qué páginas leyó (los bloques colapsados de tool calls).
        </p>
      </header>
      <ChatPanel />
    </div>
  )
}
```

- [ ] **Step 3: Verificar build**

Run:
```bash
pnpm build 2>&1 | tail -15
```
Expected: build pasa, ruta `/chat` aparece como server-rendered (no static), ruta `/api/chat` aparece como dynamic.

- [ ] **Step 4: Commit**

```bash
git add components/chat app/chat
git commit -m "feat(fase2): ChatPanel con AI SDK Elements + página /chat con ejemplos"
```

---

### Task 13: `vercel.ts` + README update + `.env.example` doc

**Files:**
- Create: `vercel.ts`
- Modify: `README.md` (añadir sección sobre el deploy web)

- [ ] **Step 1: Crear `vercel.ts`**

```ts
import type { VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'pnpm build',
  installCommand: 'pnpm install',
}
```

- [ ] **Step 2: Instalar `@vercel/config`**

Run:
```bash
pnpm add -D @vercel/config
```

- [ ] **Step 3: Añadir sección al `README.md`**

Insertar este bloque DESPUÉS de la sección "## Fase 2 — Despliegue en Vercel (próximamente en el taller)" y ANTES de "## `docs/superpowers/` — artefactos del diseño". Reemplaza la sección actual (que dice "próximamente") con esto:

```markdown
## Fase 2 — App web (Next.js + Vercel)

Ya implementada. La app vive en `app/`, `components/`, `lib/` al mismo root
que el wiki. Lee `wiki/` directamente desde el filesystem.

### Correr en local

```bash
corepack enable    # si pnpm no está instalado
pnpm install
pnpm dev           # http://localhost:3000
```

Tres rutas:
- `/` — landing con stats del wiki
- `/wiki` — índice navegable; cada página renderiza wikilinks y callouts
- `/chat` — conversación contra el wiki vía Claude Sonnet 4.6 + tool calling

### Variables de entorno

Copia `.env.example` a `.env.local` y rellena (chat solo funciona con
`AI_GATEWAY_API_KEY` configurada):

| Variable | Para qué |
|---|---|
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key (vercel.com/dashboard/ai-gateway) |
| `CHAT_MODEL` | Modelo default. Ej: `anthropic/claude-sonnet-4-6` |
| `CHAT_RATE_LIMIT_PER_HOUR` | Mensajes/hora/IP (default 10) |
| `BOTID_ENABLED` | `true` en producción; `false` en local |

### Deploy a Vercel

```bash
vercel link                # asocia repo a project
vercel env add AI_GATEWAY_API_KEY production
vercel env add CHAT_MODEL production
vercel deploy --prod
```

Push a `main` dispara redeploy automático (cuando el repo está linkeado).
```

- [ ] **Step 4: Commit**

```bash
git add vercel.ts README.md package.json pnpm-lock.yaml
git commit -m "docs(fase2): vercel.ts + README con instrucciones de la app web"
```

---

### Task 14: Verificación end-to-end

**Files:** ninguno nuevo (solo checks)

- [ ] **Step 1: Typecheck pasa sin errores**

Run:
```bash
pnpm exec tsc --noEmit
```
Expected: sin errores.

- [ ] **Step 2: Todos los tests de lib/ pasan**

Run:
```bash
pnpm test
```
Expected: 19 tests pasan (6 wiki + 5 markdown + 4 tools + 4 rate-limit).

- [ ] **Step 3: Build de producción pasa**

Run:
```bash
pnpm build 2>&1 | tail -30
```
Expected:
- Build exitoso
- ≥18 rutas estáticas bajo `/wiki/`
- `/`, `/wiki`, `/chat` listadas
- `/api/chat` como dynamic / server function

- [ ] **Step 4: Smoke test del dev server — home y wiki**

Run:
```bash
pnpm dev &
DEV_PID=$!
sleep 6

curl -sf http://localhost:3000 > /dev/null && echo "/ OK"            || echo "/ FAIL"
curl -sf http://localhost:3000/wiki > /dev/null && echo "/wiki OK"   || echo "/wiki FAIL"
curl -sf http://localhost:3000/wiki/conceptos/transformer > /dev/null && echo "/wiki/conceptos/transformer OK" || echo "FAIL"
curl -sf http://localhost:3000/wiki/conceptos/rlhf > /dev/null && echo "/wiki/conceptos/rlhf OK" || echo "FAIL"
curl -sf http://localhost:3000/chat > /dev/null && echo "/chat OK"   || echo "/chat FAIL"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/wiki/no-existe   # esperado: 404

kill $DEV_PID 2>/dev/null
wait $DEV_PID 2>/dev/null
```
Expected: 5 OK + un `404`.

- [ ] **Step 5: Verificar wikilinks resueltos en HTML servido**

Run:
```bash
pnpm dev &
DEV_PID=$!
sleep 6

# Wikilinks en transformer.md deberían rendear como <a href="/wiki/...">
curl -s http://localhost:3000/wiki/conceptos/transformer | grep -oE 'href="/wiki/[^"]+"' | head -5

# Callout de contradicción en rlhf.md debería estar dentro de un <aside>
curl -s http://localhost:3000/wiki/conceptos/rlhf | grep -o '<aside[^>]*>' | head -2

kill $DEV_PID 2>/dev/null
wait $DEV_PID 2>/dev/null
```
Expected: al menos 3 enlaces a `/wiki/...` en transformer; al menos 1 `<aside>` en rlhf.

- [ ] **Step 6: Smoke test del endpoint de chat (sin API key real — solo verificar shape)**

Run:
```bash
pnpm dev &
DEV_PID=$!
sleep 6

# Sin API key → debería devolver 500 o error claro. Pero la ruta debe responder.
curl -s -o /tmp/chat-resp.txt -w "status=%{http_code}\n" -X POST \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hi"}]}' \
  http://localhost:3000/api/chat

cat /tmp/chat-resp.txt | head -5

kill $DEV_PID 2>/dev/null
wait $DEV_PID 2>/dev/null
```
Expected: `status=` con un 200, 500 o 401 (depende de si AI_GATEWAY_API_KEY está en `.env.local`). Lo que NO esperamos: 404 (significaría que la ruta no existe) o 405 (POST no permitido).

- [ ] **Step 7: Smoke test del rate limit**

Run:
```bash
pnpm dev &
DEV_PID=$!
sleep 6

# Sobrepasar el límite (default 10/hora). 11 requests rápidas:
for i in $(seq 1 11); do
  curl -s -o /dev/null -w "$i: %{http_code}\n" -X POST \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"hi"}]}' \
    http://localhost:3000/api/chat
done

kill $DEV_PID 2>/dev/null
wait $DEV_PID 2>/dev/null
```
Expected: los primeros 10 devuelven algún código no-429; el 11 devuelve `429`.

- [ ] **Step 8: Manual checks (deferred al usuario)**

Estos requieren ojo humano y/o `AI_GATEWAY_API_KEY` configurada:

- [ ] Abrir `http://localhost:3000` y verificar que el diseño se ve bien (light + dark mode toggle funciona)
- [ ] Navegar `/wiki/conceptos/transformer` y confirmar visualmente que wikilinks son clickeables y llevan a la página correcta
- [ ] Navegar `/wiki/conceptos/rlhf` y confirmar visualmente que el callout `> [!contradicción]` se ve con estilo (no es solo un blockquote)
- [ ] Con `AI_GATEWAY_API_KEY` en `.env.local`, abrir `/chat` y preguntar "¿Qué es RAG?" — verificar que (1) responde en español, (2) muestra tool calls colapsadas, (3) cita con wikilinks clickeables, (4) el streaming funciona token-por-token
- [ ] Probar en móvil (DevTools responsive) — sidebar de wiki pasa a drawer, chat funciona, header colapsa

- [ ] **Step 9: Resumen final**

Run:
```bash
git log --oneline | wc -l
git ls-files | wc -l
echo "Tasks completed: 14/14"
echo "Spec: docs/superpowers/specs/2026-05-26-fase2-nextjs-vercel-design.md"
echo "Plan: docs/superpowers/plans/2026-05-26-fase2-nextjs-vercel.md"
```
Imprime el conteo total y confirma cierre.

---

## Notas para el ejecutor

- **Si un test falla**, no avances. Resuélvelo: lee el error, ajusta el código, re-corre.
- **Si una install de pnpm tarda mucho**, OK — la primera vez baja muchas deps (Next.js + AI SDK + plugins ≈ 200 MB).
- **El SSG falla en el build si una página del wiki tiene frontmatter inválida.** Si pasa, abre el `.md` ofensor y verifica YAML.
- **El chat endpoint requiere `AI_GATEWAY_API_KEY`** para hacer llamadas reales al LLM. Sin ella, los smoke tests funcionan pero el chat no responde texto.
- **Versiones de paquetes en `package.json` son `^`** (rangos). Si una versión major sale rota durante la implementación, fija con `pnpm add pkg@x.y.z`.
- **Tipos de AI SDK v6 (`UIMessage`, `convertToModelMessages`) pueden cambiar** entre minor releases. Si typecheck falla en `app/api/chat/route.ts`, revisa los exports actuales de `ai` con `pnpm why ai`.
