---
titulo: "Attention Is All You Need"
autores: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit", "Llion Jones", "Aidan N. Gomez", "Łukasz Kaiser", "Illia Polosukhin"]
afiliacion: Google Brain, Google Research, University of Toronto
url: https://arxiv.org/abs/1706.03762
fecha_publicacion: 2017-06-12
formato_original: paper
venue: NeurIPS 2017
---

# Attention Is All You Need

## Abstract (original)

> The dominant sequence transduction models are based on complex recurrent or
> convolutional neural networks that include an encoder and a decoder. The
> best performing models also connect the encoder and decoder through an
> attention mechanism. We propose a new simple network architecture, the
> Transformer, based solely on attention mechanisms, dispensing with recurrence
> and convolutions entirely. Experiments on two machine translation tasks show
> these models to be superior in quality while being more parallelizable and
> requiring significantly less time to train.

## Pasajes clave

- Introduce la arquitectura **Transformer**, basada exclusivamente en
  mecanismos de atención (self-attention) — sin RNN, sin CNN.
- Define la atención escalada por producto punto (*scaled dot-product
  attention*) y la atención multi-cabeza (*multi-head attention*).
- Estructura encoder-decoder: 6 capas en cada lado, residual connections,
  layer normalization.
- El modelo se entrena en horas (no días) sobre WMT14 EN-DE y EN-FR, supera
  el SOTA en ambos.
- Sienta la base para casi toda la NLP moderna (BERT, GPT, T5, etc. son
  variantes del Transformer).

## Enlace al original

[arxiv.org/abs/1706.03762](https://arxiv.org/abs/1706.03762)
