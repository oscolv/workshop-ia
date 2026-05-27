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
   este archivo y avísale al usuario. (Nota: `.claude/settings.json`
   intencionalmente NO te da permiso automático para editar este archivo —
   tendrás que pedir aprobación explícita al usuario. Es la salvaguarda
   contra schema-drift no autorizado.)

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
