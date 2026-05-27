---
titulo: Transformer
tipo: concepto
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2017-vaswani-attention
  - 2018-alammar-illustrated-transformer
tags: [arquitectura, deep-learning, fundacional]
---

# Transformer

Arquitectura de red neuronal introducida en
[[fuentes/2017-vaswani-attention]] (Vaswani et al., 2017). Basada
*exclusivamente* en mecanismos de [[conceptos/atencion]] — sin recurrencia
ni convoluciones. Esta decisión arquitectónica es el quiebre histórico que
hizo posible el escalamiento masivo de modelos de lenguaje: al no depender
del orden secuencial de procesamiento, el entrenamiento se paraleliza
nativamente sobre GPUs.

## Estructura

Encoder-decoder ([[conceptos/encoder-decoder]]), cada lado con N capas
idénticas (N=6 en el paper original). Cada capa del encoder tiene dos
sub-capas: multi-head self-attention y feed-forward. Cada capa del decoder
añade una tercera: cross-attention sobre la salida del encoder.

## Componentes adicionales

- **Positional encoding**: como el modelo no tiene noción intrínseca de
  orden (es invariante a permutaciones de entrada), Vaswani et al. inyectan
  funciones sinusoidales a los embeddings para codificar posición.
- **Residual connections + Layer Norm** alrededor de cada sub-capa.
- **Multi-head attention**: ejecuta atención en paralelo sobre múltiples
  proyecciones, concatena los resultados. [[fuentes/2018-alammar-illustrated-transformer]]
  ofrece la mejor explicación visual de este componente.

## Impacto

Casi toda la NLP moderna es una variante del Transformer: BERT (encoder
only), GPT (decoder only), T5 (encoder-decoder), BART (encoder-decoder usado
como backbone de [[conceptos/rag]]), etc. Trabajos posteriores como
[[conceptos/rlhf]] añaden post-training sobre estos modelos sin alterar la
arquitectura.
