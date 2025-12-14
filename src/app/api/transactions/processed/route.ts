/**
 * Processed Transactions API
 * 
 * This endpoint fetches NAKED transactions from the Bank API
 * and processes them through the transaction-processor service to
 * add display properties (icons, colors, status, AI suggestions).
 * 
 * This is what the Dashboard frontend calls.
 */

import { NextResponse } from "next/server"
import { 
  processTransactions, 
  type NakedTransaction 
} from "@/services/transaction-processor"

/**
 * GET /api/transactions/processed
 * Returns fully processed transactions ready for display
 */
export async function GET() {
  try {
    // Fetch from the unified Bank API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/bank/transactions`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch from bank API')
    }
    
    const data = await response.json()
    
    // Transform bank transactions to naked transaction format
    const nakedTransactions: NakedTransaction[] = (data.transactions || []).map((bt: any) => ({
      id: bt.id,
      name: bt.description,
      amount: bt.amount,
      date: bt.date,
      account: bt.account === 'foretagskonto' ? 'Företagskonto' : 
               bt.account === 'sparkonto' ? 'Sparkonto' : 
               bt.account === 'skattekonto' ? 'Skattekonto' : bt.account,
      reference: bt.reference,
    }))
    
    // Process (clothe) the naked transactions with AI, icons, status
    const processedTransactions = processTransactions(nakedTransactions)
    
    return NextResponse.json({
      transactions: processedTransactions,
      count: processedTransactions.length,
      source: "bank-api",
      note: "Transactions fetched from bank and processed with icons, status, and AI suggestions"
    })
    
  } catch (error) {
    console.error('Error processing transactions:', error)
    return NextResponse.json(
      { error: 'Failed to process transactions', transactions: [] },
      { status: 500 }
    )
  }
}
