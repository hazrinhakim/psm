import { NextResponse } from 'next/server'
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

type ProviderErrorPayload = {
  error?: {
    code?: number
    message?: string
    status?: string
  }
}

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
    finishReason?: string
  }>
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

function getGeminiModels() {
  const primaryModel =
    process.env.GEMINI_MODEL_PRIMARY?.trim() ||
    process.env.GEMINI_MODEL?.trim() ||
    'gemini-2.5-flash'
  const fallbackModel =
    process.env.GEMINI_MODEL_FALLBACK?.trim() || 'gemini-2.0-flash'

  return Array.from(new Set([primaryModel, fallbackModel].filter(Boolean)))
}

function extractTextFromGeminiResponse(payload: GeminiGenerateContentResponse | null) {
  const parts = payload?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) {
    return null
  }

  const text = parts
    .map(part => (typeof part?.text === 'string' ? part.text : ''))
    .join('\n')
    .trim()

  return text || null
}

function isReplyComplete(answer: string) {
  const trimmed = answer.trim()
  if (trimmed.length < 120) {
    return true
  }

  const lastChar = trimmed.at(-1) ?? ''
  const endsCleanly = ['.', '!', '?', ':'].includes(lastChar)
  const lastLine = trimmed.split('\n').at(-1)?.trim() ?? ''
  const looksCutOff =
    /[,:;/-]$/.test(lastLine) ||
    /\b(and|or|because|with|for|to|yang|dan|atau|kerana|untuk)\s*$/i.test(lastLine)

  return endsCleanly && !looksCutOff
}

function buildRepairPrompt(message: string, partialAnswer: string) {
  return `The previous answer appears incomplete or cut off.

User request:
${message}

Incomplete answer:
${partialAnswer}

Rewrite the full answer from the beginning.

Rules:
- reply in plain text only
- do not use markdown
- do not stop mid-sentence
- make sure the answer is complete, practical, and natural
- if steps are needed, finish all steps before ending`
}

async function delay(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

async function requestGeminiWithRetry(input: {
  apiKey: string
  model: string
  prompt: string
}) {
  let lastError = ''

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${input.model}:generateContent?key=${encodeURIComponent(input.apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: input.prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.35,
            topP: 0.9,
            maxOutputTokens: 900,
          },
          safetySettings: [],
        }),
      }
    )

    if (response.ok) {
      return {
        ok: true as const,
        payload: (await response
          .json()
          .catch(() => null)) as GeminiGenerateContentResponse | null,
      }
    }

    lastError = await response.text().catch(() => '')

    if ((response.status === 503 || response.status === 429) && attempt < 2) {
      await delay(900 * (attempt + 1))
      continue
    }

    return {
      ok: false as const,
      error: lastError || 'Failed to get response from Gemini assistant.',
      status: response.status,
    }
  }

  return {
    ok: false as const,
    error: lastError || 'Failed to get response from Gemini assistant.',
    status: 503,
  }
}

async function requestGeminiAcrossModels(input: {
  apiKey: string
  prompt: string
}) {
  let lastFailure: { error: string; status: number } | null = null

  for (const model of getGeminiModels()) {
    const result = await requestGeminiWithRetry({
      apiKey: input.apiKey,
      model,
      prompt: input.prompt,
    })

    if (result.ok) {
      return {
        ok: true as const,
        payload: result.payload,
      }
    }

    lastFailure = {
      error: result.error,
      status: result.status,
    }
  }

  return {
    ok: false as const,
    error: lastFailure?.error || 'Failed to get response from Gemini assistant.',
    status: lastFailure?.status || 503,
  }
}

function parseProviderError(error: unknown) {
  const fallback = {
    message: 'Failed to generate chatbot response.',
    status: 500,
  }

  if (!(error instanceof Error)) {
    return fallback
  }

  const raw = error.message.trim()

  try {
    const parsed = JSON.parse(raw) as ProviderErrorPayload
    const providerError = parsed.error

    if (!providerError) {
      return {
        message: raw || fallback.message,
        status: 500,
      }
    }

    const statusCode =
      providerError.code === 503 ||
      providerError.status?.toUpperCase() === 'UNAVAILABLE'
        ? 503
        : typeof providerError.code === 'number' &&
            providerError.code >= 400 &&
            providerError.code < 600
          ? providerError.code
          : 500

    return {
      message: providerError.message?.trim() || fallback.message,
      status: statusCode,
    }
  } catch {
    return {
      message: raw || fallback.message,
      status:
        raw.includes('503') || raw.toLowerCase().includes('unavailable')
          ? 503
          : 500,
    }
  }
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

    const prompt = `${SYSTEM_PROMPT}\n\nUser message:\n${message}`

    const response = await requestGeminiAcrossModels({
      apiKey,
      prompt,
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: response.error },
        { status: response.status }
      )
    }

    const reply = normalizeReply(
      extractTextFromGeminiResponse(response.payload) ?? ''
    )

    if (!reply) {
      return NextResponse.json(
        { error: 'AI did not return a reply.' },
        { status: 500 }
      )
    }

    let finalReply = reply

    if (!isReplyComplete(reply)) {
      const repairResponse = await requestGeminiAcrossModels({
        apiKey,
        prompt: buildRepairPrompt(message, reply),
      })

      if (repairResponse.ok) {
        const repairedReply = normalizeReply(
          extractTextFromGeminiResponse(repairResponse.payload) ?? ''
        )

        if (repairedReply && isReplyComplete(repairedReply)) {
          finalReply = repairedReply
        }
      }
    }

    return NextResponse.json({ reply: finalReply })
  } catch (error) {
    const { message, status } = parseProviderError(error)

    return NextResponse.json({ error: message }, { status })
  }
}
