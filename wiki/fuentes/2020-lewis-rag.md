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
