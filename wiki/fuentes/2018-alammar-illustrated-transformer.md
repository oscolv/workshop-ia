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
