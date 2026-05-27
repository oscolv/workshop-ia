---
titulo: RLHF (Reinforcement Learning from Human Feedback)
tipo: concepto
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2022-ouyang-instructgpt
tags: [post-training, alineacion, rl]
---

# RLHF — Reinforcement Learning from Human Feedback

Pipeline de tres etapas para alinear modelos de lenguaje con preferencias
humanas, formalizado y aplicado a escala por
[[fuentes/2022-ouyang-instructgpt]] (Ouyang et al., 2022, OpenAI):

1. **Supervised Fine-Tuning**: [[conceptos/fine-tuning]] supervisado sobre
   demostraciones humanas del comportamiento deseado.
2. **Reward Model training**: humanos rankean varias salidas del modelo para
   un mismo prompt; un Reward Model (RM) aprende a predecir esos rankings.
3. **PPO optimization**: el LM se optimiza con Proximal Policy Optimization
   para maximizar el reward predicho por el RM, con una penalización KL
   que mantiene al modelo cerca del SFT inicial.

## Resultado central

InstructGPT-1.3B (post-RLHF) supera a GPT-3-175B (sin RLHF) en preferencia
humana, **a pesar de tener 100x menos parámetros**. Es decir: alineación
con la intención del usuario importa más que el tamaño bruto.

> [!contradicción]
> [[fuentes/2017-vaswani-attention]] (Vaswani et al., 2017) implícitamente
> sostiene que la mejora viene de arquitectura + datos a escala — el paper
> reporta SOTA tras entrenar Transformers sin ningún post-training con
> humanos.
>
> [[fuentes/2022-ouyang-instructgpt]] sostiene lo opuesto: a partir de
> cierta escala, el post-training con feedback humano vale más que más
> parámetros. La utilidad práctica de un LM viene de alinearlo, no de
> agrandarlo.
>
> Resolución parcial: ambos pueden ser ciertos en su propio contexto.
> Vaswani habla de calidad de traducción (métrica BLEU); Ouyang habla de
> preferencia humana en tareas abiertas. Pero la tensión filosófica
> subyacente — "¿dónde está el cuello de botella, en la arquitectura o en
> la alineación?" — sigue abierta. Pendiente: incorporar más fuentes
> (scaling laws de Kaplan 2020, Chinchilla de Hoffmann 2022).

## Limitaciones

- El modelo aprende los sesgos de los anotadores.
- Alinear a "intent" no es lo mismo que alinear a "valores".
- El RM puede ser hackeado por el LM (reward hacking).
