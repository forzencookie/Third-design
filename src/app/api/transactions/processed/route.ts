/**
 * Processed Transactions API
 * 
 * This endpoint reads transactions from the local database
 * and processes them through the transaction-processor service to
 * add display properties (icons, colors, status, AI suggestions).
 * 
 * This is what the Dashboard frontend calls.
 */

import { NextResponse } from "next/server"
import {
  processTransactions,
  type NakedTransaction,
} from "@/services/transaction-processor"
import { db } from "@/lib/server-db"

/**
 * GET /api/transactions/processed
 * Returns fully processed transactions ready for display
 */
export async function GET() {
  try {
    // 1. Read from local database
    const dbData = await db.get()
    const rawTransactions = dbData.transactions || []

    // 2. Transform to naked transaction format for processing
    const nakedTransactions: NakedTransaction[] = rawTransactions.map((tx: any) => ({
      id: tx.id,
      name: tx.description || tx.name,
      amount: tx.amountValue || tx.amount,
      date: tx.date,
      account: tx.account || 'Företagskonto',
      reference: tx.reference,
    }))

    // 3. Process (clothe) the naked transactions with AI, icons, status
    const processedTransactions = processTransactions(nakedTransactions)

    // 4. Merge with persisted metadata
    const metadata: Record<string, any> = dbData.transactionMetadata || {}

    const mergedTransactions = processedTransactions.map(pt => {
      const meta = metadata[pt.id]
      if (meta) {
        return {
          ...pt,
          status: meta.status || pt.status,
          category: meta.category || pt.category,
          account: meta.account || pt.account,
        }
      }
      return pt
    })

    return NextResponse.json({
      transactions: mergedTransactions,
      count: mergedTransactions.length,
      source: "local-db",
      note: "Transactions processed from local database"
    })

  } catch (error) {
    console.error('Error processing transactions:', error)
    return NextResponse.json(
      { error: 'Failed to process transactions', transactions: [] },
      { status: 500 }
    )
  }
}

