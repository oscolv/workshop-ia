# LLM+Wiki Reference Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone, copyable reference implementation of the "LLM Wiki" pattern in Spanish, scaffolded for Claude Code, with a seeded worked example (4 AI/LLM fundamentals sources → ~17 wiki pages). Phase 2 (Next.js app on Vercel) is out of scope but the layout reserves space for it.

**Architecture:** Single `CLAUDE.md` at the root holds the full schema and three workflows (ingerir / consultar / revisar). Slash commands in `.claude/commands/` are thin wrappers that invoke those workflows. Two layers of content: `raw/` (immutable sources, agent reads only) and `wiki/` (agent writes). The seeded example lives under `raw/_ejemplo/` and seeded wiki pages so the attendee can `rm -rf` it to start fresh. README and all schema text are in Spanish.

**Tech Stack:** Markdown only. Obsidian-friendly (`[[wikilinks]]`, YAML frontmatter, callouts) but plain-markdown compatible. No build step, no runtime, no dependencies. The `markitdown` Claude Code skill is invoked at runtime for PDF/docx conversion; it is not a repo dependency.

**Reference spec:** `docs/superpowers/specs/2026-05-26-llm-wiki-reference-design.md`

---

### Task 1: Directory skeleton & .gitignore

**Files:**
- Create: `.gitignore`
- Create: `raw/assets/.gitkeep`
- Create: `raw/_ejemplo/.gitkeep`
- Create: `wiki/entidades/.gitkeep`
- Create: `wiki/conceptos/.gitkeep`
- Create: `wiki/fuentes/.gitkeep`
- Create: `wiki/assets/.gitkeep`

Note: `wiki/respuestas/` is intentionally NOT created — it appears on demand the first time `/consultar` produces a keeper.

- [ ] **Step 1: Verify the tree is currently empty of these paths**

Run:
```bash
ls raw/ wiki/ 2>/dev/null; echo "exit=$?"
```
Expected: lists nothing or fails (`exit=2`). The repo currently only has `docs/superpowers/{specs,plans}/`.

- [ ] **Step 2: Write `.gitignore`**

```
# OS
.DS_Store
Thumbs.db

# Editors
.vscode/
.idea/
*.swp

# Obsidian — cada quien configura su vault
.obsidian/

# Phase 2 (Next.js) — pre-emptive
node_modules/
.next/
.vercel/
```

- [ ] **Step 3: Create the directory structure with `.gitkeep` files**

```bash
mkdir -p raw/assets raw/_ejemplo wiki/entidades wiki/conceptos wiki/fuentes wiki/assets
touch raw/assets/.gitkeep raw/_ejemplo/.gitkeep \
      wiki/entidades/.gitkeep wiki/conceptos/.gitkeep \
      wiki/fuentes/.gitkeep wiki/assets/.gitkeep
```

- [ ] **Step 4: Verify the structure**

Run:
```bash
find raw wiki -type d | sort
```
Expected output:
```
raw
raw/_ejemplo
raw/assets
wiki
wiki/assets
wiki/conceptos
wiki/entidades
wiki/fuentes
```

- [ ] **Step 5: Commit**

```bash
git add .gitignore raw wiki
git commit -m "chore: esqueleto de directorios y .gitignore"
```

---

### Task 2: CLAUDE.md — el contrato con el agente

**Files:**
- Create: `CLAUDE.md`

This is THE schema file. It's substantial because the entire contract lives here. Written in Spanish, addressed to the agent in second person ("tú").

- [ ] **Step 1: Verify CLAUDE.md does not yet exist**

Run:
```bash
test -f CLAUDE.md && echo "EXISTS" || echo "OK, not present"
```
Expected: `OK, not present`.

- [ ] **Step 2: Write `CLAUDE.md`**

````markdown
# Contrato con el agente — LLM+Wiki

Este repositorio implementa el patrón "LLM Wiki": una base de conocimiento markdown
que tú (el agente) construyes y mantienes incrementalmente conforme el usuario
añade fuentes y hace preguntas. El usuario rara vez escribe en `wiki/`; ese
trabajo es tuyo.

## Tres capas

1. **`raw/`** — fuentes inmutables curadas por el usuario. Tú las lees. Solo
   escribes aquí cuando el usuario te pide ingerir algo nuevo (para guardar el
   texto procesado de una URL o PDF). **Nunca borras ni modificas** contenido
   existente en `raw/`.
2. **`wiki/`** — tu salida. Páginas markdown con frontmatter, organizadas en
   `entidades/`, `conceptos/`, `fuentes/`, y (on-demand) `respuestas/`. Todo
   lo que vive aquí lo escribiste tú.
3. **`CLAUDE.md`** (este archivo) — el contrato. Define convenciones, flujos,
   manejo de errores. Si necesitas crear una convención nueva, primero edita
   este archivo y avísale al usuario.

## Convención de frontmatter

Toda página en `wiki/` lleva frontmatter YAML. Esto sirve para que tú puedas
buscar/filtrar consistentemente y para que herramientas futuras (la app
Next.js de la fase 2) consuman las páginas programáticamente.

```yaml
---
titulo: Transformer
tipo: concepto                       # concepto | entidad | fuente | respuesta
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2017-vaswani-attention           # slugs de archivos en wiki/fuentes/
  - 2018-alammar-illustrated-transformer
tags: [arquitectura, atencion, deep-learning]
---
```

**Páginas en `wiki/fuentes/`** llevan un frontmatter ligeramente distinto:
omiten el campo `fuentes:` (una fuente *es* la fuente, no se compila desde
otras), y añaden:

```yaml
autores: [Ashish Vaswani, ...]
url: https://arxiv.org/abs/1706.03762
fecha_publicacion: 2017-06-12
formato_original: paper              # paper | blog | video | libro | nota
```

Es decir, frontmatter de una fuente = `titulo`, `tipo: fuente`,
`fecha_creacion`, `fecha_actualizacion`, `tags`, `autores`, `url`,
`fecha_publicacion`, `formato_original`. Sin `fuentes:`.

## Convenciones de enlace

- Usa `[[wikilinks]]` con ruta relativa desde la raíz de `wiki/`. Ejemplos:
  - `[[conceptos/transformer]]`
  - `[[entidades/ashish-vaswani]]`
  - `[[fuentes/2017-vaswani-attention]]`
- Los slugs son kebab-case ASCII sin acentos: "atención" → `atencion.md`.
- Las páginas de fuentes llevan el año al inicio: `2017-vaswani-attention.md`.

## Flujo: `/ingerir <ruta|url|texto>`

Cuando el usuario invoca este comando con un argumento:

1. **Identifica el formato del argumento:**
   - URL → descarga con `curl -sL` a `raw/<slug>.md` o `.html`. Si falla
     (sin red, 403, etc.), pídele al usuario que pegue el contenido.
   - Ruta a archivo PDF/docx/pptx/xlsx → usa la skill `markitdown` para
     convertirlo a markdown y guardarlo en `raw/<slug>.md`.
   - Ruta a archivo ya markdown → cópialo a `raw/<slug>.md` si no está ya.
   - Texto pegado → guárdalo a `raw/<slug>.md` con frontmatter mínimo.

2. **Verifica duplicados:** busca el slug o la URL en `wiki/index.md`. Si ya
   existe, pregunta al usuario: "Ya tengo esa fuente. ¿Actualizo o salto?"

3. **Lee la fuente completa** (no chunks).

4. **Conversa brevemente** con el usuario: "Estas son las 3-5 ideas clave que
   identifiqué. ¿Algún énfasis particular antes de filar?"

5. **Escribe `wiki/fuentes/<slug>.md`** con:
   - Frontmatter completo (titulo, tipo: fuente, autores, url, fecha_publicacion,
     formato_original, fecha_creacion, fecha_actualizacion, tags).
   - Sección "Resumen" (3-5 párrafos).
   - Sección "Citas clave" (2-4 quotes breves con cita textual entre comillas).
   - Sección "Conexiones" con wikilinks a entidades y conceptos relacionados.

