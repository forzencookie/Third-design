/**
 * Bank Transactions API
 * 
 * Dedicated endpoint for transaction operations.
 * Proxies to main bank API but with transaction-specific logic.
 */

import { NextRequest, NextResponse } from "next/server"

// ============================================================================
// GET /api/bank/transactions - List transactions
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const account = searchParams.get('account')
    const limit = searchParams.get('limit') || '100'
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const params = new URLSearchParams()
    if (account) params.set('account', account)
    params.set('limit', limit)
    
    const response = await fetch(`${baseUrl}/api/bank?${params}`, {
      cache: 'no-store',
    })
    
    const data = await response.json()
    
    return NextResponse.json({
      transactions: data.transactions,
      count: data.count,
      total: data.total,
    })
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/bank/transactions - Create transaction (alias)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/bank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to create transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
