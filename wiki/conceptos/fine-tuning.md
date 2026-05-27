---
titulo: Fine-Tuning
tipo: concepto
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2022-ouyang-instructgpt
tags: [entrenamiento, post-training]
---

# Fine-Tuning

Proceso de continuar el entrenamiento de un modelo pre-entrenado sobre un
dataset más pequeño, específico de una tarea o dominio. A diferencia del
pre-entrenamiento (que aprende representaciones generales desde gran cantidad
de texto), el fine-tuning ajusta el modelo a un comportamiento deseado.

## Variantes

- **Supervised Fine-Tuning (SFT)**: el dataset son pares (input, output
  deseado). El modelo aprende por máxima verosimilitud.
- **Instruction Tuning**: SFT sobre datasets de instrucciones y respuestas
  ejemplares, para que el modelo siga instrucciones en general.
- **[[conceptos/rlhf]]**: combina SFT con aprendizaje por refuerzo desde
  feedback humano. Pipeline de tres etapas demostrado por
  [[fuentes/2022-ouyang-instructgpt]].

## Costos

Fine-tuning sobre el modelo completo requiere actualizar todos los
parámetros (caro en cómputo y memoria). Técnicas modernas como LoRA y
adapters entrenan solo una fracción pequeña, reduciendo el costo.
