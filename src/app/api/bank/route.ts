/**
 * Bank API - Single Source of Truth
 * 
 * This simulates a real bank API (like SEB, Nordea via Open Banking).
 * All transaction and balance data flows through here.
 * 
 * In production, this would be replaced with actual bank API integration.
 */

import { NextRequest, NextResponse } from "next/server"

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
// In-Memory Bank Database (simulates real bank storage)
// ============================================================================

// Global state - persists for server lifetime
const bankState = {
  transactions: new Map<string, BankTransaction>(),
  balances: {
    foretagskonto: 250000,
    sparkonto: 150000,
    skattekonto: 45000,
  } as BankBalances,
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
  
  // Get all transactions, optionally filtered by account
  let transactions = Array.from(bankState.transactions.values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  
  if (account) {
    transactions = transactions.filter(t => t.account === account)
  }
  
  transactions = transactions.slice(0, limit)
  
  return NextResponse.json({
    balances: bankState.balances,
    transactions,
    count: transactions.length,
    total: bankState.transactions.size,
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
    
    // Update balance
    const previousBalance = bankState.balances[safeAccount]
    const newBalance = previousBalance + amount
    bankState.balances[safeAccount] = newBalance
    
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
    
    // Store transaction
    bankState.transactions.set(transaction.id, transaction)
    
    return NextResponse.json({
      success: true,
      transaction,
      balances: bankState.balances,
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
// ============================================================================

export async function DELETE() {
  const count = bankState.transactions.size
  
  // Clear transactions
  bankState.transactions.clear()
  
  // Reset balances to defaults
  bankState.balances = {
    foretagskonto: 250000,
    sparkonto: 150000,
    skattekonto: 45000,
  }
  
  return NextResponse.json({
    message: `Bank reset. Cleared ${count} transactions.`,
    balances: bankState.balances,
  })
}
