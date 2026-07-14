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
import { wikiConfig } from '@/wiki.config'

const EXAMPLE_PROMPTS = wikiConfig.chat.examplePrompts

export function ChatPanel() {
  const { messages, sendMessage, status, error } = useChat()

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
          {error && (
            <div className="m-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm">
              El chat no pudo responder: {error.message || 'error desconocido'}.
              Revisa que <code>AI_GATEWAY_API_KEY</code> esté configurada y que tu
              cuenta de AI Gateway esté activa.
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputBody>
          <PromptInputTextarea placeholder={wikiConfig.chat.placeholder} />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputSubmit status={status} className="ml-auto" />
        </PromptInputFooter>
      </PromptInput>
    </div>
  )
}
