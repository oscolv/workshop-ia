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
