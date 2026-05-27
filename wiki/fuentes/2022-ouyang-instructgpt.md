---
titulo: "Training language models to follow instructions with human feedback"
tipo: fuente
autores: ["Long Ouyang", "Jeff Wu", "Xu Jiang", "Diogo Almeida", "Carroll L. Wainwright", "Pamela Mishkin", "Chong Zhang", "Sandhini Agarwal", "Katarina Slama", "Alex Ray", "John Schulman", "Jacob Hilton", "Fraser Kelton", "Luke Miller", "Maddie Simens", "Amanda Askell", "Peter Welinder", "Paul Christiano", "Jan Leike", "Ryan Lowe"]
url: https://arxiv.org/abs/2203.02155
fecha_publicacion: 2022-03-04
formato_original: paper
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
tags: [rlhf, alineacion, instruct-tuning, fine-tuning]
---

# InstructGPT — Training language models to follow instructions with human feedback

## Resumen

Paper de [[entidades/openai]] que introduce el pipeline **[[conceptos/rlhf]]**
(Reinforcement Learning from Human Feedback) aplicado a modelos de lenguaje.
Pipeline de tres etapas: (1) Supervised [[conceptos/fine-tuning]] sobre
demostraciones humanas; (2) entrenamiento de un Reward Model a partir de
rankings humanos; (3) optimización del LM contra el RM usando PPO.

El resultado central — InstructGPT-1.3B supera a GPT-3-175B en preferencia
humana — establece que la alineación con la intención del usuario importa
más que el tamaño bruto del modelo. Es el predecesor directo de ChatGPT.

## Citas clave

> "Making language models bigger does not inherently make them better at
> following a user's intent."

> "The 1.3B parameter InstructGPT model is preferred over outputs from the
> 175B GPT-3 despite having 100x fewer parameters."

## Conexiones

- Concepto principal: [[conceptos/rlhf]]
- Técnica base: [[conceptos/fine-tuning]]
- Organización: [[entidades/openai]]
- Tensión con: [[conceptos/transformer]] (el paper de Vaswani enfatizaba
  arquitectura + datos; InstructGPT enfatiza post-training con humanos)