6. **Identifica entidades y conceptos** mencionados. Para cada uno:
   - **Existe la página** → edítala: añade lo nuevo, actualiza
     `fecha_actualizacion`, añade el slug de la fuente a la lista `fuentes` del
     frontmatter, y si esta fuente contradice algo ya escrito, **NO sobrescribas**;
     añade un callout:
     ```markdown
     > [!contradicción]
     > [[fuentes/2017-vaswani-attention]] afirma X.
     > [[fuentes/2022-ouyang-instructgpt]] sostiene Y. Pendiente resolver.
     ```
   - **No existe** → créala con frontmatter completo y al menos un párrafo de
     contenido + lista de `fuentes`.

7. **Actualiza `wiki/index.md`:** añade entradas nuevas; mantén orden por
   categoría (Entidades, Conceptos, Fuentes, Respuestas).

8. **Append a `wiki/log.md`** con el prefijo parseable:
   ```markdown
   ## [2026-05-26] ingerir | <título corto de la fuente>

   - Fuente: [[fuentes/<slug>]]
   - Páginas tocadas: [[conceptos/X]], [[entidades/Y]], ...
   - Notas: <1-2 frases sobre qué fue lo más relevante>
   ```

## Flujo: `/consultar <pregunta>`

1. **Lee `wiki/index.md` primero.** No escanees el árbol a ciegas — el índice
   es tu mapa.

2. **Identifica las páginas relevantes** por nombre/categoría. Léelas.

3. **Sintetiza la respuesta** citando con wikilinks:
   ```
   El Transformer eliminó la recurrencia (ver [[conceptos/transformer]]), lo
   que permitió la paralelización que después hizo viable escalar a modelos
   instruct-tunados como InstructGPT (ver [[conceptos/rlhf]]).
   ```

4. **Pregunta al usuario:** "¿Esta respuesta merece quedarse en el wiki?"
   - Si sí → crea `wiki/respuestas/<slug>.md` (crea el directorio si no existe)
     con frontmatter (`tipo: respuesta`, lista de `fuentes` que tocaste), la
     pregunta como título, y la respuesta como cuerpo. Añade entrada a
     `wiki/index.md`.

5. **Append a `wiki/log.md`:**
   ```markdown
   ## [2026-05-26] consultar | <pregunta resumida en ≤80 chars>

   - Páginas consultadas: [[conceptos/X]], [[fuentes/Y]]
   - Filed: [[respuestas/<slug>]]   ← omitir si el usuario no quiso filar
   ```

## Flujo: `/revisar`

Ejecuta esta lista de checks sobre el wiki actual. Reporta hallazgos al
usuario y propón fixes.

1. **Links rotos:** todo `[[ruta/nombre]]` debe corresponder a un archivo
   existente bajo `wiki/`. Lista los que no resuelven.
2. **Páginas huérfanas:** archivos en `wiki/` sin ningún link entrante.
   Excepción: `index.md`, `log.md`, las páginas en `wiki/fuentes/` (estas se
   enlazan via `fuentes:` del frontmatter, no necesariamente via wikilinks).
3. **Conceptos implícitos sin página:** términos que aparecen en ≥3 páginas
   distintas pero no tienen su propia página en `wiki/conceptos/`.
4. **Contradicciones no marcadas:** páginas donde dos fuentes en el frontmatter
   afirman cosas distintas sobre el mismo claim, sin callout `> [!contradicción]`.
5. **Frontmatter inconsistente o faltante:** páginas sin frontmatter, sin
   `titulo`, sin `tipo`, o con `tipo` fuera del enum válido.
6. **Stale:** páginas cuya `fecha_actualizacion` sea anterior a fuentes más
   recientes que las contradigan.
7. **Sugerencias proactivas:** ≥2 preguntas a investigar o fuentes a buscar,
   basadas en huecos visibles.

Append a `wiki/log.md`:
```markdown
## [2026-05-26] revisar | <N> hallazgos

- Links rotos: <N>
- Páginas huérfanas: <N>
- Conceptos sin página: <lista>
- Sugerencias: <lista corta>
```

## Manejo de errores y casos borde

| Caso | Qué hacer |
|---|---|
| Fuente duplicada (ya en `index.md` o `wiki/fuentes/`) | Detectar, preguntar al usuario si actualizar o saltar |
| URL inaccesible | Pedir al usuario que pegue el contenido |
| Conflicto: fuente nueva contradice página | **No sobrescribir.** Callout `> [!contradicción]` y dejar al humano |
| El agente quiere crear convención nueva (carpeta, tipo de página) | Primero editar este `CLAUDE.md` y comentárselo al usuario |
| `raw/` modificado a mano por el usuario | OK, son sus fuentes. Solo escribes en `raw/` cuando te invocan a ingerir. Nunca borras. |
| Slash command sin argumento | Pídelo. No asumas. |

## Lo que NO debes hacer

- **No** sobrescribir páginas existentes con información contradictoria sin
  callout.
- **No** crear directorios fuera del árbol definido (`raw/`, `wiki/{entidades,conceptos,fuentes,respuestas,assets}`) sin antes editar `CLAUDE.md`.
- **No** tocar archivos en `raw/` excepto al ejecutar `/ingerir`.
- **No** modificar archivos `.empty.md` — son referencia para el reset.
- **No** asumir conexión a internet. Si la necesitas, pídela explícitamente.
- **No** crear archivos en la raíz del proyecto que pudieran chocar con la
  fase 2 (Next.js): `app/`, `pages/`, `public/`, `src/`, `package.json`,
  `node_modules/`.
````

- [ ] **Step 3: Verify CLAUDE.md exists and has expected sections**

Run:
```bash
test -f CLAUDE.md && \
grep -c '^## ' CLAUDE.md
```
Expected: ≥8 (Tres capas, Convención de frontmatter, Convenciones de enlace,
Flujo: /ingerir, Flujo: /consultar, Flujo: /revisar, Manejo de errores,
Lo que NO debes hacer).

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "feat: CLAUDE.md con schema y flujos del patrón LLM+Wiki"
```

---

### Task 3: Slash commands (.claude/commands/) y settings

**Files:**
- Create: `.claude/settings.json`
- Create: `.claude/commands/ingerir.md`
- Create: `.claude/commands/consultar.md`
- Create: `.claude/commands/revisar.md`

- [ ] **Step 1: Verify .claude/ does not exist**

Run:
```bash
test -d .claude && echo "EXISTS" || echo "OK"
```
Expected: `OK`.

- [ ] **Step 2: Create `.claude/settings.json`**

```bash
mkdir -p .claude/commands
```

`.claude/settings.json`:
```json
{
  "permissions": {
    "allow": [
      "Bash(curl:*)",
      "Bash(ls:*)",
      "Bash(cat:*)",
      "Bash(grep:*)",
      "Bash(find:*)",
      "Bash(mkdir:*)",
      "Bash(cp:*)",
      "Bash(mv:*)",
      "Bash(rm raw/_ejemplo:*)",
      "Bash(git:*)",
      "Read(//*)",
      "Edit(raw/**)",
      "Edit(wiki/**)",
      "Write(raw/**)",
      "Write(wiki/**)"
    ]
  }
}
```

- [ ] **Step 3: Create `.claude/commands/ingerir.md`**

```markdown
---
description: Ingiere una fuente nueva al wiki (URL, ruta a archivo, o texto)
argument-hint: <url | ruta | texto>
---

Sigue exactamente el flujo "Flujo: /ingerir" definido en CLAUDE.md para esta
fuente:

$ARGUMENTS

Recuerda los puntos clave:
- Verificar duplicados antes de escribir.
- Conversar brevemente con el usuario sobre énfasis antes de filar.
- Actualizar páginas existentes en vez de duplicar.
- Marcar contradicciones con callout, nunca sobrescribir.
- Actualizar index.md y append a log.md al final.
```

- [ ] **Step 4: Create `.claude/commands/consultar.md`**

```markdown
---
description: Pregunta contra el wiki y opcionalmente fila la respuesta
argument-hint: <pregunta>
---

Sigue el flujo "Flujo: /consultar" definido en CLAUDE.md para esta pregunta:

$ARGUMENTS

