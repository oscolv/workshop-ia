import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { checkBotId } from 'botid/server'
import { tools } from '@/lib/tools'
import { systemPrompt } from '@/lib/prompts'
import { rateLimit } from '@/lib/rate-limit'

export const maxDuration = 60

export async function POST(req: Request) {
  if (process.env.BOTID_ENABLED === 'true') {
    const bot = await checkBotId()
    if (bot.isBot) return new Response('Bot detected', { status: 403 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anon'
  const limit = Number(process.env.CHAT_RATE_LIMIT_PER_HOUR ?? 10)
  const ok = await rateLimit(`chat:${ip}`, { limit, windowSec: 3600 })
  if (!ok) {
    return new Response(JSON.stringify({ error: `Has hecho ${limit} preguntas esta hora. Vuelve en una hora o corre el repo en local con tu propia API key.` }), {
      status: 429,
      headers: { 'content-type': 'application/json' },
    })
  }

  const { messages }: { messages: UIMessage[] } = await req.json()
  const model = process.env.CHAT_MODEL ?? 'anthropic/claude-sonnet-4-6'

  const result = streamText({
    model: gateway(model),
    system: systemPrompt(),
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(8),
  })

  return result.toUIMessageStreamResponse()
}
