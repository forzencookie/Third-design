/**
 * Bank to Bookkeeping Bridge
 * 
 * This service converts naked bank transactions into proper Swedish
 * double-entry bookkeeping verifikationer (journal entries).
 * 
 * Flow:
 * 1. Bank transaction comes in (naked, minimal data)
 * 2. AI categorizes the transaction
 * 3. This service creates a proper verifikation with debit/credit
 * 4. Verifikation is validated and stored
 */

import type { NakedBankTransaction, EnrichedTransaction, TransactionCategory } from '@/types/bank'
import type { JournalEntry, JournalEntryLine } from '@/lib/bookkeeping'
import { 
  validateJournalEntry, 
  createPurchaseEntry, 
  createPaymentReceivedEntry,
  createSalaryEntry,
} from '@/lib/bookkeeping'
import { getAccount } from '@/data/accounts'
import { categoryMeta, bankAccountMeta } from '@/types/bank'

// ============================================
// Storage
// ============================================

const JOURNAL_ENTRIES_KEY = 'journal_entries'
let verificationCounter = 1

function getNextVerificationNumber(): number {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('verification_counter')
    if (stored) {
      verificationCounter = parseInt(stored, 10)
    }
    verificationCounter++
    localStorage.setItem('verification_counter', verificationCounter.toString())
  }
  return verificationCounter
}

export function getJournalEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(JOURNAL_ENTRIES_KEY)
  return stored ? JSON.parse(stored) : []
}

export function storeJournalEntry(entry: JournalEntry): void {
  if (typeof window === 'undefined') return
  const entries = getJournalEntries()
  entries.unshift(entry)
  localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries.slice(0, 500)))
}

// ============================================
// Bank Transaction to Verifikation
// ============================================

/**
 * Convert a categorized bank transaction into a proper journal entry (verifikation)
 */
