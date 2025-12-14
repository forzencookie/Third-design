/**
 * Mock Transaction Generator
 * 
 * Generates multiple random transactions at once
 */

import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface GenerateRequest {
  count?: number
  types?: ('income' | 'expense' | 'subscription' | 'travel' | 'office' | 'fika')[]
}

/**
 * POST /api/mock/transactions/generate
 * Generate multiple random transactions
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    const count = Math.min(body.count || 5, 50) // Max 50 at a time
    const types = body.types || ['income', 'expense', 'subscription', 'travel', 'office', 'fika']

    const transactions = []
    const errors = []

    for (let i = 0; i < count; i++) {
      // Pick random type
      const type = types[Math.floor(Math.random() * types.length)]

      try {
        // Call the main transactions endpoint
        const response = await fetch(`${API_BASE}/api/mock/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type }),
        })

        const result = await response.json()
        
        if (result.transaction) {
          transactions.push(result.transaction)
        } else if (result.error) {
          errors.push(result.error)
        }
      } catch (err) {
        errors.push(`Failed to generate transaction ${i + 1}`)
      }
    }

    return NextResponse.json({
      generated: transactions.length,
      requested: count,
      transactions,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error) {
    console.error('Error generating transactions:', error)
    return NextResponse.json({ error: 'Failed to generate transactions' }, { status: 500 })
  }
}
