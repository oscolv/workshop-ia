# LLM+Wiki — Reference Implementation (diseño)

**Fecha:** 2026-05-26
**Autor:** Oscar (Taller IA, UAM Azcapotzalco)
**Estado:** aprobado para implementación

## Propósito

Entregable copiable para los atendidos del taller: una instancia *standalone* del patrón "LLM Wiki" (ver el documento original del patrón), lista para forkear, vaciar y poblar con el dominio propio de cada quien. No depende del set de skills `wiki:*` que están instalados en el sistema del autor — todo lo necesario vive en este repositorio.

La fase 2 del taller (no parte de este entregable) añadirá una app Next.js sobre `app/` para navegar el wiki y chatear contra él, desplegada en Vercel. La estructura de carpetas elegida aquí ya está pensada para que esa fase no requiera reorganizar nada.

## Decisiones de diseño

| Decisión | Valor |
|---|---|
| Idioma del schema, README, comandos y wiki | Español |
| Agente objetivo | Claude Code (CLAUDE.md como contrato principal) |
| Viewer asumido | Obsidian-friendly pero markdown estándar funciona |
| Alcance | Scaffold + ejemplo seed con 4 fuentes ingeridas |
| Tooling extra | Ninguno (solo markdown, slash commands, schema en CLAUDE.md). `markitdown` opcional via skill instalada. |
| Arquitectura del schema | Approach A: un solo `CLAUDE.md` al root con todo el contrato |

## Estructura de carpetas

```
llm+wiki/
├── README.md                  # ES — qué es, cómo arrancar, qué viene en fase 2
├── CLAUDE.md                  # Schema + workflows (ES) — el contrato con el agente
├── .claude/
│   ├── commands/
│   │   ├── ingerir.md         # /ingerir <ruta|url|texto>
│   │   ├── consultar.md       # /consultar <pregunta>
│   │   └── revisar.md         # /revisar
│   └── settings.json          # permisos mínimos (read libre; write en raw/ wiki/)
├── raw/
│   ├── assets/                # imágenes y archivos asociados a fuentes
│   └── _ejemplo/              # las 4 fuentes seed (subcarpeta para borrar fácil)
├── wiki/
│   ├── index.md
│   ├── index.empty.md         # versión vacía de referencia para reset
│   ├── log.md
│   ├── log.empty.md           # versión vacía de referencia para reset
│   ├── entidades/             # autores, organizaciones
│   ├── conceptos/             # ideas, técnicas, modelos como concepto
│   ├── fuentes/               # una página resumen por fuente ingerida
│   ├── respuestas/            # creada on-demand por /consultar cuando el usuario quiere preservar la respuesta
│   └── assets/                # imágenes generadas o copiadas para el wiki
├── docs/
│   └── superpowers/specs/2026-05-26-llm-wiki-reference-design.md
├── .gitignore
└── (futuro: app/, package.json, public/ cuando se haga fase 2)
```

Nombres que NO se usan al root para no chocar con la fase 2: `app/`, `pages/`, `public/`, `src/`, `node_modules/`, `package.json`.

## Convención de frontmatter

Toda página dentro de `wiki/` lleva frontmatter YAML. Esto sirve doble propósito: que el agente pueda buscar/filtrar consistentemente, y que la app Next.js de fase 2 pueda consumir las páginas programáticamente.

```yaml
---
titulo: Transformer
tipo: concepto                  # concepto | entidad | fuente | respuesta
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:                        # slugs de páginas en wiki/fuentes/
  - 2017-vaswani-attention
  - 2018-alammar-illustrated-transformer
tags: [arquitectura, atencion, deep-learning]
---
```

Para páginas en `wiki/fuentes/` se añaden además: `autores`, `url`, `fecha_publicacion`, `formato_original` (pdf | blog | video | …).

## Slash commands

Los archivos en `.claude/commands/` son envolturas cortas. Toda la lógica vive en `CLAUDE.md`.

