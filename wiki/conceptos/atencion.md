---
titulo: Atención (Attention)
tipo: concepto
fecha_creacion: 2026-05-26
fecha_actualizacion: 2026-05-26
fuentes:
  - 2017-vaswani-attention
  - 2018-alammar-illustrated-transformer
tags: [mecanismo, deep-learning]
---

# Atención (Attention)

Mecanismo que permite a una red neuronal pesar dinámicamente diferentes
partes de su entrada al producir cada elemento de su salida. Predecesor
existía en redes recurrentes (Bahdanau et al., 2014), pero el
[[conceptos/transformer]] llevó la idea a su forma pura: una arquitectura
*basada únicamente* en atención.

## Scaled Dot-Product Attention

Definida en [[fuentes/2017-vaswani-attention]] como:

```
Attention(Q, K, V) = softmax(QKᵀ / √d_k) V
```

Donde Q (Query), K (Key) y V (Value) son proyecciones lineales del input.
El softmax sobre los scores `QKᵀ` produce pesos que se aplican a V para
obtener la salida.

## Self-Attention vs. Cross-Attention

- **Self-attention**: Q, K, V vienen todos del mismo input. Usado en el
  encoder y en el decoder (con masking causal en el decoder).
- **Cross-attention**: Q viene del decoder, K y V de la salida del encoder.
  Permite al decoder atender a la entrada original.

## Multi-Head

En lugar de una sola atención, se ejecutan H atenciones en paralelo (H=8 en
el paper), cada una con proyecciones aprendidas distintas. Las salidas se
concatenan. [[fuentes/2018-alammar-illustrated-transformer]] explica esto
con diagramas particularmente claros.
