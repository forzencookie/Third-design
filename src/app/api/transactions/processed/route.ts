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
  type NakedTransaction,
  type ProcessedTransaction
} from "@/services/transaction-processor"
import { db } from "@/lib/server-db"

/**
 * GET /api/transactions/processed
 * Returns fully processed transactions ready for display
 */
export async function GET() {
  try {
    // 1. Fetch from the unified Bank API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/bank/transactions`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch from bank API')
    }

    const data = await response.json()

    // 2. Transform bank transactions to naked transaction format
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

    // 3. Process (clothe) the naked transactions with AI, icons, status
    // This gives us the "default" state for all transactions
    const processedTransactions = processTransactions(nakedTransactions)

    // 4. Merge with persisted state from our local DB
    // This ensures that if we have booked a transaction, we remember that status
    const dbData = await db.get()
    const persistedTransactions = dbData.transactions || []
    const transactionMap = new Map(persistedTransactions.map((t: any) => [t.id, t]))

    const mergedTransactions = processedTransactions.map(pt => {
      const persisted = transactionMap.get(pt.id)
      if (persisted) {
        // If we know this transaction, use the persisted status and details
        return {
          ...pt,
          status: persisted.status || pt.status,
          category: persisted.category || pt.category,
          account: persisted.account || pt.account,
          // Keep other generated props like icons unless specifically overridden
        }
      }
      return pt
    })

    return NextResponse.json({
      transactions: mergedTransactions,
      count: mergedTransactions.length,
      source: "bank-api",
      note: "Transactions fetched from bank and merged with local bookkeeping records"
    })

  } catch (error) {
    console.error('Error processing transactions:', error)
    return NextResponse.json(
      { error: 'Failed to process transactions', transactions: [] },
      { status: 500 }
    )
  }
}
