import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from 'ai'
import { gateway } from '@ai-sdk/gateway'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { checkBotId } from 'botid/server'
import { tools } from '@/lib/tools'
import { systemPrompt } from '@/lib/prompts'
import { rateLimit } from '@/lib/rate-limit'

export const maxDuration = 60

// CHAT_MODEL usa formato "proveedor/modelo". Si el proveedor es deepseek y
// hay DEEPSEEK_API_KEY, va directo a DeepSeek (sin pasar — ni facturar — por
// Vercel AI Gateway). Cualquier otro caso se enruta via el Gateway.
function resolveModel() {
  const model = process.env.CHAT_MODEL ?? 'anthropic/claude-sonnet-4-6'
  if (model.startsWith('deepseek/') && process.env.DEEPSEEK_API_KEY) {
    const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY })
    return deepseek(model.slice('deepseek/'.length))
  }
  return gateway(model)
}

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

  const result = streamText({
    model: resolveModel(),
    system: systemPrompt(),
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(8),
  })

  return result.toUIMessageStreamResponse()
}
