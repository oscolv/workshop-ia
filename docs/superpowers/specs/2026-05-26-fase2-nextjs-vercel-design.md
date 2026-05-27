# Fase 2 — Next.js + Vercel sobre LLM+Wiki (diseño)

**Fecha:** 2026-05-26
**Autor:** Oscar (Taller IA, UAM Azcapotzalco)
**Estado:** aprobado para implementación
**Depende de:** spec de fase 1 (`2026-05-26-llm-wiki-reference-design.md`) ya implementada y desplegada en `github.com/oscolv/workshop-ia`

## Propósito

Construir una aplicación web encima del wiki de fase 1 con dos capacidades:
1. **Browse** — navegar las páginas del wiki en HTML con render correcto de wikilinks y callouts (lo que Jekyll/Cayman no logra).
2. **Chat** — preguntar al wiki via un agente LLM que usa tool calling para leer páginas, replicando la lógica de Claude Code en local pero accesible desde cualquier navegador.

Desplegado público en Vercel. Pensado para el Taller IA — atendidos lo usan en vivo, lo forkean, y aprenden el patrón Next.js + AI SDK + AI Gateway en el proceso.

## Decisiones de diseño

| Decisión | Valor |
|---|---|
| Ubicación de la app | Mismo repo `workshop-ia`, mismo root. Coexiste con fase 1. |
| Alcance | Browse + Chat en una iteración, un solo spec. |
| Modelo de despliegue | Público con rate limit (autor paga tokens, costo capado) |
| Acceso del chat al wiki | Tool calling estilo agente (3 tools read-only) |
| Modelo default | `anthropic/claude-sonnet-4-6` via Vercel AI Gateway |
| Renderizado del browse | SSG estático via `generateStaticParams` |
| Stack de UI | shadcn/ui + AI SDK Elements + Tailwind |
| Framework | Next.js 16 (App Router, RSC, TypeScript estricto) |
| Package manager | pnpm |
| Idioma de la UI | Español (matches fase 1) |

## Estructura de carpetas

```
workshop-ia/                                  (root del repo)
├── CLAUDE.md, README.md, LICENSE             ─┐
├── .claude/, raw/, wiki/, docs/              ─┤  ← FASE 1 (sin cambios)
├── _config.yml                               ─┘
│
├── app/                                      ─┐  ← FASE 2 (nuevo)
│   ├── layout.tsx                             │
│   ├── page.tsx                               │  "/"           home (hero + stats)
│   ├── not-found.tsx                          │  404 page
│   ├── wiki/
│   │   ├── layout.tsx                         │  shell con sidebar
│   │   ├── page.tsx                           │  "/wiki"       índice
│   │   └── [...slug]/page.tsx                 │  "/wiki/conceptos/transformer", etc.
│   ├── chat/page.tsx                          │  "/chat"       interfaz de chat
│   └── api/chat/route.ts                      │  POST /api/chat (streaming)
│
├── components/
│   ├── ui/                                    │  shadcn primitives (Button, Card, ...)
│   ├── SiteHeader.tsx, SiteFooter.tsx         │  shell común
│   ├── wiki/
│   │   ├── MarkdownRenderer.tsx               │  react-markdown + plugins custom
│   │   ├── WikiSidebar.tsx                    │  navegación
│   │   └── PageHeader.tsx                     │  frontmatter chips
│   └── chat/
│       └── ChatPanel.tsx                      │  AI SDK Elements
│
├── lib/
│   ├── wiki.ts                                │  loader fs+gray-matter; única puerta a wiki/
│   ├── tools.ts                               │  3 tools del agente (listar/leer/buscar)
│   ├── markdown.ts                            │  plugins remark/rehype para wikilinks/callouts
│   ├── prompts.ts                             │  systemPrompt() del chat
│   └── rate-limit.ts                          │  rate limit por IP via Runtime Cache
│
├── public/
│   ├── favicon.ico
│   └── og-image.png
│
├── package.json, tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── components.json                            │  config del CLI de shadcn
├── vercel.ts                                  │  config tipada de Vercel (framework, build)
└── .env.example                               │  AI_GATEWAY_API_KEY=, CHAT_MODEL=, etc.
```

