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
