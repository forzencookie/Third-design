/**
 * Bank API - Single Source of Truth
 * 
 * Simulated via file-based persistence for "Real" feel in demo mode.
 */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server-db"

// ============================================================================
// Types
// ============================================================================

export interface BankTransaction {
  id: string
  description: string        // Raw merchant name from bank
  amount: number             // Positive = income, negative = expense
  date: string               // ISO date: "2025-12-13"
  timestamp: string          // ISO datetime
  account: BankAccountType   // Which account the transaction is on
  balance: number            // Balance after this transaction
  reference?: string         // OCR/reference number
  counterparty?: string      // Other party
  type: TransactionType      // payment, deposit, etc.
  status: 'pending' | 'completed' | 'failed'
}

export type BankAccountType = 'foretagskonto' | 'sparkonto' | 'skattekonto'
export type TransactionType = 'payment' | 'deposit' | 'transfer' | 'withdrawal' | 'fee'

export interface BankBalances {
  foretagskonto: number
  sparkonto: number
  skattekonto: number
}

// ============================================================================
// Helpers
// ============================================================================

function generateId(): string {
  return `bank-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// GET /api/bank - Get bank overview (balances + recent transactions)
// ============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const account = searchParams.get('account') as BankAccountType | null
  const limit = parseInt(searchParams.get('limit') || '50')

  const data = await db.get()

  // Get all transactions, optionally filtered by account
  let transactions = [...data.transactions]
    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (account) {
    transactions = transactions.filter((t: any) => t.account === account)
  }

  transactions = transactions.slice(0, limit)

  return NextResponse.json({
    balances: data.balances,
    transactions,
    count: transactions.length,
    total: data.transactions.length,
  })
}

// ============================================================================
// POST /api/bank - Create a new transaction (bank receives money movement)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      description,
      amount,
      account = 'foretagskonto' as BankAccountType,
      reference,
      counterparty,
      type = 'payment' as TransactionType,
    } = body

    // Validate account type
    const validAccounts: BankAccountType[] = ['foretagskonto', 'sparkonto', 'skattekonto']
    const safeAccount: BankAccountType = validAccounts.includes(account) ? account : 'foretagskonto'

    if (!description || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: description, amount' },
        { status: 400 }
      )
    }

    const data = await db.get()

    // Calculate new balance (note: balances are still mocked in db.get())
    const previousBalance = data.balances[safeAccount] || 0
    const newBalance = previousBalance + amount

    // Create transaction record
    const transaction: BankTransaction = {
      id: generateId(),
      description,
      amount,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      account: safeAccount,
      balance: newBalance,
      reference,
      counterparty,
      type,
      status: 'completed',
    }

    // Store in DB via Supabase
    await db.addTransaction(transaction)

    return NextResponse.json({
      success: true,
      transaction,
      balances: { ...data.balances, [safeAccount]: newBalance },
    })

  } catch (error) {
    console.error('Bank API error:', error)
    return NextResponse.json(
      { error: 'Failed to process transaction' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/bank - Reset bank (for testing/demo)
// Note: This is now a no-op since we use Supabase. Manual DB reset required.
// ============================================================================

export async function DELETE() {
  // In Supabase mode, we don't support full DB reset via API
  // This would need to be done directly in Supabase console
  return NextResponse.json({
    message: 'Bank reset is not supported in Supabase mode. Use Supabase console to reset.',
    warning: 'No data was modified.',
  })
}