**Boundaries**:
- `app/` orquesta rutas y RSC; no contiene lógica de markdown ni de IA.
- `lib/wiki.ts` es la única puerta a `wiki/`. Cached con `React.cache()`.
- `lib/tools.ts` es la única puerta entre el agente y el wiki — define exactamente qué puede hacer el chat.
- `components/wiki/*` no saben del chat; `components/chat/*` no saben del filesystem.
- Las escrituras al wiki siguen siendo exclusivas de Claude Code en local (per CLAUDE.md de fase 1).

## Pipeline de renderizado del wiki

### `lib/wiki.ts`

API mínima:

```ts
type WikiPage = {
  slug: string                    // "conceptos/transformer"
  category: 'entidades' | 'conceptos' | 'fuentes' | 'respuestas'
  frontmatter: {
    titulo: string
    tipo: 'concepto' | 'entidad' | 'fuente' | 'respuesta'
    fecha_creacion: string
    fecha_actualizacion: string
    fuentes?: string[]
    tags?: string[]
    autores?: string[]
    url?: string
    fecha_publicacion?: string
    formato_original?: string
  }
  body: string
}

export function listPages(): WikiPage[]
export function getPage(slug: string): WikiPage | null
export function getIndex(): { entidades: WikiPage[], conceptos: WikiPage[], fuentes: WikiPage[], respuestas: WikiPage[] }
export function search(query: string): WikiPage[]   // BM25 hand-rolled (~50 LOC) sobre titulo+body+tags. Para 16 páginas no necesita índice persistente. Si el wiki crece >100 páginas, swap por `bm25-fast` o vector search.
```

Implementación: `fs.readdirSync('wiki/', { recursive: true })` + `gray-matter`. Toda función envuelta en `React.cache()` para deduplicar I/O dentro de un mismo request.

### Pipeline de markdown

```
markdown
  ↓ react-markdown
  ↓   remark-gfm                  tablas, strikethrough, task lists
  ↓   remarkWikilinks (custom)    [[conceptos/X]] → <a href="/wiki/conceptos/X">
  ↓   rehype-callouts             > [!nota] / > [!contradicción] → <aside>
  ↓   rehype-sanitize             defensa básica
  ↓ JSX con componentes shadcn
HTML renderizado
```

### Plugins custom en `lib/markdown.ts`

**`remarkWikilinks`** — visita nodos `text` del AST, detecta el patrón `[[slug]]` o `[[slug|alias]]`, los reemplaza con nodos `link` que apuntan a `/wiki/<slug>`.

**`rehype-callouts`** — paquete existente. Mapeo:
- `[!contradicción]` → amarillo, badge "Contradicción", ícono ⚠️
- `[!nota]` → azul, badge "Nota", ícono ℹ️

### Routes → archivo source

| URL | Source | Render |
|---|---|---|
| `/` | `app/page.tsx` | Hero, stat cards, CTAs |
| `/wiki` | `app/wiki/page.tsx` | Lee `wiki/index.md`, renderiza |
| `/wiki/conceptos/transformer` | `app/wiki/[...slug]/page.tsx` | `getPage()` + chips + body |
| `/wiki/fuentes/2017-vaswani-attention` | mismo | + chips de autores/URL |
| `/chat` | `app/chat/page.tsx` | UI de chat |

### SSG via `generateStaticParams`

```ts
// app/wiki/[...slug]/page.tsx
export async function generateStaticParams() {
  return listPages().map(p => ({ slug: p.slug.split('/') }))
}
```

Build-time: pre-render HTML por cada `.md`. Push a `main` → Vercel rebuild auto.

### Layout visual de página de wiki

```
┌────────────────────────────────────────────────────┐
│ [Workshop IA / LLM+Wiki]    Inicio · Wiki · Chat  │
├──────────────┬─────────────────────────────────────┤
│ Entidades    │  # Transformer                      │
│ · ashish-v.. │  [concepto] [2026-05-26] [arquitec] │
│ · jay-alam.. │                                     │
│ · google-r.. │  Arquitectura de red neuronal       │
│              │  introducida en [Vaswani et al...]  │
│ Conceptos    │                                     │
│ · transformer│  ## Estructura                      │
│ · atencion   │  Encoder-decoder, cada lado con N..  │
│ · rag        │                                     │
│ ...          │  > [!contradicción]                 │
│              │  > Vaswani sostiene X...            │
│ Fuentes      │  > Ouyang sostiene Y...             │
│ · 2017-vas.. │                                     │
└──────────────┴─────────────────────────────────────┘
```

