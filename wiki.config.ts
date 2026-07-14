// ============================================================
// Configuración del sitio — ESTE es el archivo que editas al
// forkear el repo para arrancar un wiki sobre tu propio tema.
// Nada más en app/, components/ o lib/ menciona el tema.
// ============================================================

export const wikiConfig = {
  // Nombre del sitio (header, <title>, metadata)
  siteName: 'Workshop IA · LLM+Wiki',
  // Nombre corto para sufijos de título ("Transformer · Workshop IA")
  shortName: 'Workshop IA',
  // Descripción para metadata / SEO
  description:
    'Implementación de referencia del patrón LLM+Wiki para el Taller IA (UAM Azcapotzalco)',

  // De qué trata el wiki — se inyecta al system prompt del chat para que
  // el agente sepa qué corpus está consultando.
  tema: 'fundamentos de LLMs (Transformer, RAG, RLHF)',
  // Idioma en que el chat debe responder siempre
  idioma: 'español',

  // Repo público (links del header y footer)
  githubUrl: 'https://github.com/oscolv/workshop-ia',

  footer: {
    atribucion: 'Workshop IA — UAM Azcapotzalco · 2026',
    licencia: 'Código MIT · Contenido CC BY 4.0',
  },

  chat: {
    // Prompts de ejemplo que se muestran cuando la conversación está vacía.
    // Escríbelos sobre TU tema al forkear.
    examplePrompts: [
      '¿Qué es RAG y cómo se relaciona con el Transformer?',
      '¿Cuál es la diferencia entre fine-tuning y RLHF?',
      'Resume las contradicciones marcadas en el wiki.',
    ],
    // Placeholder del textarea
    placeholder: '¿Qué es RAG? ¿Cómo se relaciona InstructGPT con el Transformer?',
  },
}
