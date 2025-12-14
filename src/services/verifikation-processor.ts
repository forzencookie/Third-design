/**
 * Verifikation Processor Service
 * 
 * Takes NAKED verifikationer (raw accounting entries) and "clothes" them:
 * - Adds display properties (status indicators)
 * - Links transactions and receipts
 * - Calculates completeness status
 */

import { basAccounts, type Account } from "@/data/accounts"

// ============================================================================
// Types
// ============================================================================

/**
 * Raw verifikation from bookkeeping - "naked"
 */
export interface NakedVerifikation {
  id: string
  date: string              // "2024-12-05" ISO date
  description: string       // "IKEA kontorsmaterial"
  amount: number            // -1200 (negative = expense)
  accountNumber: string     // "5410"
  transactionId?: string    // Linked bank transaction ID
  receiptId?: string        // Linked receipt/underlag ID
}

/**
 * Fully processed verifikation ready for display
 */
export interface ProcessedVerifikation {
  id: string
  date: string
  description: string
  amount: number
  konto: string
  kontoName: string
  kontoType: Account['type']
  hasTransaction: boolean
  hasUnderlag: boolean
  transactionId?: string
  receiptId?: string
}

// ============================================================================
// Account Lookup
// ============================================================================

function getAccountInfo(accountNumber: string): { name: string; type: Account['type'] } {
  const account = basAccounts.find(a => a.number === accountNumber)
  if (account) {
    return { name: account.name, type: account.type }
  }
  // Default fallback
  return { name: `Konto ${accountNumber}`, type: 'expense' }
}

// ============================================================================
// Main Processor
// ============================================================================

export function processVerifikation(naked: NakedVerifikation): ProcessedVerifikation {
  const accountInfo = getAccountInfo(naked.accountNumber)
  
  // Format date for display
  const dateObj = new Date(naked.date)
  const formattedDate = dateObj.toISOString().split('T')[0] // Keep as YYYY-MM-DD
  
  return {
    id: naked.id,
    date: formattedDate,
    description: naked.description,
    amount: naked.amount,
    konto: naked.accountNumber,
    kontoName: accountInfo.name,
    kontoType: accountInfo.type,
    hasTransaction: !!naked.transactionId,
    hasUnderlag: !!naked.receiptId,
    transactionId: naked.transactionId,
    receiptId: naked.receiptId,
  }
}

export function processVerifikationer(naked: NakedVerifikation[]): ProcessedVerifikation[] {
  return naked.map(processVerifikation)
}

// ============================================================================
// Mock Data Generator (for demo/development)
// ============================================================================

export function generateMockVerifikationer(): ProcessedVerifikation[] {
  const mockNaked: NakedVerifikation[] = [
    {
      id: "v-1",
      date: "2024-12-05",
      description: "IKEA kontorsmaterial",
      amount: -1200,
      accountNumber: "5410",
      transactionId: "txn-1",
      receiptId: "r-1",
    },
    {
      id: "v-2",
      date: "2024-12-04",
      description: "Spotify Premium",
      amount: -169,
      accountNumber: "5420",
      transactionId: "txn-2",
      receiptId: "r-2",
    },
    {
      id: "v-3",
      date: "2024-12-04",
      description: "Lunch kundmöte",
      amount: -450,
      accountNumber: "6072",
      transactionId: "txn-3",
      // No receipt - missing underlag
    },
    {
      id: "v-4",
      date: "2024-12-03",
      description: "Kundbetalning ABC AB",
      amount: 15000,
      accountNumber: "3040",
      transactionId: "txn-4",
      receiptId: "r-4",
    },
    {
      id: "v-5",
      date: "2024-12-03",
      description: "Adobe Creative Cloud",
      amount: -599,
      accountNumber: "5420",
      transactionId: "txn-5",
      receiptId: "r-5",
    },
    {
      id: "v-6",
      date: "2024-12-02",
      description: "Telia mobilabonnemang",
      amount: -349,
      accountNumber: "6212",
      transactionId: "txn-6",
      // No receipt - missing underlag
    },
    {
      id: "v-7",
      date: "2024-12-01",
      description: "Clas Ohlson kontorsstol",
      amount: -2400,
      accountNumber: "5410",
      transactionId: "txn-7",
      receiptId: "r-7",
    },
  ]
  
  return processVerifikationer(mockNaked)
}
