/**
 * Hook: useBankTransactions
 * 
 * Fetches naked bank transactions and provides methods to enrich them
 * with AI categorization and double-entry bookkeeping.
 * 
 * This hook bridges the gap between raw bank data and the accounting system.
 */

import { useState, useEffect, useCallback } from 'react'
import type {
  NakedBankTransaction,
  EnrichedTransaction,
  TransactionCategory,
  BankAccountType,
} from '@/types/bank'
import {
  getNakedTransactions,
  getEnrichedTransactions,
  storeEnrichedTransaction,
  getBalances,
  type BankBalances,
} from '@/services/bank-transaction-service'
import { categoryMeta, bankAccountMeta } from '@/types/bank'

// ============================================
// Hook Return Type
// ============================================

export interface UseBankTransactionsReturn {
  /** All naked transactions from the bank */
  transactions: NakedBankTransaction[]
  /** Transactions that have been enriched/categorized */
  enrichedTransactions: EnrichedTransaction[]
  /** Transactions still pending categorization */
  pendingTransactions: NakedBankTransaction[]
  /** Current bank balances */
  balances: BankBalances
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: string | null
  /** Refresh data from storage */
  refresh: () => void
  /** Categorize a transaction */
  categorizeTransaction: (transactionId: string, category: TransactionCategory, aiConfidence?: number) => void
  /** Mark a transaction as booked (linked to verifikation) */
  bookTransaction: (transactionId: string, verifikationId: string) => void
  /** Get enrichment for a specific transaction */
  getEnrichment: (transactionId: string) => EnrichedTransaction | undefined
  /** Stats about transaction processing */
  stats: {
    total: number
    pending: number
    categorized: number
    booked: number
  }
}

// ============================================
// The Hook
// ============================================

