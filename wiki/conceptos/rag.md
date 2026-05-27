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
