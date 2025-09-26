import { resumeSchema } from '@/lib/schema'
import { streamObject } from 'ai'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { prompt } = await req.json()

  const result = streamObject({
    model: 'openai/gpt-5-mini',
    schema: resumeSchema,
    prompt: `Given the following resume, generate a structured resume based on the schema.
    ${prompt}`
  })

  return result.toTextStreamResponse()
}
