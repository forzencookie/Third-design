/**
 * Webhook: Email Received
 * 
 * Receives email notifications from email providers (Gmail, Outlook, Yahoo).
 * Transforms email data into inbox items.
 * 
 * POST /api/webhooks/email-received
 * 
 * Body: {
 *   source: 'gmail' | 'outlook' | 'yahoo' | 'simulator'
 *   payload: {
 *     messageId: string
 *     from: string
 *     to: string
 *     subject: string
 *     body?: string
 *     date: string
 *     hasAttachments: boolean
 *     attachments?: Array<{ filename: string, mimeType: string, size: number, content?: string }>
 *   }
 *   signature?: string
 * }
 */

import { NextRequest, NextResponse } from "next/server"

interface EmailWebhookPayload {
    source: string
    payload: {
        messageId: string
        from: string
        to: string
        subject: string
        body?: string
        date: string
        hasAttachments: boolean
        attachments?: Array<{
            filename: string
            mimeType: string
            size: number
            content?: string
        }>
    }
    signature?: string
}

// Detect invoice-related emails
function isInvoiceEmail(subject: string, from: string): boolean {
    const invoiceKeywords = ['faktura', 'invoice', 'payment', 'betalning', 'receipt', 'kvitto']
    const lowerSubject = subject.toLowerCase()
    return invoiceKeywords.some(kw => lowerSubject.includes(kw))
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as EmailWebhookPayload
        const { source, payload } = body

        // Validate required fields
        if (!source || !payload) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: source, payload' },
                { status: 400 }
            )
        }

        if (!payload.messageId || !payload.from || !payload.subject) {
            return NextResponse.json(
                { success: false, error: 'Missing required payload fields: messageId, from, subject' },
                { status: 400 }
            )
        }

        // Determine inbox item type based on email content
        const itemType = isInvoiceEmail(payload.subject, payload.from)
            ? `${source}-invoice`
            : `${source}-email`

        // Forward to inbox-item webhook (standardized format)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
            (request.headers.get('host')?.includes('localhost')
                ? `http://${request.headers.get('host')}`
                : `https://${request.headers.get('host')}`)

        const webhookResponse = await fetch(`${baseUrl}/api/webhooks/inbox-item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source,
                payload: {
                    type: itemType,
                    title: payload.subject,
                    content: payload.body,
                    sender: payload.from,
                    attachments: payload.attachments?.map(a => ({
                        name: a.filename,
                        mimeType: a.mimeType,
                        data: a.content,
                    })),
                    metadata: {
                        messageId: payload.messageId,
                        to: payload.to,
                        date: payload.date,
                        hasAttachments: payload.hasAttachments,
                    },
                },
            }),
        })

        const result = await webhookResponse.json()

        return NextResponse.json({
            success: result.success,
            source,
            emailId: payload.messageId,
            itemType,
            message: `Email processed from ${source}`,
            inboxItemId: result.itemId,
            aiProcessed: result.aiProcessed,
        })

    } catch (error) {
        console.error('Webhook email-received error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        endpoint: '/api/webhooks/email-received',
        status: 'active',
        acceptedSources: ['gmail', 'outlook', 'yahoo', 'simulator'],
        requiredFields: ['source', 'payload.messageId', 'payload.from', 'payload.subject'],
        optionalFields: ['payload.body', 'payload.attachments', 'payload.date'],
        description: 'Transforms email notifications into inbox items',
    })
}
