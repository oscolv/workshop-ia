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
