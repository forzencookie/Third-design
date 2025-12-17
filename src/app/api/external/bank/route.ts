/**
 * External Bank API (Simulates Tink/Plaid)
 * 
 * This simulates what a real bank integration like Tink or Plaid would do:
 * generate bank transactions and push them via webhook.
 * 
 * In production, you'd remove this and configure Tink to call /api/webhooks/bank-transaction directly.
 * 
 * POST /api/external/bank
 * 
 * Body: {
 *   action: 'transaction' | 'batch'
 *   type?: 'income' | 'expense' | 'subscription' | 'travel' | 'office' | 'fika'
 *   amount?: number      // Optional: override random amount
 *   description?: string // Optional: override random vendor
 *   count?: number       // For batch: how many transactions
 * }
 */

import { NextRequest, NextResponse } from "next/server"

// Vendor data for realistic transactions
const VENDORS = {
    income: ['Kund AB', 'Tech Solutions', 'Nordic Consulting', 'Acme Corp', 'StartupX'],
    expense: ['Diverse leverantör', 'Kontorsmaterial', 'Underhållskostnader'],
    subscription: ['Spotify', 'Adobe Creative Cloud', 'Microsoft 365', 'Slack', 'Notion', 'Figma'],
    travel: ['SAS', 'SJ', 'Scandic Hotels', 'Circle K', 'OKQ8'],
    office: ['IKEA', 'Clas Ohlson', 'Staples', 'Dustin', 'NetOnNet'],
    fika: ['Espresso House', 'Starbucks', 'Wayne\'s Coffee', 'MAX', 'Subway'],
}

const AMOUNT_RANGES = {
    income: { min: 5000, max: 150000 },
    expense: { min: 500, max: 10000 },
    subscription: { min: 89, max: 599 },
    travel: { min: 89, max: 8500 },
    office: { min: 299, max: 25000 },
    fika: { min: 40, max: 280 },
}

type TransactionType = keyof typeof VENDORS

function generateTransaction(type: TransactionType, overrides?: { amount?: number; description?: string }) {
    const vendors = VENDORS[type]
    const range = AMOUNT_RANGES[type]

    const vendor = overrides?.description || vendors[Math.floor(Math.random() * vendors.length)]
    const baseAmount = overrides?.amount ?? (range.min + Math.random() * (range.max - range.min))
    const amount = type === 'income' ? Math.round(baseAmount) : -Math.round(baseAmount)

    return {
        description: vendor,
        amount,
        account: 'foretagskonto',
        reference: `BANK-${Date.now().toString(36).toUpperCase()}`,
        type: amount > 0 ? 'deposit' : 'payment',
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, type = 'expense', amount, description, count = 5 } = body

        // Simulate bank processing delay
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
            (request.headers.get('host')?.includes('localhost')
                ? `http://${request.headers.get('host')}`
                : `https://${request.headers.get('host')}`)

        if (action === 'transaction') {
            // Generate single transaction and forward to webhook
            const txData = generateTransaction(type as TransactionType, { amount, description })

            const webhookResponse = await fetch(`${baseUrl}/api/webhooks/bank-transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: 'simulator', // In production: 'tink' or 'plaid'
                    payload: txData,
                }),
            })

            const result = await webhookResponse.json()

            return NextResponse.json({
                success: result.success,
                provider: 'Simulated Bank (Tink/Plaid)',
                transaction: result.transaction,
                message: `Bank transaction pushed via webhook`,
            })

        } else if (action === 'batch') {
            // Generate multiple random transactions
            const types: TransactionType[] = ['income', 'subscription', 'travel', 'office', 'fika']
            const results = []

            for (let i = 0; i < Math.min(count, 50); i++) {
                const randomType = types[Math.floor(Math.random() * types.length)]
                const txData = generateTransaction(randomType)

                const webhookResponse = await fetch(`${baseUrl}/api/webhooks/bank-transaction`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        source: 'simulator',
                        payload: txData,
                    }),
                })

                const result = await webhookResponse.json()
                results.push({ type: randomType, success: result.success, id: result.transactionId })

                // Small delay between transactions
                await new Promise(resolve => setTimeout(resolve, 30))
            }

            return NextResponse.json({
                success: true,
                provider: 'Simulated Bank (Tink/Plaid)',
                count: results.length,
                transactions: results,
                message: `${results.length} bank transactions pushed via webhook`,
            })
        }

        return NextResponse.json(
            { success: false, error: 'Invalid action. Use: transaction, batch' },
            { status: 400 }
        )

    } catch (error) {
        console.error('External bank API error:', error)
        return NextResponse.json(
            { success: false, error: 'Simulated bank service error' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        service: 'Simulated Bank API (Tink/Plaid)',
        description: 'Generates fake bank transactions and pushes to /api/webhooks/bank-transaction',
        production: 'Replace with real Tink webhook URL pointing to /api/webhooks/bank-transaction',
        actions: {
            transaction: { type: 'income|expense|subscription|travel|office|fika', amount: 'optional', description: 'optional' },
            batch: { count: 'number of random transactions (max 50)' },
        },
    })
}
