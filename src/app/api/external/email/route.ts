/**
 * External Email API (Simulates Gmail/Outlook/Yahoo)
 * 
 * This simulates what a real email integration would do:
 * push email notifications with potential invoice attachments.
 * 
 * In production, you'd remove this and configure Gmail Pub/Sub 
 * to call /api/webhooks/email-received directly.
 * 
 * POST /api/external/email
 * 
 * Body: {
 *   provider: 'gmail' | 'outlook' | 'yahoo'
 *   type?: 'invoice' | 'receipt' | 'general'
 * }
 */

import { NextRequest, NextResponse } from "next/server"

// Email templates for simulation
const EMAIL_TEMPLATES = {
    invoice: [
        { from: 'billing@notion.so', subject: 'Your Notion invoice', vendor: 'Notion', amount: 89 },
        { from: 'invoices@slack.com', subject: 'Slack Pro - Invoice', vendor: 'Slack', amount: 149 },
        { from: 'noreply@adobe.com', subject: 'Adobe Creative Cloud Invoice', vendor: 'Adobe', amount: 599 },
        { from: 'billing@figma.com', subject: 'Figma Professional - Monthly Invoice', vendor: 'Figma', amount: 149 },
        { from: 'payments@microsoft.com', subject: 'Microsoft 365 Business Invoice', vendor: 'Microsoft 365', amount: 249 },
        { from: 'billing@github.com', subject: 'GitHub Team - Invoice', vendor: 'GitHub', amount: 89 },
    ],
    receipt: [
        { from: 'receipt@espressohouse.se', subject: 'Ditt kvitto från Espresso House', vendor: 'Espresso House', amount: 55 },
        { from: 'kvitto@max.se', subject: 'Orderbekräftelse - MAX', vendor: 'MAX', amount: 89 },
    ],
    general: [
        { from: 'info@company.se', subject: 'Welcome to our service', vendor: null, amount: 0 },
        { from: 'noreply@newsletter.com', subject: 'Weekly Update', vendor: null, amount: 0 },
    ],
}

type EmailType = keyof typeof EMAIL_TEMPLATES

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { provider = 'gmail', type = 'invoice' } = body

        // Validate provider
        const validProviders = ['gmail', 'outlook', 'yahoo']
        if (!validProviders.includes(provider)) {
            return NextResponse.json(
                { success: false, error: `Invalid provider. Use: ${validProviders.join(', ')}` },
                { status: 400 }
            )
        }

        // Get random email template
        const templates = EMAIL_TEMPLATES[type as EmailType] || EMAIL_TEMPLATES.invoice
        const template = templates[Math.floor(Math.random() * templates.length)]

        // Simulate email delivery delay
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))

        // Generate email payload
        const emailPayload = {
            messageId: `${provider}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            from: template.from,
            to: 'user@company.se',
            subject: template.subject,
            body: `This is a simulated email from ${provider}.\n\n${template.vendor ? `Amount: ${template.amount} SEK` : 'No invoice attached.'}`,
            date: new Date().toISOString(),
            hasAttachments: !!template.vendor,
            attachments: template.vendor ? [{
                filename: `invoice-${Date.now()}.pdf`,
                mimeType: 'application/pdf',
                size: 125000,
                // In real integration, this would be base64 PDF content
            }] : undefined,
        }

        // Forward to email webhook
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
            (request.headers.get('host')?.includes('localhost')
                ? `http://${request.headers.get('host')}`
                : `https://${request.headers.get('host')}`)

        const webhookResponse = await fetch(`${baseUrl}/api/webhooks/email-received`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source: provider,
                payload: emailPayload,
            }),
        })

        const result = await webhookResponse.json()

        return NextResponse.json({
            success: result.success,
            provider: `Simulated ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
            email: {
                from: emailPayload.from,
                subject: emailPayload.subject,
                hasAttachments: emailPayload.hasAttachments,
            },
            inboxItemId: result.inboxItemId,
            aiProcessed: result.aiProcessed,
            message: `Email pushed via webhook → inbox`,
        })

    } catch (error) {
        console.error('External email API error:', error)
        return NextResponse.json(
            { success: false, error: 'Simulated email service error' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        service: 'Simulated Email API (Gmail/Outlook/Yahoo)',
        description: 'Generates fake email notifications and pushes to /api/webhooks/email-received',
        production: 'Replace with Gmail Pub/Sub pointing to /api/webhooks/email-received',
        usage: {
            provider: 'gmail | outlook | yahoo',
            type: 'invoice | receipt | general',
        },
    })
}
