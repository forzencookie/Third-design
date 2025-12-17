/**
 * Webhook: Bank Transaction
 * 
 * Receives bank transaction data from external sources (simulated or real Tink/Plaid).
 * This is the endpoint real bank integrations would call.
 * 
 * POST /api/webhooks/bank-transaction
 * 
 * Body: {
 *   source: 'tink' | 'plaid' | 'simulator' | string
 *   payload: {
 *     id?: string
 *     description: string
 *     amount: number
 *     account?: string
 *     reference?: string
 *     timestamp?: string
 *     type?: 'payment' | 'deposit' | 'transfer' | 'withdrawal'
 *   }
 *   signature?: string  // For production: verify webhook authenticity
 * }
 */

import { NextRequest, NextResponse } from "next/server"

// Types
interface WebhookPayload {
    source: string
    payload: {
        id?: string
        description: string
        amount: number
        account?: string
        reference?: string
        timestamp?: string
        type?: 'payment' | 'deposit' | 'transfer' | 'withdrawal'
    }
    signature?: string
}

// In production, you'd verify the webhook signature here
function verifySignature(source: string, signature: string | undefined): boolean {
    // For simulator, always pass
    if (source === 'simulator') return true

    // For production Tink/Plaid, verify HMAC signature
    // Example: const expectedSig = crypto.createHmac('sha256', process.env.TINK_WEBHOOK_SECRET).update(payload).digest('hex')
    // return signature === expectedSig

    // For now, accept all (development mode)
    return true
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as WebhookPayload
        const { source, payload, signature } = body

        // Validate required fields
        if (!source || !payload) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: source, payload' },
                { status: 400 }
            )
        }

        if (!payload.description || payload.amount === undefined) {
            return NextResponse.json(
                { success: false, error: 'Missing required payload fields: description, amount' },
                { status: 400 }
            )
        }

        // Verify webhook signature (production security)
        if (!verifySignature(source, signature)) {
            return NextResponse.json(
                { success: false, error: 'Invalid webhook signature' },
                { status: 401 }
            )
        }

        // Forward to internal bank API
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
            (request.headers.get('host')?.includes('localhost')
                ? `http://${request.headers.get('host')}`
                : `https://${request.headers.get('host')}`)

        const bankResponse = await fetch(`${baseUrl}/api/bank`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description: payload.description,
                amount: payload.amount,
                account: payload.account || 'foretagskonto',
                reference: payload.reference || `${source.toUpperCase()}-${Date.now().toString(36)}`,
                type: payload.type || (payload.amount > 0 ? 'deposit' : 'payment'),
            }),
        })

        const bankResult = await bankResponse.json()

        if (!bankResult.success) {
            return NextResponse.json(
                { success: false, error: bankResult.error || 'Bank API error' },
                { status: 500 }
            )
        }

        // Return success with transaction details
        return NextResponse.json({
            success: true,
            source,
            transactionId: bankResult.transaction?.id,
            message: `Transaction received from ${source}`,
            transaction: bankResult.transaction,
        })

    } catch (error) {
        console.error('Webhook bank-transaction error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// GET handler to check webhook status
export async function GET() {
    return NextResponse.json({
        endpoint: '/api/webhooks/bank-transaction',
        status: 'active',
        acceptedSources: ['tink', 'plaid', 'simulator'],
        requiredFields: ['source', 'payload.description', 'payload.amount'],
        optionalFields: ['payload.account', 'payload.reference', 'payload.type', 'signature'],
    })
}
