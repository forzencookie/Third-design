/**
 * External Skatteverket API (Simulates Swedish Tax Agency)
 * 
 * This simulates Skatteverket sending documents/notifications to your app.
 * Different from /api/skatteverket which validates YOUR submissions.
 * 
 * This endpoint simulates INCOMING communications from Skatteverket:
 * - Tax decisions
 * - VAT reminders
 * - Preliminary tax updates
 * 
 * In production, this would be replaced by Skatteverket's digital mailbox API
 * pushing to /api/webhooks/inbox-item.
 * 
 * POST /api/external/skatteverket
 * 
 * Body: {
 *   type: 'slutlig-skatt' | 'moms-paminnelse' | 'preliminarskatt' | 'beslut'
 * }
 */

import { NextRequest, NextResponse } from "next/server"

// Document templates
const DOCUMENT_TEMPLATES = {
    'slutlig-skatt': {
        title: 'Beslut om slutlig skatt',
        content: `Skatteverket har fattat beslut om din slutliga skatt för beskattningsåret.\n\nÖverskjutande skatt: 12 450 kr\nUtbetalning sker inom 2-3 veckor till ditt angivna bankkonto.`,
        sender: 'Skatteverket',
        category: 'tax-decision',
    },
    'moms-paminnelse': {
        title: 'Påminnelse: Momsdeklaration',
        content: `Detta är en påminnelse om att lämna momsdeklaration för perioden.\n\nSista dag: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE')}\n\nOm du redan lämnat deklarationen kan du bortse från detta meddelande.`,
        sender: 'Skatteverket',
        category: 'reminder',
    },
    'preliminarskatt': {
        title: 'Beslut om preliminärskatt',
        content: `Skatteverket har beslutat om ändrad preliminärskatt baserat på din ansökan.\n\nNytt belopp per månad: 15 800 kr\nGäller från: ${new Date().toLocaleDateString('sv-SE')}`,
        sender: 'Skatteverket',
        category: 'tax-decision',
    },
    'beslut': {
        title: 'Skattebesked',
        content: `Ett nytt skattebesked finns tillgängligt på Mina sidor hos Skatteverket.\n\nLogga in för att läsa hela beslutet.`,
        sender: 'Skatteverket',
        category: 'notification',
    },
}

type DocumentType = keyof typeof DOCUMENT_TEMPLATES

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { type = 'slutlig-skatt' } = body

        // Validate type
        if (!DOCUMENT_TEMPLATES[type as DocumentType]) {
            return NextResponse.json(
                { success: false, error: `Invalid type. Use: ${Object.keys(DOCUMENT_TEMPLATES).join(', ')}` },
                { status: 400 }
            )
        }

        const template = DOCUMENT_TEMPLATES[type as DocumentType]

        // Simulate Skatteverket processing time
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400))

        // Forward to inbox webhook
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
            (request.headers.get('host')?.includes('localhost')
                ? `http://${request.headers.get('host')}`
                : `https://${request.headers.get('host')}`)

        const webhookResponse = await fetch(`${baseUrl}/api/webhooks/inbox-item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: 'skatteverket',
                payload: {
                    type: `skatteverket-${type}`,
                    title: template.title,
                    content: template.content,
                    sender: template.sender,
                    metadata: {
                        category: template.category,
                        receivedAt: new Date().toISOString(),
                        documentId: `SKV-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                    },
                },
            }),
        })

        const result = await webhookResponse.json()

        return NextResponse.json({
            success: result.success,
            provider: 'Simulated Skatteverket',
            document: {
                type,
                title: template.title,
                sender: template.sender,
            },
            inboxItemId: result.itemId,
            message: `Skatteverket document pushed via webhook → inbox`,
        })

    } catch (error) {
        console.error('External Skatteverket API error:', error)
        return NextResponse.json(
            { success: false, error: 'Simulated Skatteverket service error' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        service: 'Simulated Skatteverket API',
        description: 'Generates incoming Skatteverket documents and pushes to /api/webhooks/inbox-item',
        production: 'Replace with Skatteverket digital mailbox API',
        documentTypes: Object.keys(DOCUMENT_TEMPLATES),
    })
}