## Chat: API + tools + prompt + UI

### `app/api/chat/route.ts`

```ts
import { streamText } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { checkBotId } from 'botid/server'
import { tools } from '@/lib/tools'
import { systemPrompt } from '@/lib/prompts'
import { rateLimit } from '@/lib/rate-limit'

export const maxDuration = 60

export async function POST(req: Request) {
  const bot = await checkBotId()
  if (bot.isBot) return new Response('Bot detected', { status: 403 })

  const ip = req.headers.get('x-forwarded-for') ?? 'anon'
  const ok = await rateLimit(`chat:${ip}`, { limit: 10, windowSec: 3600 })
  if (!ok) return new Response('Rate limit excedido', { status: 429 })

  const { messages } = await req.json()
  const result = streamText({
    model: gateway(process.env.CHAT_MODEL ?? 'anthropic/claude-sonnet-4-6'),
    system: systemPrompt(),
    messages,
    tools,
    stopWhen: { steps: 8 },
  })

  return result.toUIMessageStreamResponse()
}
```

Fluid Compute (default). `maxDuration: 60` cubre conversaciones con varios turns de tool calling. AI Gateway facturación unificada + observabilidad + fallback si el provider primario falla.

### `lib/tools.ts` — 3 tools read-only

```ts
import { tool } from 'ai'
import { z } from 'zod'
import { listPages, getPage, search, getIndex } from './wiki'

export const tools = {
  listar_paginas: tool({
    description: 'Lista todas las páginas del wiki agrupadas por categoría. Úsalo primero.',
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
    description: 'Lee el contenido completo de una página dado su slug (ej. "conceptos/transformer").',
    inputSchema: z.object({ slug: z.string() }),
    execute: async ({ slug }) => {
      const page = getPage(slug)
      if (!page) return { error: `No existe "${slug}". Usa listar_paginas.` }
      return { frontmatter: page.frontmatter, body: page.body }
    },
  }),

  buscar: tool({
    description: 'Busca en el wiki por texto (BM25). Útil para queries exploratorias.',
    inputSchema: z.object({ query: z.string() }),
    execute: async ({ query }) => search(query).slice(0, 5).map(p => ({
      slug: p.slug,
      titulo: p.frontmatter.titulo,
      snippet: p.body.slice(0, 200),
    })),
  }),
}
```

Read-only por diseño. La web nunca escribe al wiki — esa salvaguarda preserva la integridad del patrón LLM+Wiki definido en fase 1.

### `lib/prompts.ts` — systemPrompt

```ts
export function systemPrompt(): string {
  return `Eres un asistente que responde preguntas usando exclusivamente el wiki
de este repositorio (sobre fundamentos de LLMs, en español, generado con el
patrón LLM+Wiki del Taller IA).

PROTOCOLO:
1. Empieza llamando \`listar_paginas\` para ver qué hay disponible.
2. Identifica páginas relevantes. Si no es obvio, usa \`buscar\`.
3. Lee las páginas con \`leer_pagina\` (puedes leer varias).
4. Sintetiza la respuesta en español.
5. **Cita siempre** con el formato \`(ver [[conceptos/transformer]])\`.
   La UI los renderiza como enlaces clickeables al wiki.
6. Si la pregunta no se puede responder con el wiki, dilo explícitamente y
   sugiere qué fuente faltaría ingerir.

NO inventes información que no esté en las páginas. Si una página tiene un
callout > [!contradicción], menciona la tensión en tu respuesta — no la ocultes.

Idioma: responde siempre en español, aunque la pregunta venga en inglés.`
}
```

### `components/chat/ChatPanel.tsx`

Usa AI SDK Elements:

```tsx
'use client'
import { useChat } from '@ai-sdk/react'
import { Conversation, ConversationContent, ConversationScrollButton } from '@ai-sdk/elements/conversation'
import { Message, MessageContent } from '@ai-sdk/elements/message'
import { PromptInput, PromptInputTextarea, PromptInputSubmit } from '@ai-sdk/elements/prompt-input'
import { Tool, ToolHeader, ToolContent } from '@ai-sdk/elements/tool'
import { MarkdownRenderer } from '@/components/wiki/MarkdownRenderer'

