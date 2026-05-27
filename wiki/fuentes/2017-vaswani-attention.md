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
