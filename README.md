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

1. Clona o forkea este repo.
2. Ábrelo con [Claude Code](https://claude.com/claude-code):
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
| `/consultar <pregunta>` | Pregunta contra el wiki; opcionalmente fila la respuesta |
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

## Fase 2 — Despliegue en Vercel (próximamente en el taller)

Esta implementación es la base. En la fase 2 añadiremos:

- Una app **Next.js** (App Router) en `app/` que lee `wiki/` y lo sirve como
  sitio navegable.
- Renderizado de markdown con soporte de wikilinks y callouts estilo Obsidian.
- Búsqueda básica sobre el frontmatter.
- Un **chat** contra el wiki via Vercel AI Gateway con tool calling sobre los
  archivos markdown (lectura; las escrituras siguen pasando por Claude Code
  en local).
- Deploy con `vercel link` + `vercel deploy`.

Los nombres `app/`, `pages/`, `public/`, `src/`, `package.json` están
reservados — este repo evita usarlos en la raíz para no chocar con la fase 2.

## Licencia y atribución

El patrón "LLM Wiki" no es invento del autor — circula desde 2024 como idea
abierta. Este repo es una instanciación pedagógica para el Taller IA. Las
fuentes seed son papers y blogs de uso público con atribución y enlace a los
originales; el contenido reproducido se limita a abstracts y pasajes breves
bajo uso justo educativo.