export function ChatPanel() {
  const { messages, sendMessage, status } = useChat()
  return (
    <div className="flex h-screen flex-col">
      <Conversation>
        <ConversationContent>
          {messages.map(m => (
            <Message key={m.id} from={m.role}>
              <MessageContent>
                {m.parts.map((part, i) => {
                  if (part.type === 'text')
                    return <MarkdownRenderer key={i} content={part.text} />
                  if (part.type.startsWith('tool-'))
                    return (
                      <Tool key={i} defaultOpen={false}>
                        <ToolHeader type={part.type} state={part.state} />
                        <ToolContent input={part.input} output={part.output} />
                      </Tool>
                    )
                })}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <PromptInput onSubmit={(text) => sendMessage({ text })}>
        <PromptInputTextarea placeholder="¿Qué es RAG? ¿Cómo se relaciona InstructGPT con el Transformer?" />
        <PromptInputSubmit status={status} />
      </PromptInput>
    </div>
  )
}
```

UX clave:
- Tool calls visibles (`<Tool>` colapsado). Pedagógico: hace visible el patrón agentic.
- Citas en respuestas renderizadas via `MarkdownRenderer` → unifica browse y chat. Cita `(ver [[conceptos/transformer]])` lleva a `/wiki/conceptos/transformer`.
- Streaming token-por-token.

## UI shell

### Root layout `app/layout.tsx`

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider defaultTheme="system">
          <SiteHeader />
          <main className="container mx-auto px-4 py-6 max-w-6xl">
            {children}
          </main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### `SiteHeader`

```
┌────────────────────────────────────────────────────────────────┐
│ 📚 Workshop IA · LLM+Wiki    Inicio · Wiki · Chat   🌓  GitHub │
└────────────────────────────────────────────────────────────────┘
```

Sticky. Mobile: hamburger menu con mismos links. `🌓` es toggle dark/light via `next-themes`.

### Páginas concretas

| Ruta | Contenido del `<main>` |
|---|---|
| `/` | Hero ("Una base de conocimiento que tu agente LLM construye") + 3 stat cards con conteos calculados al build time via `listPages()` (ej. en el estado actual del seed: 7 conceptos, 4 fuentes, 5 entidades) + sección "Cómo funciona" con diagrama (SVG en desktop, ASCII en mobile) + CTAs `[Explorar wiki]` `[Iniciar chat]` |
| `/wiki` | Grid de 4 secciones (entidades, conceptos, fuentes, respuestas) con cards. Sidebar aparece desde aquí. |
| `/wiki/[...slug]` | Sidebar sticky + página renderizada con frontmatter chips arriba + body. Mobile: sidebar pasa a `<Sheet>` drawer. |
| `/chat` | Full-height chat sin sidebar. |

### Tema

- shadcn default tokens con `next-themes` para toggle dark/light.
- Paleta inspirada en *cuaderno académico*: mostaza/azul tinta sobre crema (light), sepia oscuro (dark).
- Tipografía: Inter (UI) + JetBrains Mono (code) via `next/font/google`, self-hosted.

### Estados de error

- Slug inexistente → `not-found.tsx` con búsqueda y link a `/wiki`.
- Chat sin internet / BotID falla → mensaje en español, link al README.
- Rate limit → mensaje "Has hecho 10 preguntas esta hora. Vuelve en X minutos o clona el repo y corre local."

### Accesibilidad (defaults razonables)

- Skip-to-content link en header.
- Wikilinks con `aria-label` cuando texto visible difiere del slug.
- Callouts usan `<aside role="note">`.
- Contraste WCAG AA en ambos temas.
- `aria-live="polite"` en el contenedor de mensajes del chat.

### Responsive

- Mobile-first. Sidebar colapsa a drawer abajo de `md` (768px).
- Chat funciona pleno en móvil.
- Diagrama ASCII en `/` se reemplaza por SVG en móvil.

## Deploy & ops

### Setup inicial

```bash
pnpm install
pnpm dev                                      # http://localhost:3000

vercel link                                   # asocia repo a project
vercel deploy                                 # preview
vercel deploy --prod                          # producción
```

### Environment variables

```bash
# .env.example (commiteado)
AI_GATEWAY_API_KEY=                           # vercel.com/dashboard/ai-gateway
CHAT_MODEL=anthropic/claude-sonnet-4-6        # configurable sin redeploy
CHAT_RATE_LIMIT_PER_HOUR=10                   # mensajes/hora/IP
BOTID_ENABLED=true                            # false en local dev
```

Setup en producción:
```bash
vercel env add AI_GATEWAY_API_KEY production
vercel env add CHAT_MODEL production
vercel env add CHAT_RATE_LIMIT_PER_HOUR production
vercel env pull .env.local                    # sincroniza local
```

`.env.local` en `.gitignore` (heredado fase 1). `.env.example` se commitea.

### `vercel.ts`

```ts
import type { VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'pnpm build',
  installCommand: 'pnpm install',
}
```

### Workflow del taller

```
atendido          GitHub        Vercel
─────────         ──────        ──────
edita
  ↓
push a main  ──▶  main   ──▶  build auto (SSG)
                                ↓
                              preview URL si PR
                              prod URL si main
                                ↓
                              workshop-ia.vercel.app
```

Sin CI files que mantener — Vercel hace todo vía su GitHub integration.

### Costos esperados

| Servicio | Mes 1 (taller) | Mes 2+ (residual) |
|---|---|---|
| Vercel Hobby | $0 (100 GB-h, 100 GB bandwidth gratis) | $0 |
| AI Gateway / Sonnet | ~$3-8 | ~$0.50 |
| BotID | $0 (incluido) | $0 |
| Dominio (opcional) | $12/año | mismo |

Cap en AI Gateway dashboard como salvaguarda.

### Monitoring

- `vercel logs` por request: duration + tokens.
- AI Gateway dashboard: cost per request, latency, fallbacks.
- `vercel inspect <deployment>` para builds.

### Deploy checklist

- [ ] `vercel link` ejecutado
- [ ] 3 env vars en producción
- [ ] BotID activado (`vercel.com/dashboard/<project>/firewall`)
- [ ] `vercel deploy --prod` exitoso
- [ ] `/wiki/conceptos/transformer` renderiza con wikilinks resueltos y callouts visibles
- [ ] `/chat` responde con tool calls visibles colapsadas
- [ ] Rate limit verificado (11ma request en 1h → 429)
- [ ] README de fase 1 actualizado con link al deploy
- [ ] GH Pages opcional: `gh api -X DELETE /repos/oscolv/workshop-ia/pages` o dejarlo como respaldo

## Fuera de alcance

Defer a iteraciones posteriores:
- Búsqueda global en el header (UI search bar) — la search del agente cubre el caso de uso primario.
- Login / cuentas de usuario.
- Comentarios o anotaciones del lector.
- i18n (todo en español).
- Custom domain (DNS setup manual del usuario).
- GitHub Action que corra `/revisar` automáticamente.
- Versionado / diffs de páginas del wiki en la UI (git tiene la historia).
- Editor in-browser para wiki (sigue siendo Claude Code local + Obsidian).

## Verificación (cuándo el entregable está completo)

- [ ] `pnpm dev` levanta sin errores. `/`, `/wiki`, `/wiki/conceptos/transformer`, `/chat` accesibles.
- [ ] Página de Transformer muestra: frontmatter chips, body con wikilinks clickeables, callout de contradicción estilizado.
- [ ] Chat responde a "¿Qué es RAG?" leyendo `conceptos/rag` y citando con wikilinks que llevan a `/wiki/conceptos/rag`.
- [ ] Tool calls del chat son visibles (colapsados) en la UI.
- [ ] Rate limit dispara 429 después de 10 requests/hora/IP en producción.
- [ ] BotID activo (intentar request con `curl` sin headers → 403).
- [ ] Dark/light toggle funciona.
- [ ] Responsive: navegación funciona en móvil con drawer.
- [ ] Build de Vercel pasa sin warnings críticos.
- [ ] Deploy en producción accesible públicamente.

## Roadmap fase 3 (no parte de este entregable)

- Editor in-browser del wiki (requiere auth y backend para writes).
- GitHub OAuth para que atendidos hagan PRs al wiki desde la UI.
- Modelo picker en el chat (Sonnet/Haiku/GPT/Gemini).
- Vector search opcional cuando el wiki crezca (>100 páginas).
- Marp slides generados directamente desde wiki para el taller.