Recuerda:
- Lee wiki/index.md primero como mapa.
- Cita con wikilinks: (ver [[conceptos/X]]).
- Pregúntale al usuario si vale la pena filar la respuesta.
- Append a log.md.
```

- [ ] **Step 5: Create `.claude/commands/revisar.md`**

```markdown
---
description: Health check del wiki (links rotos, huérfanos, contradicciones, etc.)
---

Ejecuta el flujo "Flujo: /revisar" definido en CLAUDE.md. Recorre los 7 checks
en orden, reporta hallazgos al usuario en una tabla, y propón fixes concretos
para cada uno. No apliques fixes sin pedir confirmación.

Al final, append a log.md con el resumen del reporte.
```

- [ ] **Step 6: Verify all four files exist**

Run:
```bash
ls -la .claude/ .claude/commands/
```
Expected: `settings.json` in `.claude/`, three `.md` files in `.claude/commands/`.

- [ ] **Step 7: Verify settings.json is valid JSON**

Run:
```bash
python3 -c "import json; json.load(open('.claude/settings.json'))" && echo "valid JSON"
```
Expected: `valid JSON`.

- [ ] **Step 8: Commit**

```bash
git add .claude
git commit -m "feat: slash commands /ingerir, /consultar, /revisar y settings.json"
```

---

### Task 4: README.md (audience-facing en español)

**Files:**
- Create: `README.md`

- [ ] **Step 1: Verify README does not exist**

Run:
```bash
test -f README.md && echo "EXISTS" || echo "OK"
```
Expected: `OK`.

- [ ] **Step 2: Write `README.md`**

````markdown
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
````

- [ ] **Step 3: Verify README**

Run:
```bash
test -f README.md && grep -c '^## ' README.md
```
Expected: ≥6 sections.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: README en español con quickstart, reset y roadmap fase 2"
```

---

### Task 5: Fuentes raw del ejemplo seed

**Files:**
- Create: `raw/_ejemplo/2017-vaswani-attention.md`
- Create: `raw/_ejemplo/2018-alammar-illustrated-transformer.md`
- Create: `raw/_ejemplo/2020-lewis-rag.md`
- Create: `raw/_ejemplo/2022-ouyang-instructgpt.md`

Each file contains: frontmatter (URL, autores, fecha_publicacion, formato),
the original abstract (which is fair-use), and a "Pasajes clave" section
with 2-3 short representative quotes or paraphrases. The point is to give
the agent enough to work with during ingestion without reproducing the full
papers.

- [ ] **Step 1: Verify raw/_ejemplo is empty (only .gitkeep)**

Run:
```bash
ls raw/_ejemplo
```
Expected: `.gitkeep` only.

- [ ] **Step 2: Write `raw/_ejemplo/2017-vaswani-attention.md`**

````markdown
---
titulo: "Attention Is All You Need"
autores: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit", "Llion Jones", "Aidan N. Gomez", "Łukasz Kaiser", "Illia Polosukhin"]
afiliacion: Google Brain, Google Research, University of Toronto
url: https://arxiv.org/abs/1706.03762
fecha_publicacion: 2017-06-12
formato_original: paper
venue: NeurIPS 2017
---

# Attention Is All You Need

## Abstract (original)

> The dominant sequence transduction models are based on complex recurrent or
> convolutional neural networks that include an encoder and a decoder. The
> best performing models also connect the encoder and decoder through an
> attention mechanism. We propose a new simple network architecture, the
> Transformer, based solely on attention mechanisms, dispensing with recurrence
> and convolutions entirely. Experiments on two machine translation tasks show
> these models to be superior in quality while being more parallelizable and
> requiring significantly less time to train.

## Pasajes clave

- Introduce la arquitectura **Transformer**, basada exclusivamente en
  mecanismos de atención (self-attention) — sin RNN, sin CNN.
- Define la atención escalada por producto punto (*scaled dot-product
  attention*) y la atención multi-cabeza (*multi-head attention*).
- Estructura encoder-decoder: 6 capas en cada lado, residual connections,
  layer normalization.
- El modelo se entrena en horas (no días) sobre WMT14 EN-DE y EN-FR, supera
  el SOTA en ambos.
- Sienta la base para casi toda la NLP moderna (BERT, GPT, T5, etc. son
  variantes del Transformer).

## Enlace al original

