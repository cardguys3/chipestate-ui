// /app/api/chat/route.ts (or /pages/api/chat.ts for older projects)
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { messages } = await req.json()

  const chatResponse = await openai.chat.completions.create({
    model: 'gpt-4', // or gpt-3.5-turbo
    messages,
  })

  return NextResponse.json({ reply: chatResponse.choices[0].message.content })
}
