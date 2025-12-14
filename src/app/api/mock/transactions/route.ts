/**
 * Mock Transactions API - NAKED TRANSACTIONS
 * 
 * Simulates a REAL bank API - only returns raw data:
 * - Name (merchant name from bank)
 * - Amount (raw number)
 * - Date
 * 
 * NO categories, NO icons, NO AI - that's all added by the
 * transaction-processor service layer!
 */

import { NextRequest, NextResponse } from "next/server"
import type { NakedTransaction } from "@/services/transaction-processor"

// In-memory storage - simulates bank database
const mockTransactions: Map<string, NakedTransaction> = new Map()

// ============================================================================
// Bank Templates - Only raw data like a real bank sends
// ============================================================================

interface BankTemplate {
  name: string
  amountRange: [number, number]
  type: "expense" | "income"
}

const BANK_TEMPLATES: Record<string, BankTemplate[]> = {
  income: [
    { name: "KUND AB BETALNING", amountRange: [5000, 150000], type: "income" },
    { name: "FAKTURA BETALD", amountRange: [8000, 85000], type: "income" },
    { name: "KONSULTUPPDRAG", amountRange: [15000, 120000], type: "income" },
    { name: "PROJEKTAVSLUT", amountRange: [20000, 200000], type: "income" },
    { name: "WEBBUTVECKLING", amountRange: [10000, 75000], type: "income" },
  ],
  subscription: [
    { name: "SPOTIFY AB", amountRange: [129, 169], type: "expense" },
    { name: "NETFLIX.COM", amountRange: [109, 199], type: "expense" },
    { name: "ADOBE CREATIVE", amountRange: [149, 599], type: "expense" },
    { name: "MICROSOFT AZURE", amountRange: [200, 2500], type: "expense" },
    { name: "GOOGLE WORKSPACE", amountRange: [150, 450], type: "expense" },
    { name: "FIGMA INC", amountRange: [139, 449], type: "expense" },
    { name: "SLACK TECH", amountRange: [89, 289], type: "expense" },
    { name: "DROPBOX INT", amountRange: [99, 199], type: "expense" },
  ],
  travel: [
    { name: "SAS SCANDINAVIAN", amountRange: [1200, 8500], type: "expense" },
    { name: "SJ AB BILJETT", amountRange: [200, 1200], type: "expense" },
    { name: "UBER *TRIP", amountRange: [89, 450], type: "expense" },
    { name: "SCANDIC HOTELS", amountRange: [1200, 2800], type: "expense" },
    { name: "NORDIC CHOICE HT", amountRange: [1000, 2500], type: "expense" },
  ],
  office: [
    { name: "VATTENFALL AB", amountRange: [500, 2500], type: "expense" },
    { name: "TELIA FÖRETAG", amountRange: [299, 899], type: "expense" },
    { name: "FÖRSÄKRING IF", amountRange: [800, 3500], type: "expense" },
    { name: "CIRCLE K BENSIN", amountRange: [300, 900], type: "expense" },
    { name: "KONTORSHYRA AB", amountRange: [8000, 25000], type: "expense" },
  ],
  fika: [
    { name: "ESPRESSO HOUSE", amountRange: [45, 120], type: "expense" },
    { name: "STARBUCKS", amountRange: [50, 100], type: "expense" },
    { name: "WAYNES COFFEE", amountRange: [40, 95], type: "expense" },
    { name: "BASTARD BURGERS", amountRange: [120, 280], type: "expense" },
  ],
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
  return `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

function randomDate(daysBack: number = 30): string {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * daysBack)
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  return date.toISOString().split('T')[0] // ISO date format: 2025-01-15
}

function generateNakedTransaction(type: string): NakedTransaction {
  const templates = BANK_TEMPLATES[type] || BANK_TEMPLATES.subscription
  const template = templates[Math.floor(Math.random() * templates.length)]
  
  const rawAmount = randomAmount(template.amountRange[0], template.amountRange[1])
  const amount = template.type === "expense" ? -rawAmount : rawAmount
  
  return {
    id: generateId(),
    name: template.name,
    amount,
    date: randomDate(),
    account: "Företagskonto SEB",
    reference: Math.random() > 0.7 
      ? `OCR${Math.floor(Math.random() * 900000000) + 100000000}` 
      : undefined,
  }
}

// ============================================================================
// API Handlers
// ============================================================================

/**
 * GET /api/mock/transactions
 * Returns all NAKED transactions (no processing/clothing)
 */
export async function GET() {
  try {
    const transactions = Array.from(mockTransactions.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 100)

    return NextResponse.json({ 
      transactions, 
      count: transactions.length,
      type: "naked",
      note: "Process these with transaction-processor service to add display properties"
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

/**
 * POST /api/mock/transactions
 * Create a new NAKED transaction (simulating bank data)
 * Supports two modes:
 * 1. { type: 'subscription' } - Generate random transaction
 * 2. { id, name, amount, date, ... } - Direct transaction data from simulator
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check if this is direct transaction data (from simulator)
    if (body.id && body.name && body.amount !== undefined && body.date) {
      const directTransaction: NakedTransaction = {
        id: body.id,
        name: body.name,
        amount: body.amount,
        date: body.date,
        account: body.account || 'Företagskonto',
        reference: body.reference,
      }
      
      // Store in memory
      mockTransactions.set(directTransaction.id, directTransaction)

      return NextResponse.json({ 
        transaction: directTransaction,
        stored: true,
        type: "naked",
        message: "Bank transaction received from simulator"
      })
    }
    
    // Otherwise, generate a random transaction
    const { type = 'subscription' } = body

    // Generate naked transaction
    const naked = generateNakedTransaction(type)
    
    // Store in memory
    mockTransactions.set(naked.id, naked)

    return NextResponse.json({ 
      transaction: naked,
      stored: true,
      type: "naked",
      message: "Raw bank transaction created - use transaction-processor to add display properties"
    })

  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}

/**
 * DELETE /api/mock/transactions
 * Clear all mock transactions
 */
export async function DELETE() {
  try {
    const count = mockTransactions.size
    mockTransactions.clear()

    return NextResponse.json({ message: `Deleted ${count} mock transactions` })
  } catch (error) {
    console.error('Error deleting transactions:', error)
    return NextResponse.json({ error: 'Failed to delete transactions' }, { status: 500 })
  }
}