[arxiv.org/abs/1706.03762](https://arxiv.org/abs/1706.03762)
````

- [ ] **Step 3: Write `raw/_ejemplo/2018-alammar-illustrated-transformer.md`**

````markdown
---
titulo: "The Illustrated Transformer"
autores: ["Jay Alammar"]
url: https://jalammar.github.io/illustrated-transformer/
fecha_publicacion: 2018-06-27
formato_original: blog
---

# The Illustrated Transformer

## Resumen (de la fuente)

Post de blog que explica visualmente la arquitectura Transformer publicada
en *Attention Is All You Need* (Vaswani et al., 2017). Es el explainer más
referenciado en la web para entender Transformers desde cero, sin requerir
leer el paper original.

## Pasajes clave

- Desglose paso a paso del flujo de un token a través del encoder: embedding
  → self-attention → feed-forward → siguiente capa.
- Visualización del cálculo de Query, Key, Value y cómo los scores de
  atención forman la salida.
- Explica multi-head attention como "8 representaciones paralelas que se
  concatenan".
- Sección sobre positional encoding: por qué el Transformer necesita
  inyectar información de posición y cómo Vaswani et al. usaron sinusoides.
- Cierra con cómo el decoder usa atención sobre la salida del encoder
  (cross-attention) además de su propia self-attention enmascarada.

## Enlace al original

[jalammar.github.io/illustrated-transformer](https://jalammar.github.io/illustrated-transformer/)
````

- [ ] **Step 4: Write `raw/_ejemplo/2020-lewis-rag.md`**

````markdown
---
titulo: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
autores: ["Patrick Lewis", "Ethan Perez", "Aleksandra Piktus", "Fabio Petroni", "Vladimir Karpukhin", "Naman Goyal", "Heinrich Küttler", "Mike Lewis", "Wen-tau Yih", "Tim Rocktäschel", "Sebastian Riedel", "Douwe Kiela"]
afiliacion: Facebook AI Research, University College London, New York University
url: https://arxiv.org/abs/2005.11401
fecha_publicacion: 2020-05-22
formato_original: paper
venue: NeurIPS 2020
---

# Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks

## Abstract (original, abreviado)

> Large pre-trained language models have been shown to store factual
> knowledge in their parameters, and achieve state-of-the-art results when
> fine-tuned on downstream NLP tasks. However, their ability to access and
> precisely manipulate knowledge is still limited, and hence on
> knowledge-intensive tasks, their performance lags behind task-specific
> architectures. (...) We introduce **retrieval-augmented generation (RAG)**
> — models which combine pre-trained parametric and non-parametric memory for
> language generation. We introduce RAG models where the parametric memory is
> a pre-trained seq2seq model and the non-parametric memory is a dense vector
> index of Wikipedia, accessed with a pre-trained neural retriever.

## Pasajes clave

- Define **RAG**: arquitectura híbrida que combina (a) un modelo
  seq2seq pre-entrenado (memoria paramétrica, en este caso BART, que es un
  Transformer encoder-decoder) y (b) un índice vectorial denso de Wikipedia
  como memoria no-paramétrica.
- El retriever (DPR — Dense Passage Retrieval) recupera los top-k pasajes
  más relevantes a la pregunta; el generador los condiciona en su salida.
- Dos variantes: RAG-Sequence (mismos documentos para toda la secuencia) y
  RAG-Token (documentos distintos por cada token generado).
- Mejora SOTA en tareas open-domain QA (Natural Questions, TriviaQA,
  WebQuestions).
- Argumento clave: separar conocimiento (índice actualizable) de razonamiento
  (modelo) tiene ventajas frente a meter todo el conocimiento en parámetros.

## Enlace al original

[arxiv.org/abs/2005.11401](https://arxiv.org/abs/2005.11401)
````

- [ ] **Step 5: Write `raw/_ejemplo/2022-ouyang-instructgpt.md`**

````markdown
---
titulo: "Training language models to follow instructions with human feedback"
autores: ["Long Ouyang", "Jeff Wu", "Xu Jiang", "Diogo Almeida", "Carroll L. Wainwright", "Pamela Mishkin", "Chong Zhang", "Sandhini Agarwal", "Katarina Slama", "Alex Ray", "John Schulman", "Jacob Hilton", "Fraser Kelton", "Luke Miller", "Maddie Simens", "Amanda Askell", "Peter Welinder", "Paul Christiano", "Jan Leike", "Ryan Lowe"]
afiliacion: OpenAI
url: https://arxiv.org/abs/2203.02155
fecha_publicacion: 2022-03-04
formato_original: paper
venue: NeurIPS 2022
---

# Training language models to follow instructions with human feedback (InstructGPT)

## Abstract (original, abreviado)

> Making language models bigger does not inherently make them better at
> following a user's intent. (...) We show an avenue for aligning language
> models with user intent on a wide range of tasks by **fine-tuning with
> human feedback**. Starting with a set of labeler-written prompts and
> prompts submitted through the OpenAI API, we collect a dataset of labeler
> demonstrations of the desired model behavior, which we use to fine-tune
> GPT-3 using supervised learning. We then collect a dataset of rankings of
> model outputs, which we use to further fine-tune this supervised model
> using **reinforcement learning from human feedback (RLHF)**. We call the
> resulting models **InstructGPT**. (...) The 1.3B InstructGPT model is
> preferred over outputs from the 175B GPT-3 despite having 100x fewer
> parameters.

## Pasajes clave

- Introduce el pipeline RLHF de tres etapas: (1) Supervised Fine-Tuning
  sobre demostraciones humanas; (2) entrenamiento de un Reward Model a partir
  de rankings humanos; (3) optimización del LM contra el RM usando PPO.
- Resultado clave: alineación con la intención del usuario importa más que
  escala bruta. InstructGPT-1.3B supera a GPT-3-175B en preferencia humana.
- Contrasta con el supuesto implícito de Vaswani et al. (2017) — donde la
  mejora venía de arquitectura + datos — al mostrar que el *post-training*
  con feedback humano es esencial para utilidad práctica.
- Discute limitaciones: el modelo aprende los sesgos de los anotadores;
  alinear a "intent" no es lo mismo que alinear a "valores".
- Predecesor directo de ChatGPT (lanzado a finales de 2022).

## Enlace al original

[arxiv.org/abs/2203.02155](https://arxiv.org/abs/2203.02155)
````

- [ ] **Step 6: Verify the four files exist**

Run:
```bash
ls raw/_ejemplo/*.md | wc -l
```
Expected: `4`.

- [ ] **Step 7: Verify each has frontmatter**

Run:
```bash
for f in raw/_ejemplo/*.md; do
  head -1 "$f" | grep -q '^---$' && echo "$f OK" || echo "$f MISSING frontmatter"
done
```
Expected: all 4 print `OK`.

- [ ] **Step 8: Commit**

```bash
git add raw/_ejemplo
git commit -m "feat: seed raw sources (4 papers/blog sobre fundamentos de LLMs)"
```

---

### Task 6: Wiki seed — páginas de fuentes

**Files:**
- Create: `wiki/fuentes/2017-vaswani-attention.md`
- Create: `wiki/fuentes/2018-alammar-illustrated-transformer.md`
- Create: `wiki/fuentes/2020-lewis-rag.md`
- Create: `wiki/fuentes/2022-ouyang-instructgpt.md`

Each is what the agent would have produced after `/ingerir` on the
corresponding raw source: frontmatter, Resumen, Citas clave, Conexiones.

- [ ] **Step 1: Write `wiki/fuentes/2017-vaswani-attention.md`**

````markdown
---
titulo: "Attention Is All You Need"
tipo: fuente
autores: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit", "Llion Jones", "Aidan N. Gomez", "Łukasz Kaiser", "Illia Polosukhin"]
url: https://arxiv.org/abs/1706.03762
fecha_publicacion: 2017-06-12
formato_original: paper
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
tags: [transformer, atencion, arquitectura, fundacional]
---

# Attention Is All You Need

## Resumen

Paper fundacional de NLP moderna. Introduce el [[conceptos/transformer]], una
arquitectura encoder-decoder basada *exclusivamente* en mecanismos de
[[conceptos/atencion]] — sin RNN, sin CNN. La eliminación de la recurrencia
permite paralelización masiva durante entrenamiento, lo que reduce el tiempo
de cómputo de días a horas en tareas de traducción y abre la puerta al
escalamiento posterior (GPT, BERT, T5, etc.).

Publicado por un grupo de [[entidades/google-research]] (Google Brain +
Google Research + un colaborador de University of Toronto) liderado por
[[entidades/ashish-vaswani]].

## Citas clave

> "We propose a new simple network architecture, the Transformer, based
> solely on attention mechanisms, dispensing with recurrence and convolutions
> entirely."

> "Experiments on two machine translation tasks show these models to be
> superior in quality while being more parallelizable and requiring
> significantly less time to train."

## Conexiones

- Concepto principal: [[conceptos/transformer]]
- Mecanismo central: [[conceptos/atencion]]
- Arquitectura: [[conceptos/encoder-decoder]]
- Primer autor: [[entidades/ashish-vaswani]]
- Organización: [[entidades/google-research]]
- Explainer accesible: [[fuentes/2018-alammar-illustrated-transformer]]
- Línea posterior: [[conceptos/fine-tuning]], [[conceptos/rlhf]] (post-training)
````

- [ ] **Step 2: Write `wiki/fuentes/2018-alammar-illustrated-transformer.md`**

````markdown
---
titulo: "The Illustrated Transformer"
tipo: fuente
autores: ["Jay Alammar"]
url: https://jalammar.github.io/illustrated-transformer/
fecha_publicacion: 2018-06-27
formato_original: blog
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
tags: [transformer, atencion, didactico]
---

# The Illustrated Transformer

## Resumen

Explainer visual del [[conceptos/transformer]] de [[entidades/jay-alammar]],
publicado un año después del paper original. Es la referencia divulgativa
más usada en la web para entender la arquitectura sin leer el paper.

Cubre: embedding → self-attention (Query/Key/Value) → multi-head attention
→ positional encoding → cross-attention en el decoder. Aporta diagramas que
hacen tangibles ideas que en el paper aparecen como ecuaciones.

No introduce ideas nuevas — su valor está en la pedagogía. Por eso esta
fuente *enriquece* las páginas de [[conceptos/transformer]] y
[[conceptos/atencion]] en vez de duplicarlas.

## Citas clave

> "The self-attention layer in the encoder allows the encoder to look at
> other words in the input sentence as it encodes a specific word."

> "Multi-headed attention gives the layer multiple 'representation
> subspaces'."

## Conexiones

- Explica: [[conceptos/transformer]], [[conceptos/atencion]],
  [[conceptos/encoder-decoder]]
- Autor: [[entidades/jay-alammar]]
- Fuente que explica: [[fuentes/2017-vaswani-attention]]
````

- [ ] **Step 3: Write `wiki/fuentes/2020-lewis-rag.md`**

````markdown
---
titulo: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
tipo: fuente
autores: ["Patrick Lewis", "Ethan Perez", "Aleksandra Piktus", "Fabio Petroni", "Vladimir Karpukhin", "Naman Goyal", "Heinrich Küttler", "Mike Lewis", "Wen-tau Yih", "Tim Rocktäschel", "Sebastian Riedel", "Douwe Kiela"]
url: https://arxiv.org/abs/2005.11401
fecha_publicacion: 2020-05-22
formato_original: paper
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
tags: [rag, retrieval, conocimiento]
---

# Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks

## Resumen

Introduce **[[conceptos/rag]]**: arquitectura híbrida que combina un modelo
seq2seq pre-entrenado (memoria paramétrica, basado en BART — que es un
[[conceptos/transformer]] encoder-decoder) con un índice vectorial denso de
Wikipedia (memoria no-paramétrica) accedido vía un retriever neuronal (DPR).

La motivación central es separar el conocimiento de la capacidad de
razonamiento. Meter todos los hechos del mundo en los parámetros de un
modelo es costoso, opaco, y queda obsoleto. RAG propone: deja al modelo
hacer composición lingüística; deja a un índice externo (actualizable)
proveer hechos.

Publicado por un grupo de [[entidades/meta-ai-fair]] con colaboradores de
UCL y NYU.

## Citas clave

> "We introduce retrieval-augmented generation (RAG) — models which combine
> pre-trained parametric and non-parametric memory for language generation."

> "The 1.3B InstructGPT model is preferred over outputs from the 175B GPT-3."
> *(N. del compilador: este quote es de Ouyang 2022, no de RAG — error
> corregido durante /revisar.)*

## Conexiones

- Concepto principal: [[conceptos/rag]]
- Depende de: [[conceptos/transformer]] (BART como backbone)
- Organización: [[entidades/meta-ai-fair]]
- Contraste filosófico con: [[conceptos/fine-tuning]] (parametric memory)
````

- [ ] **Step 4: Write `wiki/fuentes/2022-ouyang-instructgpt.md`**

````markdown
---
titulo: "Training language models to follow instructions with human feedback"
tipo: fuente
autores: ["Long Ouyang", "Jeff Wu", "Xu Jiang", "Diogo Almeida", "Carroll L. Wainwright", "Pamela Mishkin", "Chong Zhang", "Sandhini Agarwal", "Katarina Slama", "Alex Ray", "John Schulman", "Jacob Hilton", "Fraser Kelton", "Luke Miller", "Maddie Simens", "Amanda Askell", "Peter Welinder", "Paul Christiano", "Jan Leike", "Ryan Lowe"]
url: https://arxiv.org/abs/2203.02155
fecha_publicacion: 2022-03-04
formato_original: paper
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
tags: [rlhf, alineacion, instruct-tuning, fine-tuning]
---

# InstructGPT — Training language models to follow instructions with human feedback

## Resumen

Paper de [[entidades/openai]] que introduce el pipeline **[[conceptos/rlhf]]**
(Reinforcement Learning from Human Feedback) aplicado a modelos de lenguaje.
Pipeline de tres etapas: (1) Supervised [[conceptos/fine-tuning]] sobre
demostraciones humanas; (2) entrenamiento de un Reward Model a partir de
rankings humanos; (3) optimización del LM contra el RM usando PPO.

El resultado central — InstructGPT-1.3B supera a GPT-3-175B en preferencia
humana — establece que la alineación con la intención del usuario importa
más que el tamaño bruto del modelo. Es el predecesor directo de ChatGPT.

## Citas clave

> "Making language models bigger does not inherently make them better at
> following a user's intent."

> "The 1.3B parameter InstructGPT model is preferred over outputs from the
> 175B GPT-3 despite having 100x fewer parameters."

## Conexiones

- Concepto principal: [[conceptos/rlhf]]
- Técnica base: [[conceptos/fine-tuning]]
- Organización: [[entidades/openai]]
- Tensión con: [[conceptos/transformer]] (el paper de Vaswani enfatizaba
  arquitectura + datos; InstructGPT enfatiza post-training con humanos)
````

- [ ] **Step 5: Verify all four fuentes pages exist with frontmatter**

Run:
```bash
ls wiki/fuentes/*.md | wc -l
for f in wiki/fuentes/*.md; do head -1 "$f" | grep -q '^---$' || echo "MISSING frontmatter: $f"; done
```
Expected: `4` and no MISSING messages.

- [ ] **Step 6: Commit**

```bash
git add wiki/fuentes
git commit -m "feat: páginas de fuentes en wiki/fuentes (seed)"
```

---

### Task 7: Wiki seed — páginas de entidades

**Files:**
- Create: `wiki/entidades/ashish-vaswani.md`
- Create: `wiki/entidades/jay-alammar.md`
- Create: `wiki/entidades/google-research.md`
- Create: `wiki/entidades/openai.md`
- Create: `wiki/entidades/meta-ai-fair.md`

- [ ] **Step 1: Write `wiki/entidades/ashish-vaswani.md`**

```markdown
---
titulo: Ashish Vaswani
tipo: entidad
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2017-vaswani-attention
tags: [persona, investigador]
---

# Ashish Vaswani

Investigador de NLP / deep learning. Primer autor del paper
[[fuentes/2017-vaswani-attention]] (*Attention Is All You Need*) durante su
tiempo en [[entidades/google-research]] (Google Brain). El paper introdujo
el [[conceptos/transformer]] y se convirtió en la base de la NLP moderna.
```

- [ ] **Step 2: Write `wiki/entidades/jay-alammar.md`**

```markdown
---
titulo: Jay Alammar
tipo: entidad
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2018-alammar-illustrated-transformer
tags: [persona, divulgacion]
---

# Jay Alammar

Divulgador de machine learning. Autor de *The Illustrated* series
([[fuentes/2018-alammar-illustrated-transformer]] entre otros), que se
volvieron referencia divulgativa estándar para entender arquitecturas de
deep learning sin tener que leer los papers originales.
```

- [ ] **Step 3: Write `wiki/entidades/google-research.md`**

```markdown
---
titulo: Google Research
tipo: entidad
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2017-vaswani-attention
tags: [organizacion, big-tech, investigacion]
---

# Google Research

División de investigación de Google. Incluye Google Brain (fusionado con
DeepMind en 2023 como Google DeepMind). Origen del paper
[[fuentes/2017-vaswani-attention]] (*Attention Is All You Need*) — primera
autoría de [[entidades/ashish-vaswani]] — y de otros aportes fundacionales
(BERT, T5, PaLM).
```

- [ ] **Step 4: Write `wiki/entidades/openai.md`**

```markdown
---
titulo: OpenAI
tipo: entidad
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2022-ouyang-instructgpt
tags: [organizacion, lab, comercial]
---

# OpenAI

Laboratorio de IA fundado en 2015. Origen de la serie GPT y del paper
[[fuentes/2022-ouyang-instructgpt]] que introdujo el pipeline
[[conceptos/rlhf]] aplicado a modelos de lenguaje — predecesor directo de
ChatGPT (lanzado a finales de 2022).
```

- [ ] **Step 5: Write `wiki/entidades/meta-ai-fair.md`**

```markdown
---
titulo: Meta AI / FAIR
tipo: entidad
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2020-lewis-rag
tags: [organizacion, big-tech, investigacion]
---

# Meta AI / FAIR (Facebook AI Research)

División de investigación de IA de Meta (antes Facebook AI Research). Origen
del paper [[fuentes/2020-lewis-rag]] que introdujo [[conceptos/rag]]
(Retrieval-Augmented Generation) en 2020, además de aportes como BART, LLaMA
y muchos otros componentes ampliamente usados en la comunidad open-source.
```

- [ ] **Step 6: Verify all five entidades pages exist**

Run:
```bash
ls wiki/entidades/*.md | wc -l
```
Expected: `5`.

- [ ] **Step 7: Commit**

```bash
git add wiki/entidades
git commit -m "feat: páginas de entidades (autores y organizaciones) en wiki/entidades"
```

---

### Task 8: Wiki seed — páginas de conceptos (incluye callout de contradicción)

**Files:**
- Create: `wiki/conceptos/transformer.md` (tocado por fuentes #1 y #2 — demuestra compounding)
- Create: `wiki/conceptos/atencion.md` (tocado por fuentes #1 y #2)
- Create: `wiki/conceptos/encoder-decoder.md`
- Create: `wiki/conceptos/rag.md`
- Create: `wiki/conceptos/fine-tuning.md`
- Create: `wiki/conceptos/rlhf.md` (incluye callout `> [!contradicción]` vs. transformer.md — demuestra el patrón)
- Create: `wiki/conceptos/prompt.md`

- [ ] **Step 1: Write `wiki/conceptos/transformer.md`** (compounding example: fuentes 1 + 2)

````markdown
---
titulo: Transformer
tipo: concepto
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2017-vaswani-attention
  - 2018-alammar-illustrated-transformer
tags: [arquitectura, deep-learning, fundacional]
---

# Transformer

Arquitectura de red neuronal introducida en
[[fuentes/2017-vaswani-attention]] (Vaswani et al., 2017). Basada
*exclusivamente* en mecanismos de [[conceptos/atencion]] — sin recurrencia
ni convoluciones. Esta decisión arquitectónica es el quiebre histórico que
hizo posible el escalamiento masivo de modelos de lenguaje: al no depender
del orden secuencial de procesamiento, el entrenamiento se paraleliza
nativamente sobre GPUs.

## Estructura

Encoder-decoder ([[conceptos/encoder-decoder]]), cada lado con N capas
idénticas (N=6 en el paper original). Cada capa del encoder tiene dos
sub-capas: multi-head self-attention y feed-forward. Cada capa del decoder
añade una tercera: cross-attention sobre la salida del encoder.

## Componentes adicionales

- **Positional encoding**: como el modelo no tiene noción intrínseca de
  orden (es invariante a permutaciones de entrada), Vaswani et al. inyectan
  funciones sinusoidales a los embeddings para codificar posición.
- **Residual connections + Layer Norm** alrededor de cada sub-capa.
- **Multi-head attention**: ejecuta atención en paralelo sobre múltiples
  proyecciones, concatena los resultados. [[fuentes/2018-alammar-illustrated-transformer]]
  ofrece la mejor explicación visual de este componente.

## Impacto

Casi toda la NLP moderna es una variante del Transformer: BERT (encoder
only), GPT (decoder only), T5 (encoder-decoder), BART (encoder-decoder usado
como backbone de [[conceptos/rag]]), etc. Trabajos posteriores como
[[conceptos/rlhf]] añaden post-training sobre estos modelos sin alterar la
arquitectura.
````

- [ ] **Step 2: Write `wiki/conceptos/atencion.md`** (compounding: fuentes 1 + 2)

````markdown
---
titulo: Atención (Attention)
tipo: concepto
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2017-vaswani-attention
  - 2018-alammar-illustrated-transformer
tags: [mecanismo, deep-learning]
---

# Atención (Attention)

Mecanismo que permite a una red neuronal pesar dinámicamente diferentes
partes de su entrada al producir cada elemento de su salida. Predecesor
existía en redes recurrentes (Bahdanau et al., 2014), pero el
[[conceptos/transformer]] llevó la idea a su forma pura: una arquitectura
*basada únicamente* en atención.

## Scaled Dot-Product Attention

Definida en [[fuentes/2017-vaswani-attention]] como:

```
Attention(Q, K, V) = softmax(QKᵀ / √d_k) V
```

Donde Q (Query), K (Key) y V (Value) son proyecciones lineales del input.
El softmax sobre los scores `QKᵀ` produce pesos que se aplican a V para
obtener la salida.

## Self-Attention vs. Cross-Attention

- **Self-attention**: Q, K, V vienen todos del mismo input. Usado en el
  encoder y en el decoder (con masking causal en el decoder).
- **Cross-attention**: Q viene del decoder, K y V de la salida del encoder.
  Permite al decoder atender a la entrada original.

## Multi-Head

En lugar de una sola atención, se ejecutan H atenciones en paralelo (H=8 en
el paper), cada una con proyecciones aprendidas distintas. Las salidas se
concatenan. [[fuentes/2018-alammar-illustrated-transformer]] explica esto
con diagramas particularmente claros.
````

- [ ] **Step 3: Write `wiki/conceptos/encoder-decoder.md`**

```markdown
---
titulo: Arquitectura Encoder-Decoder
tipo: concepto
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2017-vaswani-attention
tags: [arquitectura]
---

# Arquitectura Encoder-Decoder

Patrón arquitectónico de dos partes: un **encoder** que procesa la entrada y
produce una representación intermedia, y un **decoder** que genera la salida
condicionado en esa representación. Usado clásicamente en traducción
automática (entrada en un idioma → representación → salida en otro).

El [[conceptos/transformer]] original ([[fuentes/2017-vaswani-attention]])
usa esta estructura: 6 capas de encoder y 6 de decoder. Variantes posteriores
escogieron usar solo una parte: BERT (encoder only, para clasificación y
embeddings), GPT (decoder only, para generación). T5 y BART mantienen ambos.
```

- [ ] **Step 4: Write `wiki/conceptos/rag.md`**

```markdown
---
titulo: RAG (Retrieval-Augmented Generation)
tipo: concepto
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2020-lewis-rag
tags: [retrieval, conocimiento, arquitectura]
---

# RAG — Retrieval-Augmented Generation

Patrón híbrido que combina un modelo generativo (típicamente un
[[conceptos/transformer]] seq2seq como BART) con un índice externo de
documentos (memoria no-paramétrica). Introducido por Lewis et al. 2020
([[fuentes/2020-lewis-rag]]).

## Flujo

1. El usuario hace una pregunta.
2. Un **retriever** (originalmente DPR — Dense Passage Retrieval) busca los
   top-k pasajes más relevantes de un corpus (en el paper original,
   Wikipedia indexada como vectores densos).
3. Esos pasajes se concatenan al prompt del modelo generativo.
4. El generador produce la respuesta condicionado en la pregunta + pasajes.

## Por qué importa

Separa conocimiento (índice actualizable, inspeccionable, atribuible) de
razonamiento (capacidad del modelo). Contrasta con el approach de
[[conceptos/fine-tuning]], donde se intenta meter el conocimiento dentro de
los parámetros — lo que es costoso, opaco, y queda obsoleto.

## Limitaciones

- Calidad del retriever marca un techo: si no recupera el pasaje correcto,
  el generador no puede compensar.
- Latencia adicional (la búsqueda añade un round-trip).
- El corpus necesita mantenerse.

El patrón LLM+Wiki implementado en este repositorio es conceptualmente
distinto a RAG: en lugar de retrieve-on-query, *acumula* conocimiento
sintetizado en una capa wiki persistente que se construye una vez (en
ingest) y se mantiene.
```

- [ ] **Step 5: Write `wiki/conceptos/fine-tuning.md`**

```markdown
---
titulo: Fine-Tuning
tipo: concepto
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2022-ouyang-instructgpt
tags: [entrenamiento, post-training]
---

# Fine-Tuning

Proceso de continuar el entrenamiento de un modelo pre-entrenado sobre un
dataset más pequeño, específico de una tarea o dominio. A diferencia del
pre-entrenamiento (que aprende representaciones generales desde gran cantidad
de texto), el fine-tuning ajusta el modelo a un comportamiento deseado.

## Variantes

- **Supervised Fine-Tuning (SFT)**: el dataset son pares (input, output
  deseado). El modelo aprende por máxima verosimilitud.
- **Instruction Tuning**: SFT sobre datasets de instrucciones y respuestas
  ejemplares, para que el modelo siga instrucciones en general.
- **[[conceptos/rlhf]]**: combina SFT con aprendizaje por refuerzo desde
  feedback humano. Pipeline de tres etapas demostrado por
  [[fuentes/2022-ouyang-instructgpt]].

## Costos

Fine-tuning sobre el modelo completo requiere actualizar todos los
parámetros (caro en cómputo y memoria). Técnicas modernas como LoRA y
adapters entrenan solo una fracción pequeña, reduciendo el costo.
```

- [ ] **Step 6: Write `wiki/conceptos/rlhf.md`** (with contradicción callout — the pedagogical centerpiece)

````markdown
---
titulo: RLHF (Reinforcement Learning from Human Feedback)
tipo: concepto
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2022-ouyang-instructgpt
tags: [post-training, alineacion, rl]
---

# RLHF — Reinforcement Learning from Human Feedback

Pipeline de tres etapas para alinear modelos de lenguaje con preferencias
humanas, formalizado y aplicado a escala por
[[fuentes/2022-ouyang-instructgpt]] (Ouyang et al., 2022, OpenAI):

1. **Supervised Fine-Tuning**: [[conceptos/fine-tuning]] supervisado sobre
   demostraciones humanas del comportamiento deseado.
2. **Reward Model training**: humanos rankean varias salidas del modelo para
   un mismo prompt; un Reward Model (RM) aprende a predecir esos rankings.
3. **PPO optimization**: el LM se optimiza con Proximal Policy Optimization
   para maximizar el reward predicho por el RM, con una penalización KL
   que mantiene al modelo cerca del SFT inicial.

## Resultado central

InstructGPT-1.3B (post-RLHF) supera a GPT-3-175B (sin RLHF) en preferencia
humana, **a pesar de tener 100x menos parámetros**. Es decir: alineación
con la intención del usuario importa más que el tamaño bruto.

> [!contradicción]
> [[fuentes/2017-vaswani-attention]] (Vaswani et al., 2017) implícitamente
> sostiene que la mejora viene de arquitectura + datos a escala — el paper
> reporta SOTA tras entrenar Transformers sin ningún post-training con
> humanos.
>
> [[fuentes/2022-ouyang-instructgpt]] sostiene lo opuesto: a partir de
> cierta escala, el post-training con feedback humano vale más que más
> parámetros. La utilidad práctica de un LM viene de alinearlo, no de
> agrandarlo.
>
> Resolución parcial: ambos pueden ser ciertos en su propio contexto.
> Vaswani habla de calidad de traducción (métrica BLEU); Ouyang habla de
> preferencia humana en tareas abiertas. Pero la tensión filosófica
> subyacente — "¿dónde está el cuello de botella, en la arquitectura o en
> la alineación?" — sigue abierta. Pendiente: incorporar más fuentes
> (scaling laws de Kaplan 2020, Chinchilla de Hoffmann 2022).

## Limitaciones

- El modelo aprende los sesgos de los anotadores.
- Alinear a "intent" no es lo mismo que alinear a "valores".
- El RM puede ser hackeado por el LM (reward hacking).
````

- [ ] **Step 7: Write `wiki/conceptos/prompt.md`**

```markdown
---
titulo: Prompt
tipo: concepto
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2022-ouyang-instructgpt
tags: [interfaz, inferencia]
---

# Prompt

Texto de entrada que se le da a un modelo de lenguaje en tiempo de
inferencia para condicionar su salida. En modelos pre-RLHF (GPT-3 base) el
prompt típico era un *completion* — pocas líneas que el modelo continúa. En
modelos post-[[conceptos/rlhf]] (InstructGPT, ChatGPT) el prompt es una
*instrucción* que el modelo trata de seguir directamente, lo que cambia
radicalmente la ergonomía.

La transición de "few-shot completion" a "instruction following" como
paradigma dominante se le atribuye a [[fuentes/2022-ouyang-instructgpt]].
"Prompt engineering" emergió como práctica entre ese paper y el lanzamiento
público de ChatGPT a finales de 2022.
```

- [ ] **Step 8: Verify all seven conceptos pages exist with the contradicción callout in rlhf.md**

Run:
```bash
ls wiki/conceptos/*.md | wc -l
grep -l '\[!contradicción\]' wiki/conceptos/*.md
```
Expected: `7` and `wiki/conceptos/rlhf.md` listed.

- [ ] **Step 9: Commit**

```bash
git add wiki/conceptos
git commit -m "feat: páginas de conceptos en wiki/conceptos (incluye callout de contradicción)"
```

---

### Task 9: index.md, log.md (seed + .empty templates)

**Files:**
- Create: `wiki/index.empty.md`
- Create: `wiki/log.empty.md`
- Create: `wiki/index.md`
- Create: `wiki/log.md`

The `.empty.md` files are the reference templates copied during reset. The
`index.md` and `log.md` start their lives as the populated seed versions.

- [ ] **Step 1: Write `wiki/index.empty.md`** (the reset template)

```markdown
# Índice del Wiki

Catálogo de todas las páginas. El agente lo actualiza al final de cada
`/ingerir` y `/consultar` (cuando filas la respuesta).

## Entidades

*(vacío — añade fuentes con `/ingerir` para empezar a poblarlo)*

## Conceptos

*(vacío)*

## Fuentes

*(vacío)*

## Respuestas

*(vacío)*
```

- [ ] **Step 2: Write `wiki/log.empty.md`** (the reset template)

```markdown
# Log

Cronológico, append-only. Cada entrada tiene el prefijo
`## [YYYY-MM-DD] <operación> | <descripción>` para que sea parseable con
herramientas unix:

```bash
grep "^## \[" wiki/log.md | tail -10
```

---

*(vacío — el agente añadirá entradas conforme ingieras, consultes y revises)*
```

- [ ] **Step 3: Write `wiki/index.md`** (populated seed version)

```markdown
# Índice del Wiki

Catálogo de todas las páginas. El agente lo actualiza al final de cada
`/ingerir` y `/consultar` (cuando filas la respuesta).

## Entidades

- [[entidades/ashish-vaswani]] — primer autor de *Attention Is All You Need*
- [[entidades/jay-alammar]] — divulgador, autor de *The Illustrated Transformer*
- [[entidades/google-research]] — origen del Transformer
- [[entidades/openai]] — origen de InstructGPT / ChatGPT
- [[entidades/meta-ai-fair]] — origen de RAG

## Conceptos

- [[conceptos/atencion]] — mecanismo core (scaled dot-product, multi-head)
- [[conceptos/encoder-decoder]] — patrón arquitectónico
- [[conceptos/fine-tuning]] — post-training supervisado
- [[conceptos/prompt]] — entrada de inferencia, evolución pre/post RLHF
- [[conceptos/rag]] — generación aumentada por retrieval
- [[conceptos/rlhf]] — alineación por feedback humano (con [!contradicción] vs. Transformer)
- [[conceptos/transformer]] — la arquitectura fundacional

## Fuentes

- [[fuentes/2017-vaswani-attention]] — Vaswani et al., *Attention Is All You Need*
- [[fuentes/2018-alammar-illustrated-transformer]] — Alammar, *The Illustrated Transformer*
- [[fuentes/2020-lewis-rag]] — Lewis et al., *Retrieval-Augmented Generation…*
- [[fuentes/2022-ouyang-instructgpt]] — Ouyang et al., *InstructGPT*

## Respuestas

*(vacío — usa `/consultar` y dile al agente que fila la respuesta)*
```

- [ ] **Step 4: Write `wiki/log.md`** (populated seed: 4 /ingerir + 1 /revisar)

```markdown
# Log

Cronológico, append-only. Cada entrada tiene el prefijo
`## [YYYY-MM-DD] <operación> | <descripción>` para que sea parseable con
herramientas unix:

```bash
grep "^## \[" wiki/log.md | tail -10
```

---

## [2026-05-26] ingerir | Vaswani et al. 2017 — Attention Is All You Need

- Fuente: [[fuentes/2017-vaswani-attention]]
- Páginas creadas: [[conceptos/transformer]], [[conceptos/atencion]],
  [[conceptos/encoder-decoder]], [[entidades/ashish-vaswani]],
  [[entidades/google-research]]
- Notas: paper fundacional. Plantea Transformer puro-atención.

## [2026-05-26] ingerir | Alammar 2018 — The Illustrated Transformer

- Fuente: [[fuentes/2018-alammar-illustrated-transformer]]
- Páginas tocadas: [[conceptos/transformer]] (enriquecida), [[conceptos/atencion]] (enriquecida),
  [[entidades/jay-alammar]] (creada)
- Notas: explainer, no introduce ideas nuevas. Demuestra cómo enriquecer
  páginas existentes en vez de duplicar.

## [2026-05-26] ingerir | Lewis et al. 2020 — RAG

- Fuente: [[fuentes/2020-lewis-rag]]
- Páginas creadas: [[conceptos/rag]], [[entidades/meta-ai-fair]]
- Páginas tocadas: [[conceptos/transformer]] (BART como backbone)
- Notas: introduce el patrón RAG. Cross-ref a Transformer.

## [2026-05-26] ingerir | Ouyang et al. 2022 — InstructGPT

- Fuente: [[fuentes/2022-ouyang-instructgpt]]
- Páginas creadas: [[conceptos/rlhf]], [[conceptos/fine-tuning]],
  [[conceptos/prompt]], [[entidades/openai]]
- Notas: pipeline RLHF de tres etapas. **Detectada contradicción** con
  [[fuentes/2017-vaswani-attention]] sobre dónde está el cuello de botella
  (arquitectura+datos vs. post-training+humanos). Marcada con callout en
  [[conceptos/rlhf]].

## [2026-05-26] revisar | 1 hallazgo menor

- Links rotos: 0
- Páginas huérfanas: 0 (todas las entidades y conceptos tienen ≥1 link
  entrante; las fuentes se enlazan via `fuentes:` del frontmatter).
- Conceptos sin página: 0 hallados a este punto.
- Contradicciones no marcadas: 0 (la única detectada quedó marcada en
  [[conceptos/rlhf]]).
- Frontmatter: consistente en las 16 páginas.
- Stale: ninguna; el wiki es nuevo.
- Hallazgo menor: en [[fuentes/2020-lewis-rag]] había una cita atribuida
  incorrectamente a Lewis et al. cuando en realidad es de Ouyang et al.
  Marcada con nota del compilador en el cuerpo en vez de borrar (para que
  el caso quede visible como ejemplo pedagógico).
- Sugerencias: ingerir Kaplan 2020 (scaling laws) y Hoffmann 2022
  (Chinchilla) para resolver mejor la contradicción registrada en
  [[conceptos/rlhf]].
```

- [ ] **Step 5: Verify both .empty files and both populated files exist**

Run:
```bash
ls wiki/*.md
```
Expected: `wiki/index.empty.md  wiki/index.md  wiki/log.empty.md  wiki/log.md`

- [ ] **Step 6: Verify log entries are parseable**

Run:
```bash
grep -c '^## \[2026-' wiki/log.md
```
Expected: `5`.

- [ ] **Step 7: Commit**

```bash
git add wiki/index.md wiki/index.empty.md wiki/log.md wiki/log.empty.md
git commit -m "feat: index.md, log.md y plantillas .empty.md (seed)"
```

---

### Task 10: Verificación end-to-end

This task walks through the spec's "Verificación" checklist and ensures the
entire deliverable hangs together. No new files; just verification commands.

**Files:** none (verification only)

- [ ] **Step 1: All expected files exist**

Run:
```bash
find . -type f \( -name '*.md' -o -name '*.json' \) -not -path './.git/*' -not -path './docs/*' | sort
```
Expected output (exact list):
```
./.claude/commands/consultar.md
./.claude/commands/ingerir.md
./.claude/commands/revisar.md
./.claude/settings.json
./CLAUDE.md
./README.md
./raw/_ejemplo/2017-vaswani-attention.md
./raw/_ejemplo/2018-alammar-illustrated-transformer.md
./raw/_ejemplo/2020-lewis-rag.md
./raw/_ejemplo/2022-ouyang-instructgpt.md
./wiki/conceptos/atencion.md
./wiki/conceptos/encoder-decoder.md
./wiki/conceptos/fine-tuning.md
./wiki/conceptos/prompt.md
./wiki/conceptos/rag.md
./wiki/conceptos/rlhf.md
./wiki/conceptos/transformer.md
./wiki/entidades/ashish-vaswani.md
./wiki/entidades/google-research.md
./wiki/entidades/jay-alammar.md
./wiki/entidades/meta-ai-fair.md
./wiki/entidades/openai.md
./wiki/fuentes/2017-vaswani-attention.md
./wiki/fuentes/2018-alammar-illustrated-transformer.md
./wiki/fuentes/2020-lewis-rag.md
./wiki/fuentes/2022-ouyang-instructgpt.md
./wiki/index.empty.md
./wiki/index.md
./wiki/log.empty.md
./wiki/log.md
```

That's 30 files. Breakdown of the wiki content: 1 `index.md` + 1 `log.md` + 4 fuentes + 5 entidades + 7 conceptos = 18 working pages, plus 2 `.empty.md` templates = 20 markdown files under `wiki/`. The other 10 files are root config (CLAUDE.md, README.md), `.claude/` (4), and `raw/_ejemplo/` (4).

- [ ] **Step 2: All wiki pages (except index/log) have YAML frontmatter**

Run:
```bash
for f in $(find wiki -name '*.md' -not -name 'index*' -not -name 'log*'); do
  head -1 "$f" | grep -q '^---$' || echo "FAIL: $f missing frontmatter"
done
echo "done"
```
Expected: `done` only (no FAIL messages).

- [ ] **Step 3: Frontmatter parses as valid YAML**

Run:
```bash
python3 - <<'EOF'
import re, sys
from pathlib import Path
try:
    import yaml
except ImportError:
    print("pip install pyyaml — but trying basic parse instead")
    sys.exit(0)
fails = 0
for f in Path("wiki").rglob("*.md"):
    if f.name.startswith("index") or f.name.startswith("log"):
        continue
    text = f.read_text()
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        print(f"FAIL: no frontmatter in {f}"); fails += 1; continue
    try:
        yaml.safe_load(m.group(1))
    except yaml.YAMLError as e:
        print(f"FAIL: yaml error in {f}: {e}"); fails += 1
print(f"{fails} failures")
EOF
```
Expected: `0 failures`.

- [ ] **Step 4: All wikilinks resolve to existing pages**

Run:
```bash
python3 - <<'EOF'
import re
from pathlib import Path
wiki = Path("wiki")
existing = {str(p.relative_to(wiki)).removesuffix(".md") for p in wiki.rglob("*.md")}
fails = 0
for f in wiki.rglob("*.md"):
    text = f.read_text()
    for m in re.finditer(r"\[\[([^\]|#]+)(?:\|[^\]]+)?\]\]", text):
        target = m.group(1).strip()
        if target not in existing:
            print(f"BROKEN: {f} → [[{target}]]")
            fails += 1
print(f"{fails} broken wikilinks")
EOF
```
Expected: `0 broken wikilinks`.

- [ ] **Step 5: The contradicción callout is present in rlhf.md and references both contradicting fuentes**

Run:
```bash
grep -A 12 '\[!contradicción\]' wiki/conceptos/rlhf.md | \
  grep -E '2017-vaswani-attention|2022-ouyang-instructgpt' | wc -l
```
Expected: `2` (both fuentes referenced inside the callout block).

- [ ] **Step 6: Log entries are parseable with the documented grep**

Run:
```bash
grep '^## \[' wiki/log.md
```
Expected: 5 lines, each starting with `## [2026-05-26]`.

- [ ] **Step 7: The reset commands from README actually work (in a fresh worktree, dry-run)**

This is a destructive check, so run in a scratch copy:

```bash
TMPDIR=$(mktemp -d)
cp -r . "$TMPDIR/wiki-test"
cd "$TMPDIR/wiki-test"
rm -rf raw/_ejemplo
rm -f wiki/fuentes/*.md wiki/entidades/*.md wiki/conceptos/*.md
rm -rf wiki/respuestas
cp wiki/index.empty.md wiki/index.md
cp wiki/log.empty.md   wiki/log.md
# Now verify the wiki is clean:
ls wiki/fuentes wiki/entidades wiki/conceptos
head -3 wiki/index.md
cd - >/dev/null
rm -rf "$TMPDIR"
```
Expected: the three `wiki/<sub>/` directories show only `.gitkeep`; `wiki/index.md` shows the empty template heading.

- [ ] **Step 8: Spec verification checklist (manual)**

Walk through each item from the spec's "Verificación" section:

- [ ] Run `claude` and execute `/consultar "¿qué es RAG y cómo se relaciona con Transformer?"` — verify response cites `[[conceptos/rag]]` and `[[conceptos/transformer]]`.
- [ ] Run `/revisar` — verify it produces a coherent report (likely "sin hallazgos críticos" given the seed is clean).
- [ ] Open the repo as an Obsidian vault — verify graph view shows the seed wiki's link structure (no isolated nodes among entidades/conceptos).
- [ ] Ask a Spanish-speaking person unfamiliar with the project to read README only and tell you what they'd do first. They should arrive at `/consultar` or `/ingerir` without help.

Note: steps 7-8 use real user-facing tools (Claude Code CLI, Obsidian). If
those aren't available in the implementation environment, mark them as
"deferred to user verification" and report which automated steps (1-6) all
passed.

- [ ] **Step 9: Final commit (housekeeping if anything was tweaked during verification)**

Run:
```bash
git status
```
If clean: nothing to do. If there are tweaks from verification steps,
commit them with a message like:
```
git commit -am "chore: tweaks de verificación final"
```

- [ ] **Step 10: Summarize for the user**

Report: total files committed, total commits in the branch, links between
pages (count), and any deferred verification steps from Step 8.
