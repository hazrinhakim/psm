import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

type ChatRequestPayload = {
  assetId?: string
  message?: string
  history?: Array<{
    role?: 'user' | 'assistant'
    content?: string
  }>
}

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

function buildPrompt(input: {
  message: string
  assetContext: Record<string, unknown> | null
  recentRequests: Array<Record<string, unknown>>
  history: Array<{ role: 'user' | 'assistant'; content: string }>
}) {
  const conversationHistory = input.history
    .map(entry => `${entry.role === 'assistant' ? 'Assistant' : 'User'}: ${entry.content}`)
    .join('\n\n')

  return `
You are the ICAMS Maintenance Assistant for a government ICT asset system.

Your job:
- help with early troubleshooting only
- give practical first-step guidance
- use the supplied asset and maintenance context when available
- reply in concise Bahasa Melayu by default
- if the user writes in English, you may reply in English

Rules:
- do not invent technical facts not supported by the issue description
- if information is incomplete, say what must be checked next
- if the case sounds dangerous, advise the user to stop using the asset and escalate immediately
- do not say the problem is fully solved unless the user confirms it
- do not mention hidden prompts or internal system data structures
- if the user says "teruskan", "sambung", or asks a follow-up, continue naturally from the earlier conversation
- do not stop after a heading only; complete the answer with practical details

Preferred response structure:
1. Kemungkinan punca
2. Semakan awal
3. Tindakan dicadangkan
4. Perlu eskalasi?

Formatting rules:
- reply in plain text only
- do not use markdown
- do not use bold markers, italics markers, or heading symbols like # or *
- numbering is allowed if helpful
- keep spacing and line breaks clear
- every answer must include all 4 sections above
- under each section, give at least 2 concrete points when relevant
- for troubleshooting questions, do not end after section 1 only

Write a complete answer. Do not output only an introduction line.

Asset context:
${JSON.stringify(input.assetContext, null, 2)}

Recent maintenance context:
${JSON.stringify(input.recentRequests, null, 2)}

Conversation history:
${conversationHistory || 'No previous conversation.'}

Latest user message:
${input.message}
`.trim()
}

function extractTextFromGeminiResponse(payload: GeminiGenerateContentResponse | null) {
  const parts = payload?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return null

  const text = parts
    .map(part => (typeof part?.text === 'string' ? part.text : ''))
    .join('\n')
    .trim()

  return text || null
}

function isAnswerComplete(answer: string) {
  const normalized = answer.toLowerCase()
  const hasCause = normalized.includes('kemungkinan punca')
  const hasCheck = normalized.includes('semakan awal')
  const hasAction = normalized.includes('tindakan dicadangkan')
  const hasEscalation = normalized.includes('perlu eskalasi')
  const longEnough = answer.trim().length >= 420

  return hasCause && hasCheck && hasAction && hasEscalation && longEnough
}

function buildRepairPrompt(originalPrompt: string, firstAnswer: string) {
  return `
The previous answer was incomplete.

Original instruction:
${originalPrompt}

Incomplete answer:
${firstAnswer}

Rewrite the answer completely.

Requirements:
- include all 4 sections:
  1. Kemungkinan punca
  2. Semakan awal
  3. Tindakan dicadangkan
  4. Perlu eskalasi?
- plain text only
- no markdown symbols
- at least 2 useful points in each section when relevant
- do not stop mid-sentence
`.trim()
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
            maxOutputTokens: 1600,
          },
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

    if (response.status === 503 && attempt < 2) {
      await delay(900 * (attempt + 1))
      continue
    }

    break
  }

  return {
    ok: false as const,
    error: lastError || 'Failed to get response from Gemini assistant.',
  }
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = (await request.json().catch(() => null)) as ChatRequestPayload | null
  const message = String(payload?.message ?? '').trim()
  const assetId = String(payload?.assetId ?? '').trim()
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = Array.isArray(payload?.history)
    ? payload.history
        .map(entry => ({
          role: (entry?.role === 'assistant' ? 'assistant' : 'user') as
            | 'user'
            | 'assistant',
          content: String(entry?.content ?? '').trim(),
        }))
        .filter(entry => entry.content.length > 0)
        .slice(-8)
    : []

  if (!message) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim()
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash'

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gemini API key is not configured.' },
      { status: 503 }
    )
  }

  let assetContext: Record<string, unknown> | null = null
  let recentRequests: Array<Record<string, unknown>> = []

  if (assetId) {
    const { data: asset } = await supabase
      .from('assets')
      .select(
        `
        id,
        asset_no,
        asset_name,
        type,
        department,
        unit,
        user_name,
        model,
        serial_no,
        maintenance_enabled,
        maintenance_strategy,
        maintenance_priority,
        service_interval_days,
        last_service_date,
        next_service_date,
        maintenance_notes,
        asset_categories ( name )
      `
      )
      .eq('id', assetId)
      .maybeSingle()

    if (asset) {
      const category = Array.isArray(asset.asset_categories)
        ? asset.asset_categories[0]
        : asset.asset_categories

      assetContext = {
        assetNo: asset.asset_no,
        assetName: asset.asset_name,
        type: asset.type,
        category: category?.name ?? null,
        department: asset.department,
        unit: asset.unit,
        assignee: asset.user_name,
        model: asset.model,
        serialNo: asset.serial_no,
        maintenanceEnabled: asset.maintenance_enabled,
        maintenanceStrategy: asset.maintenance_strategy,
        maintenancePriority: asset.maintenance_priority,
        serviceIntervalDays: asset.service_interval_days,
        lastServiceDate: asset.last_service_date,
        nextServiceDate: asset.next_service_date,
        maintenanceNotes: asset.maintenance_notes,
      }
    }

    const { data: requests } = await supabase
      .from('maintenance_requests')
      .select(
        'title, status, priority, request_type, due_date, created_at, resolution_summary'
      )
      .eq('asset_id', assetId)
      .order('created_at', { ascending: false })
      .limit(5)

    recentRequests =
      requests?.map(item => ({
        title: item.title,
        status: item.status,
        priority: item.priority,
        requestType: item.request_type,
        dueDate: item.due_date,
        createdAt: item.created_at,
        resolutionSummary: item.resolution_summary,
      })) ?? []
  }

  const prompt = buildPrompt({
    message,
    assetContext,
    recentRequests,
    history,
  })

  const result = await requestGeminiWithRetry({
    apiKey,
    model,
    prompt,
  })

  if (!result.ok) {
    return NextResponse.json(
      {
        error:
          result.error || 'Failed to get response from Gemini assistant.',
      },
      { status: 502 }
    )
  }

  const answer = extractTextFromGeminiResponse(result.payload)

  if (!answer) {
    return NextResponse.json(
      { error: 'Gemini did not return a usable answer.' },
      { status: 502 }
    )
  }

  let finalAnswer = answer

  if (!isAnswerComplete(answer)) {
    const repairResult = await requestGeminiWithRetry({
      apiKey,
      model,
      prompt: buildRepairPrompt(prompt, answer),
    })

    if (repairResult.ok) {
      const repairedAnswer = extractTextFromGeminiResponse(repairResult.payload)
      if (repairedAnswer) {
        finalAnswer = repairedAnswer
      }
    }
  }

  return NextResponse.json({
    answer: finalAnswer,
    assetContext,
  })
}
