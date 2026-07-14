'use client'
import { useChat } from '@ai-sdk/react'
import type { ToolUIPart } from 'ai'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Message, MessageContent } from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool'
import { MarkdownRenderer } from '@/components/wiki/MarkdownRenderer'

const EXAMPLE_PROMPTS = [
  '¿Qué es RAG y cómo se relaciona con el Transformer?',
  '¿Cuál es la diferencia entre fine-tuning y RLHF?',
  'Resume las contradicciones marcadas en el wiki.',
]

export function ChatPanel() {
  const { messages, sendMessage, status } = useChat()

  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text.trim()) sendMessage({ text: message.text })
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-4">
      <Conversation className="flex-1 border border-border rounded-lg" aria-live="polite">
        <ConversationContent>
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground space-y-3 p-4">
              <p>Pregunta lo que quieras sobre el wiki. Algunos ejemplos:</p>
              <ul className="space-y-1">
                {EXAMPLE_PROMPTS.map(p => (
                  <li key={p}>
                    <button
                      type="button"
                      className="text-accent hover:underline text-left"
                      onClick={() => sendMessage({ text: p })}
                    >
                      → {p}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {messages.map(m => (
            <Message key={m.id} from={m.role}>
              <MessageContent>
                {m.parts.map((part, i) => {
                  if (part.type === 'text') {
                    return <MarkdownRenderer key={i} content={part.text} />
                  }
                  if (part.type.startsWith('tool-')) {
                    const toolPart = part as ToolUIPart
                    return (
                      <Tool key={i} defaultOpen={false}>
                        <ToolHeader type={toolPart.type} state={toolPart.state} />
                        <ToolContent>
                          <ToolInput input={toolPart.input} />
                          <ToolOutput output={toolPart.output} errorText={toolPart.errorText} />
                        </ToolContent>
                      </Tool>
                    )
                  }
                  return null
                })}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputBody>
          <PromptInputTextarea placeholder="¿Qué es RAG? ¿Cómo se relaciona InstructGPT con el Transformer?" />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputSubmit status={status} className="ml-auto" />
        </PromptInputFooter>
      </PromptInput>
    </div>
  )
}
