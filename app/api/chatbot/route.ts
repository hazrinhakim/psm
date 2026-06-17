import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `You are an AI chatbot assistant for an ICT Asset Management System called ICAMS.

Your role is to help users with ICT asset-related problems such as:
- laptop issues
- printer issues
- monitor issues
- projector issues
- network or WiFi issues
- software installation problems
- asset maintenance request guidance
- asset status and reporting procedures

System context:
- Users can submit maintenance requests through the Maintenance Request page.
- Maintenance request statuses are Pending, In Progress, and Resolved.
- Admin can manage assets, update maintenance status, and add admin remarks.
- Staff can submit and view their maintenance requests.
- Asset categories include laptop, printer, monitor, projector, router, and other ICT equipment.

Rules:
- Only answer questions related to ICT assets, ICT troubleshooting, system usage, or maintenance requests.
- If the question is not related to ICT asset management, politely say that you can only assist with ICT asset-related matters.
- Use simple, clear, and friendly language.
- If the issue cannot be solved with basic troubleshooting, suggest submitting a maintenance request.
- Reply in plain text only.
- Do not use markdown.
- Do not use bold markers, italic markers, bullet symbols like *, or separators like ---.
- Numbering such as 1. 2. 3. is allowed when useful.`

type ChatbotRequestBody = {
  message?: string
}

function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GOOGLE_GENAI_API_KEY?.trim() ||
    ''
  )
}

function normalizeReply(text: string) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/^---+$/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json().catch(() => null)) as ChatbotRequestBody | null
    const message = String(body?.message ?? '').trim()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 }
      )
    }

    const apiKey = getGeminiApiKey()

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'AI assistant is not configured on this deployment. Set GEMINI_API_KEY, GOOGLE_API_KEY, or GOOGLE_GENAI_API_KEY in the server environment and redeploy.',
        },
        { status: 500 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: message,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    })

    const reply = normalizeReply(String(response.text ?? ''))

    if (!reply) {
      return NextResponse.json(
        { error: 'AI did not return a reply.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ reply })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to generate chatbot response.'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
