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
