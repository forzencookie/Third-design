import { NextRequest, NextResponse } from 'next/server'

// Types for bank transactions
export interface BankTransaction {
  id: string
  type: 'payment' | 'transfer' | 'deposit' | 'withdrawal' | 'salary' | 'tax' | 'fee'
  amount: number
  description: string
  reference?: string
  fromAccount: 'foretagskonto' | 'sparkonto' | 'skattekonto' | 'external'
  toAccount: 'foretagskonto' | 'sparkonto' | 'skattekonto' | 'external'
  recipient?: string
  sender?: string
  timestamp: string
  status: 'pending' | 'completed' | 'failed'
  category?: string
}

export interface BankBalances {
  foretagskonto: number
  sparkonto: number
  skattekonto: number
}

interface TransactionRequest {
  type: BankTransaction['type']
  amount: number
  description: string
  reference?: string
  fromAccount: BankTransaction['fromAccount']
  toAccount: BankTransaction['toAccount']
  recipient?: string
  category?: string
}

// POST - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TransactionRequest

    // Validate required fields
    if (!body.type || !body.amount || !body.fromAccount || !body.toAccount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, amount, fromAccount, toAccount' },
        { status: 400 }
      )
    }

    // Validate amount
    if (body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be positive' },
        { status: 400 }
      )
    }

    // Generate transaction
    const transaction: BankTransaction = {
      id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: body.type,
      amount: body.amount,
      description: body.description || getDefaultDescription(body.type),
      reference: body.reference,
      fromAccount: body.fromAccount,
      toAccount: body.toAccount,
      recipient: body.recipient,
      timestamp: new Date().toISOString(),
      status: 'completed', // Simulate instant completion
      category: body.category,
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300))

    return NextResponse.json({
      success: true,
      transaction,
      message: `Transaktion genomförd: ${transaction.description}`,
    })

  } catch (error) {
    console.error('Bank transaction error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process transaction' },
      { status: 500 }
    )
  }
}

// GET - Get current balances
export async function GET() {
  // These would be stored in a database in production
  // For simulation, we return from localStorage on client side
  // This endpoint returns default/initial balances
  
  const defaultBalances: BankBalances = {
    foretagskonto: 250000,
    sparkonto: 150000,
    skattekonto: 45000,
  }

  return NextResponse.json({
    success: true,
    balances: defaultBalances,
    timestamp: new Date().toISOString(),
  })
}

function getDefaultDescription(type: BankTransaction['type']): string {
  switch (type) {
    case 'payment': return 'Betalning'
    case 'transfer': return 'Överföring'
    case 'deposit': return 'Insättning'
    case 'withdrawal': return 'Uttag'
    case 'salary': return 'Löneutbetalning'
    case 'tax': return 'Skatteinbetalning'
    case 'fee': return 'Avgift'
    default: return 'Transaktion'
  }
}
