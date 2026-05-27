---
titulo: "Training language models to follow instructions with human feedback"
autores: ["Long Ouyang", "Jeff Wu", "Xu Jiang", "Diogo Almeida", "Carroll L. Wainwright", "Pamela Mishkin", "Chong Zhang", "Sandhini Agarwal", "Katarina Slama", "Alex Ray", "John Schulman", "Jacob Hilton", "Fraser Kelton", "Luke Miller", "Maddie Simens", "Amanda Askell", "Peter Welinder", "Paul Christiano", "Jan Leike", "Ryan Lowe"]
afiliacion: OpenAI
url: https://arxiv.org/abs/2203.02155
fecha_publicacion: 2022-03-04
formato_original: paper
venue: NeurIPS 2022
---

# Training language models to follow instructions with human feedback (InstructGPT)

## Abstract (original, abreviado)

> Making language models bigger does not inherently make them better at
> following a user's intent. (...) We show an avenue for aligning language
> models with user intent on a wide range of tasks by **fine-tuning with
> human feedback**. Starting with a set of labeler-written prompts and
> prompts submitted through the OpenAI API, we collect a dataset of labeler
> demonstrations of the desired model behavior, which we use to fine-tune
> GPT-3 using supervised learning. We then collect a dataset of rankings of
> model outputs, which we use to further fine-tune this supervised model
> using **reinforcement learning from human feedback (RLHF)**. We call the
> resulting models **InstructGPT**. (...) The 1.3B InstructGPT model is
> preferred over outputs from the 175B GPT-3 despite having 100x fewer
> parameters.

## Pasajes clave

- Introduce el pipeline RLHF de tres etapas: (1) Supervised Fine-Tuning
  sobre demostraciones humanas; (2) entrenamiento de un Reward Model a partir
  de rankings humanos; (3) optimización del LM contra el RM usando PPO.
- Resultado clave: alineación con la intención del usuario importa más que
  escala bruta. InstructGPT-1.3B supera a GPT-3-175B en preferencia humana.
- Contrasta con el supuesto implícito de Vaswani et al. (2017) — donde la
  mejora venía de arquitectura + datos — al mostrar que el *post-training*
  con feedback humano es esencial para utilidad práctica.
- Discute limitaciones: el modelo aprende los sesgos de los anotadores;
  alinear a "intent" no es lo mismo que alinear a "valores".
- Predecesor directo de ChatGPT (lanzado a finales de 2022).

## Enlace al original

[arxiv.org/abs/2203.02155](https://arxiv.org/abs/2203.02155)
