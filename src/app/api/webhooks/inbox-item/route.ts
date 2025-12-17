/**
 * Webhook: Inbox Item
 * 
 * Receives inbox items (receipts, invoices, government mail) from external sources.
 * This is the endpoint email providers and digital post services would call.
 * 
 * POST /api/webhooks/inbox-item
 * 
 * Body: {
 *   source: 'gmail' | 'outlook' | 'kivra' | 'skatteverket' | 'simulator' | string
 *   payload: {
 *     type: string         // e.g., 'invoice', 'receipt', 'skatteverket-skatt'
 *     title: string
 *     content?: string
 *     sender?: string
 *     attachments?: Array<{ name: string, mimeType: string, data?: string }>
 *     metadata?: Record<string, unknown>
 *   }
 *   signature?: string
 * }
 */

import { NextRequest, NextResponse } from "next/server"

interface InboxWebhookPayload {
    source: string
    payload: {
        type: string
        title: string
        content?: string
        sender?: string
        attachments?: Array<{ name: string; mimeType: string; data?: string }>
        metadata?: Record<string, unknown>
    }
    signature?: string
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as InboxWebhookPayload
        const { source, payload } = body

        // Validate required fields
        if (!source || !payload) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: source, payload' },
                { status: 400 }
            )
        }

        if (!payload.type || !payload.title) {
            return NextResponse.json(
                { success: false, error: 'Missing required payload fields: type, title' },
                { status: 400 }
            )
        }

        // Forward to internal inbox API
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
            (request.headers.get('host')?.includes('localhost')
                ? `http://${request.headers.get('host')}`
                : `https://${request.headers.get('host')}`)

        const inboxResponse = await fetch(`${baseUrl}/api/inbox`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'create',
                type: payload.type,
                title: payload.title,
                content: payload.content,
                sender: payload.sender || source,
                source,
                metadata: payload.metadata,
            }),
        })

        const inboxResult = await inboxResponse.json()

        if (!inboxResult.success) {
            return NextResponse.json(
                { success: false, error: inboxResult.error || 'Inbox API error' },
                { status: 500 }
            )
        }

        // Optionally trigger AI processing for certain types
        const shouldProcessWithAI = ['invoice', 'receipt', 'kivra-invoice'].some(t =>
            payload.type.toLowerCase().includes(t)
        )

        let aiResult = null
        if (shouldProcessWithAI) {
            try {
                const aiResponse = await fetch(`${baseUrl}/api/ai/process-inbox`, { method: 'POST' })
                aiResult = await aiResponse.json()
            } catch (aiError) {
                console.warn('AI processing failed:', aiError)
            }
        }

        return NextResponse.json({
            success: true,
            source,
            itemId: inboxResult.item?.id,
            message: `Inbox item received from ${source}`,
            item: inboxResult.item,
            aiProcessed: aiResult?.processed || 0,
        })

    } catch (error) {
        console.error('Webhook inbox-item error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        endpoint: '/api/webhooks/inbox-item',
        status: 'active',
        acceptedSources: ['gmail', 'outlook', 'kivra', 'skatteverket', 'bolagsverket', 'simulator'],
        requiredFields: ['source', 'payload.type', 'payload.title'],
        optionalFields: ['payload.content', 'payload.sender', 'payload.attachments', 'payload.metadata'],
    })
}