### `/ingerir <ruta|url|texto>`
1. Si es URL: descarga con `curl` o pide al usuario que guarde manualmente.
2. Si es PDF/docx/pptx/xlsx: usa la skill `markitdown` para convertir a md.
3. Guarda en `raw/` (texto procesado, no necesariamente el binario original).
4. Lee la fuente completa.
5. Pequeña conversación con el usuario: ideas clave + qué énfasis darle.
6. Escribe `wiki/fuentes/<slug>.md` con frontmatter + resumen + cita.
7. Identifica entidades y conceptos. Para cada una:
   - Existe → edita (añade lo nuevo, marca contradicciones con `> [!contradicción]`).
   - No existe → crea página con frontmatter completo.
8. Actualiza `wiki/index.md` (añade entradas, mantiene orden por categoría).
9. Append a `wiki/log.md` con prefijo: `## [YYYY-MM-DD] ingerir | <título>`.

### `/consultar <pregunta>`
1. Lee `wiki/index.md` primero — no escanea el árbol a ciegas.
2. Sigue links a páginas relevantes, las lee.
3. Sintetiza respuesta con citas `(ver [[conceptos/transformer]])`.
4. Pregunta al usuario: ¿esta respuesta merece quedarse? Si sí → crea `wiki/respuestas/<slug>.md`.
5. Append a `wiki/log.md`: `## [YYYY-MM-DD] consultar | <pregunta resumida>`.

### `/revisar`
Health check. Check-list explícito en CLAUDE.md:
- Links rotos (`[[nombre]]` que no resuelve).
- Páginas huérfanas (sin links entrantes).
- Conceptos mencionados ≥3 veces sin página propia.
- Contradicciones entre páginas que no estén ya marcadas.
- Frontmatter faltante o inconsistente.
- Páginas viejas que pudieran ser obsoletas por fuentes nuevas.
- Sugiere preguntas a investigar y fuentes a buscar.
- Append a `wiki/log.md`: `## [YYYY-MM-DD] revisar | <N hallazgos>`.

## Manejo de errores / casos borde

Documentado explícitamente en `CLAUDE.md`:

| Caso | Comportamiento esperado |
|---|---|
| Fuente duplicada (ya está en `index.md`) | Detectar, preguntar al usuario si actualizar o saltar |
| URL inaccesible | Degradar: pedir al usuario que pegue el contenido |
| Conflicto: fuente nueva contradice página existente | **NO sobrescribir.** Añadir callout `> [!contradicción] Fuente A: X; Fuente B: Y` y dejar al humano |
| El agente quiere crear convención nueva (carpeta, tipo de página) | Primero editar `CLAUDE.md` y comentárselo al usuario |
| `raw/` modificado a mano por el usuario | OK, son sus fuentes. El agente solo escribe en `raw/` cuando es invocado para descargar/convertir. Nunca borra. |

## Ejemplo seed

### Fuentes (4 archivos en `raw/_ejemplo/`)

Cada archivo es un markdown con frontmatter (URL, autores, fecha, formato) + el texto que el agente ingirió. Para evitar problemas de copyright se incluyen abstracts y pasajes clave + enlace al original; el atendido puede re-ingerir el PDF completo si así lo prefiere.

| # | Slug | Fuente | Propósito pedagógico |
|---|------|--------|----------------------|
| 1 | `2017-vaswani-attention` | Attention Is All You Need (Vaswani et al., 2017) | Foundational. Genera Transformer, atención, encoder-decoder, autores, Google. |
| 2 | `2018-alammar-illustrated-transformer` | The Illustrated Transformer (Jay Alammar, 2018) | Mismo tema que #1. Demuestra que el agente *enriquece* páginas existentes en vez de duplicar. |
| 3 | `2020-lewis-rag` | Retrieval-Augmented Generation… (Lewis et al., 2020) | Concepto nuevo (RAG) que linkea de vuelta a Transformer. Demuestra cross-referencing. |
| 4 | `2022-ouyang-instructgpt` | Training language models to follow instructions w/ human feedback (Ouyang et al., 2022) | Añade RLHF y OpenAI. Contradice parcialmente afirmaciones de #1 → demuestra callout `> [!contradicción]`. |

