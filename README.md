# LLM + Wiki — Implementación de referencia

Implementación standalone del patrón **LLM Wiki**: una base de conocimiento
markdown que un agente LLM (en este caso [Claude Code](https://claude.com/claude-code))
construye y mantiene incrementalmente conforme tú añades fuentes y haces
preguntas. Tú curas; el agente escribe, enlaza, sintetiza, y detecta
contradicciones.

Pensado como artefacto del **Taller IA** (UAM Azcapotzalco): forkéalo, vacíalo,
y arranca tu propio wiki sobre cualquier tema.

## El patrón en una imagen

```
   ┌──────────┐   /ingerir    ┌───────────────┐   /consultar   ┌─────────────┐
   │  fuentes │ ─────────────▶│  agente LLM   │ ◀──────────────│   usuario   │
   │  (raw/)  │               │ (Claude Code) │                │             │
   └──────────┘               └───────┬───────┘                └─────────────┘
                                      │ escribe / actualiza
                                      ▼
                          ┌─────────────────────────┐
                          │   wiki/  (markdown)     │
                          │  entidades, conceptos,  │
                          │  fuentes, respuestas    │
                          └─────────────────────────┘
```

La idea: el wiki es un artefacto **persistente y acumulativo**. Cada fuente
nueva no se re-procesa desde cero — se integra al wiki existente, actualiza
páginas, marca contradicciones, y enriquece la síntesis. Más detalle en el
documento original del patrón (referenciado en el `CLAUDE.md`).

## Estructura

```
.
├── CLAUDE.md           # el contrato con el agente — léelo antes de empezar
├── README.md           # este archivo
├── .claude/            # slash commands y permisos para Claude Code
├── raw/                # tus fuentes (inmutables; el agente las lee)
│   └── _ejemplo/       # 4 fuentes seed sobre fundamentos de LLMs
└── wiki/               # lo que el agente escribe
    ├── index.md        # catálogo
    ├── log.md          # cronológico
    ├── entidades/      # autores, organizaciones
    ├── conceptos/      # ideas y técnicas
    ├── fuentes/        # una página resumen por fuente
    └── assets/         # imágenes
```

## Cómo arrancar (con el ejemplo seed)

**Prerrequisito:** instala [Claude Code](https://claude.com/claude-code) (`npm i -g @anthropic-ai/claude-code` o descarga desde el sitio).

1. Clona o forkea este repo.
2. Ábrelo con Claude Code:
   ```bash
   cd llm+wiki
   claude
   ```
3. Explora lo que ya está. Pídele al agente:
   ```
   /consultar ¿qué es RAG y cómo se relaciona con el Transformer?
   ```
   Debería responder con citas a `[[conceptos/rag]]` y `[[conceptos/transformer]]`.
4. Abre el repo en [Obsidian](https://obsidian.md/) (opcional pero recomendado):
   - File → Open vault → selecciona la carpeta del repo.
   - Activa el plugin "Graph view" para ver los enlaces.
5. Ingiere una fuente nueva (URL, PDF, o texto):
   ```
   /ingerir https://example.com/articulo
   ```

## Cómo empezar limpio (tu propio dominio)

Para borrar el ejemplo seed y arrancar tu wiki desde cero:

```bash
# Borrar fuentes y páginas del ejemplo:
rm -rf raw/_ejemplo
rm -f wiki/fuentes/*.md wiki/entidades/*.md wiki/conceptos/*.md
rm -rf wiki/respuestas   # si existe (se crea on-demand)

# Restaurar index.md y log.md a su estado vacío:
cp wiki/index.empty.md wiki/index.md
cp wiki/log.empty.md   wiki/log.md
```

Después: ingiere tu primera fuente y deja que el agente arme el resto.

## Comandos disponibles

| Comando | Para qué |
|---|---|
| `/ingerir <url\|ruta\|texto>` | Añade una fuente al wiki, actualiza páginas, marca contradicciones |
| `/consultar <pregunta>` | Pregunta contra el wiki; opcionalmente archiva la respuesta |
| `/revisar` | Health check: links rotos, huérfanos, contradicciones, sugerencias |

El detalle de cada flujo vive en `CLAUDE.md`.

## Obsidian (opcional pero recomendado)

El wiki está pensado para verse bien en Obsidian:

- **Wikilinks** `[[conceptos/transformer]]` se renderizan como enlaces.
- **Callouts** `> [!contradicción]` muestran badges visuales.
- **Graph view** muestra la red de relaciones entre páginas — útil para ver
  qué páginas son hubs y cuáles son huérfanas.
- **Frontmatter YAML** puede consumirse con el plugin Dataview para tablas
  dinámicas.

No es obligatorio: cualquier editor markdown funciona. GitHub renderiza casi
todo (los wikilinks aparecen como texto, no como enlaces).

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

## `docs/superpowers/` — artefactos del diseño

La carpeta `docs/superpowers/` contiene los documentos que generaron este
repo:

- `specs/2026-05-26-llm-wiki-reference-design.md` — el documento de diseño
  (decisiones, alcance, estructura).
- `plans/2026-05-26-llm-wiki-reference.md` — el plan de implementación
  bite-sized en 10 tareas que se ejecutó para construir el seed.

Se dejan visibles a propósito: el taller no es sólo sobre el patrón LLM+Wiki
sino también sobre **cómo trabajar con agentes** (brainstorming → spec →
plan → subagent-driven execution → review). Estos archivos son evidencia del
proceso. Si forkeas el repo para tu propio dominio, puedes borrarlos sin
afectar nada del wiki.

## Licencia y atribución

El patrón "LLM Wiki" no es invento del autor — circula desde 2024 como idea
abierta. Este repo es una instanciación pedagógica para el Taller IA. Las
fuentes seed son papers y blogs de uso público con atribución y enlace a los
originales; el contenido reproducido se limita a abstracts y pasajes breves
bajo uso justo educativo.