export function useBankTransactions(): UseBankTransactionsReturn {
  const [transactions, setTransactions] = useState<NakedBankTransaction[]>([])
  const [enrichedTransactions, setEnrichedTransactions] = useState<EnrichedTransaction[]>([])
  const [balances, setBalances] = useState<BankBalances>({ foretagskonto: 0, sparkonto: 0, skattekonto: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from storage
  const loadData = useCallback(() => {
    try {
      setTransactions(getNakedTransactions())
      setEnrichedTransactions(getEnrichedTransactions())
      setBalances(getBalances())
      setError(null)
    } catch (err) {
      setError('Kunde inte ladda transaktioner')
      console.error('Error loading bank transactions:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load and polling
  useEffect(() => {
    loadData()

    // Poll for new transactions every 3 seconds
    // const interval = setInterval(loadData, 3000)
    // return () => clearInterval(interval)
  }, [loadData])

  // Refresh function
  const refresh = useCallback(() => {
    setIsLoading(true)
    loadData()
  }, [loadData])

  // Categorize a transaction
  const categorizeTransaction = useCallback((
    transactionId: string,
    category: TransactionCategory,
    aiConfidence?: number
  ) => {
    const nakedTx = transactions.find(t => t.id === transactionId)
    if (!nakedTx) {
      console.error('Transaction not found:', transactionId)
      return
    }

    const enriched: EnrichedTransaction = {
      bankTransaction: nakedTx,
      category,
      aiConfidence,
      status: 'categorized',
      categorizedAt: new Date().toISOString(),
    }

    storeEnrichedTransaction(enriched)
    setEnrichedTransactions(prev => {
      const existing = prev.findIndex(e => e.bankTransaction.id === transactionId)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = enriched
        return updated
      }
      return [enriched, ...prev]
    })
  }, [transactions])

  // Book a transaction (link to verifikation)
  const bookTransaction = useCallback((
    transactionId: string,
    verifikationId: string
  ) => {
    const existing = enrichedTransactions.find(e => e.bankTransaction.id === transactionId)
    if (!existing) {
      console.error('Enriched transaction not found:', transactionId)
      return
    }

    const booked: EnrichedTransaction = {
      ...existing,
      status: 'booked',
      verifikationId,
      bookedAt: new Date().toISOString(),
    }

    storeEnrichedTransaction(booked)
    setEnrichedTransactions(prev =>
      prev.map(e => e.bankTransaction.id === transactionId ? booked : e)
    )
  }, [enrichedTransactions])

  // Get enrichment for a specific transaction
  const getEnrichment = useCallback((transactionId: string): EnrichedTransaction | undefined => {
    return enrichedTransactions.find(e => e.bankTransaction.id === transactionId)
  }, [enrichedTransactions])

  // Calculate pending transactions
  const pendingTransactions = transactions.filter(t => {
    const enriched = enrichedTransactions.find(e => e.bankTransaction.id === t.id)
    return !enriched || enriched.status === 'pending'
  })

  // Calculate stats
  const stats = {
    total: transactions.length,
    pending: pendingTransactions.length,
    categorized: enrichedTransactions.filter(e => e.status === 'categorized').length,
    booked: enrichedTransactions.filter(e => e.status === 'booked' || e.status === 'verified').length,
  }

  return {
    transactions,
    enrichedTransactions,
    pendingTransactions,
    balances,
    isLoading,
    error,
    refresh,
    categorizeTransaction,
    bookTransaction,
    getEnrichment,
    stats,
  }
}

// ============================================
// AI Categorization Helper
// ============================================

/**
 * Simple keyword-based categorization for demo purposes.
 * In production, this would call an AI service.
 */
export function suggestCategory(description: string): { category: TransactionCategory; confidence: number } {
  const desc = description.toLowerCase()

  // Keywords for each category
  const patterns: { category: TransactionCategory; keywords: string[]; confidence: number }[] = [
    { category: 'salary', keywords: ['lön', 'salary', 'netto'], confidence: 95 },
    { category: 'tax', keywords: ['skatt', 'moms', 'skatteverket'], confidence: 95 },
    { category: 'rent', keywords: ['hyra', 'lokalhyra', 'fastighets'], confidence: 90 },
    { category: 'subscriptions', keywords: ['spotify', 'adobe', 'microsoft', 'slack', 'notion', 'figma', 'google'], confidence: 90 },
    { category: 'travel', keywords: ['sas', 'sj', 'scandic', 'flyg', 'tåg', 'hotell', 'bensin', 'circle k', 'okq8'], confidence: 85 },
    { category: 'office-supplies', keywords: ['ikea', 'clas ohlson', 'staples', 'dustin', 'kontors'], confidence: 85 },
    { category: 'food-entertainment', keywords: ['espresso', 'starbucks', 'max', 'wayne', 'fika', 'restaurang', 'lunch'], confidence: 80 },
    { category: 'utilities', keywords: ['telia', 'telenor', 'vattenfall', 'el', 'internet'], confidence: 85 },
    { category: 'bank-fees', keywords: ['bankavgift', 'avgift', 'ränta'], confidence: 90 },
    { category: 'professional-services', keywords: ['konsult', 'advokat', 'revisor', 'byra'], confidence: 75 },
    { category: 'insurance', keywords: ['försäkring', 'if', 'trygg'], confidence: 85 },
    { category: 'marketing', keywords: ['reklam', 'annons', 'facebook', 'google ads', 'linkedin'], confidence: 80 },
  ]

  for (const pattern of patterns) {
    if (pattern.keywords.some(keyword => desc.includes(keyword))) {
      return { category: pattern.category, confidence: pattern.confidence }
    }
  }

  // Default based on amount direction would be determined by caller
  return { category: 'uncategorized', confidence: 0 }
}

/**
 * Get the BAS account number for a category
 */
export function getCategoryAccountNumber(category: TransactionCategory): string | undefined {
  return categoryMeta[category]?.defaultAccountNumber
}

/**
 * Get the BAS account number for a bank account type
 */
export function getBankAccountNumber(account: BankAccountType): string {
  return bankAccountMeta[account]?.basAccountNumber || '1930'
}