export function createVerifikationFromBank(
  enriched: EnrichedTransaction,
  options?: {
    vatRate?: '25' | '12' | '6' | '0'
    customDescription?: string
    customAccountNumber?: string
  }
): JournalEntry {
  const { bankTransaction, category } = enriched
  const { vatRate = '25', customDescription, customAccountNumber } = options || {}
  
  const amount = Math.abs(bankTransaction.amount)
  const isExpense = bankTransaction.amount < 0
  const date = bankTransaction.timestamp.split('T')[0]
  const description = customDescription || bankTransaction.description
  
  // Get the BAS account number for the bank account
  const bankAccountNumber = bankAccountMeta[bankTransaction.account]?.basAccountNumber || '1930'
  
  // Get the category's default account or use custom
  const categoryAccountNumber = customAccountNumber || 
    categoryMeta[category || 'uncategorized']?.defaultAccountNumber ||
    (isExpense ? '6990' : '3990') // Övrig kostnad/intäkt
  
  const now = new Date().toISOString()
  const verificationNumber = getNextVerificationNumber()
  
  const lines: JournalEntryLine[] = []
  
  if (isExpense) {
    // Expense: Debit the expense account, Credit the bank account
    // Handle VAT if applicable
    if (vatRate && vatRate !== '0') {
      const vatMultiplier = parseFloat(vatRate) / 100
      const netAmount = amount / (1 + vatMultiplier)
      const vatAmount = amount - netAmount
      
      // Expense account (net)
      lines.push({
        accountNumber: categoryAccountNumber,
        accountName: getAccount(categoryAccountNumber)?.name,
        debit: Math.round(netAmount * 100) / 100,
        credit: 0,
      })
      
      // Input VAT (ingående moms)
      lines.push({
        accountNumber: '1640',
        accountName: 'Ingående moms',
        debit: Math.round(vatAmount * 100) / 100,
        credit: 0,
        vatCode: vatRate,
      })
    } else {
      // No VAT
      lines.push({
        accountNumber: categoryAccountNumber,
        accountName: getAccount(categoryAccountNumber)?.name,
        debit: amount,
        credit: 0,
      })
    }
    
    // Credit bank account
    lines.push({
      accountNumber: bankAccountNumber,
      accountName: getAccount(bankAccountNumber)?.name || bankAccountMeta[bankTransaction.account]?.label,
      debit: 0,
      credit: amount,
    })
  } else {
    // Income: Debit bank account, Credit revenue account
    // Debit bank account
    lines.push({
      accountNumber: bankAccountNumber,
      accountName: getAccount(bankAccountNumber)?.name || bankAccountMeta[bankTransaction.account]?.label,
      debit: amount,
      credit: 0,
    })
    
    // Handle VAT for income if applicable
    if (vatRate && vatRate !== '0') {
      const vatMultiplier = parseFloat(vatRate) / 100
      const netAmount = amount / (1 + vatMultiplier)
      const vatAmount = amount - netAmount
      
      // Revenue account (net)
      lines.push({
        accountNumber: categoryAccountNumber,
        accountName: getAccount(categoryAccountNumber)?.name,
        debit: 0,
        credit: Math.round(netAmount * 100) / 100,
      })
      
      // Output VAT (utgående moms)
      const vatAccountNumber = vatRate === '25' ? '2610' : vatRate === '12' ? '2620' : '2630'
      lines.push({
        accountNumber: vatAccountNumber,
        accountName: getAccount(vatAccountNumber)?.name || 'Utgående moms',
        debit: 0,
        credit: Math.round(vatAmount * 100) / 100,
        vatCode: vatRate,
      })
    } else {
      // No VAT - full amount to revenue
      lines.push({
        accountNumber: categoryAccountNumber,
        accountName: getAccount(categoryAccountNumber)?.name,
        debit: 0,
        credit: amount,
      })
    }
  }
  
  const entry: JournalEntry = {
    id: `VER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    verificationNumber,
    series: 'A', // Bank transactions
    date,
    description,
    lines,
    documentRef: bankTransaction.reference,
    documentType: 'bank',
    createdBy: enriched.aiConfidence ? 'ai' : 'user',
    aiConfidence: enriched.aiConfidence,
    createdAt: now,
    updatedAt: now,
  }
  
  return entry
}

/**
 * Validate and store a verifikation created from a bank transaction
 */
export function bookBankTransaction(
  enriched: EnrichedTransaction,
  options?: {
    vatRate?: '25' | '12' | '6' | '0'
    customDescription?: string
    customAccountNumber?: string
  }
): { success: boolean; entry?: JournalEntry; errors?: string[] } {
  const entry = createVerifikationFromBank(enriched, options)
  const validation = validateJournalEntry(entry)
  
  if (!validation.isValid) {
    return { success: false, errors: validation.errors }
  }
  
  storeJournalEntry(entry)
  
  return { success: true, entry }
}

// ============================================
// Summary & Reports
// ============================================

/**
 * Get summary of journal entries for a period
 */
export function getBookkeepingSummary(startDate?: string, endDate?: string): {
  totalEntries: number
  totalDebit: number
  totalCredit: number
  byAccount: Record<string, { debit: number; credit: number; balance: number }>
} {
  const entries = getJournalEntries()
  
  // Filter by date if provided
  const filtered = entries.filter(entry => {
    if (startDate && entry.date < startDate) return false
    if (endDate && entry.date > endDate) return false
    return true
  })
  
  let totalDebit = 0
  let totalCredit = 0
  const byAccount: Record<string, { debit: number; credit: number; balance: number }> = {}
  
  for (const entry of filtered) {
    for (const line of entry.lines) {
      totalDebit += line.debit
      totalCredit += line.credit
      
      if (!byAccount[line.accountNumber]) {
        byAccount[line.accountNumber] = { debit: 0, credit: 0, balance: 0 }
      }
      byAccount[line.accountNumber].debit += line.debit
      byAccount[line.accountNumber].credit += line.credit
    }
  }
  
  // Calculate balances (debit - credit, or credit - debit depending on account type)
  for (const accountNumber of Object.keys(byAccount)) {
    const account = getAccount(accountNumber)
    const { debit, credit } = byAccount[accountNumber]
    
    // Assets and expenses increase with debit
    // Liabilities, equity, and revenue increase with credit
    if (account) {
      const isDebitNormal = ['asset', 'expense'].includes(account.type)
      byAccount[accountNumber].balance = isDebitNormal ? debit - credit : credit - debit
    } else {
      byAccount[accountNumber].balance = debit - credit
    }
  }
  
  return {
    totalEntries: filtered.length,
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    byAccount,
  }
}

/**
 * Clear all journal entries (for testing)
 */
export function clearJournalEntries(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(JOURNAL_ENTRIES_KEY)
  localStorage.removeItem('verification_counter')
  verificationCounter = 1
}
