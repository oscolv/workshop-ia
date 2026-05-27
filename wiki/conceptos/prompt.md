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