### Páginas wiki resultantes (~15–18 archivos)

```
wiki/fuentes/        2017-vaswani-attention.md
                     2018-alammar-illustrated-transformer.md
                     2020-lewis-rag.md
                     2022-ouyang-instructgpt.md

wiki/entidades/      ashish-vaswani.md
                     jay-alammar.md
                     google-research.md
                     openai.md
                     meta-ai-fair.md

wiki/conceptos/      transformer.md           (tocado por #1 y #2)
                     atencion.md              (tocado por #1 y #2)
                     encoder-decoder.md
                     rag.md                   (link a transformer.md)
                     fine-tuning.md
                     rlhf.md                  (con callout vs. transformer.md)
                     prompt.md
```

### Valor pedagógico (explícito en el README)

1. **Compounding** — Transformer y atención se enriquecen al ir ingiriendo, no se reescriben.
2. **Cross-referencing** — RAG cita transformer; RLHF cita fine-tuning; toda fuente cita autores. Graph view de Obsidian sale denso.
3. **Contradicciones marcadas** — Callout en `rlhf.md` muestra que el agente NO sobrescribe.
4. **Log parseable** — `grep "^## \[" wiki/log.md` da timeline. 5 entradas mínimo en el seed (4 ingerir + 1 revisar).
5. **Frontmatter consistente** — Listo para que la app Next.js de fase 2 consuma.

## Reset a vacío

Para que el atendido pueda empezar con su propio dominio:

```bash
# Borra el ejemplo seed:
rm -rf raw/_ejemplo
rm -f wiki/fuentes/*.md wiki/entidades/*.md wiki/conceptos/*.md
rm -rf wiki/respuestas    # si existe (se crea on-demand)
# Restaura index.md y log.md a su estado vacío de referencia:
cp wiki/index.empty.md wiki/index.md
cp wiki/log.empty.md wiki/log.md
```

Esto se documenta en el README.

## Roadmap fase 2 (no parte de este entregable)

Documentado en el README como "qué viene después":

- `app/` — Next.js App Router (RSC, leyendo `wiki/` directamente desde el filesystem en build/runtime).
- Renderizado de markdown con soporte de wikilinks `[[…]]` (remark-wiki-link o similar) y callouts estilo Obsidian.
- Búsqueda básica sobre frontmatter (índice generado en build).
- Chat: ruta API que usa Vercel AI Gateway + tool calling sobre los archivos del wiki (lectura, no escritura desde la UI).
- Deploy: `vercel link` + `vercel deploy`.

## Verificación (cómo se sabe que el entregable está completo)

- [ ] Clonar el repo desde cero, ejecutar `/ingerir https://…` con una URL nueva, y obtener: `raw/<slug>.md` creado, `wiki/fuentes/<slug>.md` creado, ≥1 página de concepto o entidad actualizada, `index.md` actualizado, `log.md` con entrada nueva.
- [ ] Ejecutar `/consultar "¿qué es RAG y cómo se relaciona con Transformer?"` y obtener respuesta con ≥2 citas a páginas existentes del ejemplo seed.
- [ ] Ejecutar `/revisar` y obtener un reporte coherente (puede ser "sin hallazgos críticos" si el seed está limpio).
- [ ] Abrir el repo en Obsidian y verificar que el graph view muestra los links del ejemplo seed.
- [ ] El README en español es suficiente para que un atendido sin contexto previo arranque.

## Fuera de alcance

- CLI tools de búsqueda (qmd, BM25, etc.) — el `index.md` alcanza al tamaño del seed y de proyectos típicos del taller.
- Embeddings / RAG infrastructure.
- App Next.js (es fase 2).
- Soporte multi-agente (Codex, OpenCode) — Claude Code primero. La estructura es agnóstica pero los slash commands son específicos.
- Integración con la skill suite `wiki:*` instalada del autor — explícitamente independiente.
