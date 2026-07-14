import { ChatPanel } from '@/components/chat/ChatPanel'

export const metadata = { title: 'Chat · Workshop IA' }

export default function ChatPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
        <p className="text-muted-foreground">
          Pregúntale al agente. Solo responde a partir del wiki — sin alucinaciones añadidas.
          Cada turn puedes ver qué páginas leyó (los bloques colapsados de tool calls).
        </p>
      </header>
      <ChatPanel />
    </div>
  )
}
