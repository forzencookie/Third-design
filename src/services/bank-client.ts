/**
 * Bank Simulator Client
 * 
 * Client-side service for the fake bank simulator.
 * Handles transactions, balances, and storage for the bank simulation.
 */

// ============================================
// Types
// ============================================

export interface BankTransaction {
  id: string
  type: 'payment' | 'transfer' | 'deposit' | 'withdrawal' | 'salary' | 'tax' | 'fee'
  amount: number
  description: string
  reference?: string
  fromAccount: AccountType
  toAccount: AccountType
  recipient?: string
  sender?: string
  timestamp: string
  status: 'pending' | 'completed' | 'failed'
  category?: string
}

export type AccountType = 'foretagskonto' | 'sparkonto' | 'skattekonto' | 'external'

export interface BankBalances {
  foretagskonto: number
  sparkonto: number
  skattekonto: number
}

export interface TransactionRequest {
  type: BankTransaction['type']
  amount: number
  description: string
  reference?: string
  fromAccount: AccountType
  toAccount: AccountType
  recipient?: string
  category?: string
}

export interface TransactionResponse {
  success: boolean
  transaction?: BankTransaction
  message?: string
  error?: string
}

// ============================================
// Storage Keys
// ============================================

const TRANSACTIONS_KEY = 'bank_transactions'
const BALANCES_KEY = 'bank_balances'

// ============================================
// Default Values
// ============================================

const DEFAULT_BALANCES: BankBalances = {
  foretagskonto: 250000,
  sparkonto: 150000,
  skattekonto: 45000,
}

// ============================================
// Balance Management
// ============================================

export function getBalances(): BankBalances {
  if (typeof window === 'undefined') return DEFAULT_BALANCES
  
  const stored = localStorage.getItem(BALANCES_KEY)
  if (!stored) {
    localStorage.setItem(BALANCES_KEY, JSON.stringify(DEFAULT_BALANCES))
    return DEFAULT_BALANCES
  }
  return JSON.parse(stored)
}

export function updateBalances(balances: BankBalances): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(BALANCES_KEY, JSON.stringify(balances))
}

export function resetBalances(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(BALANCES_KEY, JSON.stringify(DEFAULT_BALANCES))
}

// ============================================
// Transaction Storage
// ============================================

export function getTransactions(): BankTransaction[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(TRANSACTIONS_KEY)
  return stored ? JSON.parse(stored) : []
}

function storeTransaction(transaction: BankTransaction): void {
  if (typeof window === 'undefined') return
  
  const transactions = getTransactions()
  transactions.unshift(transaction)
  // Keep last 100 transactions
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions.slice(0, 100)))
}

export function clearTransactions(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TRANSACTIONS_KEY)
}

export function resetBank(): void {
  clearTransactions()
  resetBalances()
}

// ============================================
// Transaction Processing
// ============================================

export async function processTransaction(request: TransactionRequest): Promise<TransactionResponse> {
  try {
    // Call the API
    const response = await fetch('/api/simulator/bank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    const data = await response.json()

    if (data.success && data.transaction) {
      // Store the transaction locally
      storeTransaction(data.transaction)
      
      // Update balances
      const balances = getBalances()
      
      if (request.fromAccount !== 'external') {
        balances[request.fromAccount] -= request.amount
      }
      if (request.toAccount !== 'external') {
        balances[request.toAccount] += request.amount
      }
      
      updateBalances(balances)
    }

    return data
  } catch (error) {
    console.error('Transaction processing error:', error)
    return {
      success: false,
      error: 'Kunde inte genomföra transaktionen',
    }
  }
}

// ============================================
// Convenience Methods for Common Transactions
// ============================================

/**
 * Make a payment from företagskonto to external recipient
 */
export async function makePayment(
  amount: number,
  description: string,
  recipient: string,
  reference?: string
): Promise<TransactionResponse> {
  return processTransaction({
    type: 'payment',
    amount,
    description,
    recipient,
    reference,
    fromAccount: 'foretagskonto',
    toAccount: 'external',
    category: 'expense',
  })
}

/**
 * Transfer between internal accounts
 */
export async function transferBetweenAccounts(
  amount: number,
  fromAccount: Exclude<AccountType, 'external'>,
  toAccount: Exclude<AccountType, 'external'>,
  description?: string
): Promise<TransactionResponse> {
  return processTransaction({
    type: 'transfer',
    amount,
    description: description || `Överföring från ${getAccountLabel(fromAccount)} till ${getAccountLabel(toAccount)}`,
    fromAccount,
    toAccount,
  })
}

/**
 * Pay salary (löneutbetalning)
 */
export async function paySalary(
  amount: number,
  employeeName: string,
  reference?: string
): Promise<TransactionResponse> {
  return processTransaction({
    type: 'salary',
    amount,
    description: `Lön ${employeeName}`,
    recipient: employeeName,
    reference,
    fromAccount: 'foretagskonto',
    toAccount: 'external',
    category: 'salary',
  })
}

/**
 * Pay tax to Skatteverket
 */
export async function payTax(
  amount: number,
  taxType: string,
  ocr?: string
): Promise<TransactionResponse> {
  return processTransaction({
    type: 'tax',
    amount,
    description: `Skatteinbetalning: ${taxType}`,
    recipient: 'Skatteverket',
    reference: ocr,
    fromAccount: 'skattekonto',
    toAccount: 'external',
    category: 'tax',
  })
}

/**
 * Pay employer contributions (arbetsgivaravgifter)
 */
export async function payEmployerContributions(
  amount: number,
  period: string,
  ocr?: string
): Promise<TransactionResponse> {
  return processTransaction({
    type: 'tax',
    amount,
    description: `Arbetsgivaravgifter ${period}`,
    recipient: 'Skatteverket',
    reference: ocr,
    fromAccount: 'skattekonto',
    toAccount: 'external',
    category: 'employer-contributions',
  })
}

/**
 * Receive customer payment (kundinbetalning)
 */
export async function receivePayment(
  amount: number,
  sender: string,
  reference?: string
): Promise<TransactionResponse> {
  const transaction: BankTransaction = {
    id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'deposit',
    amount,
    description: `Inbetalning från ${sender}`,
    sender,
    reference,
    fromAccount: 'external',
    toAccount: 'foretagskonto',
    timestamp: new Date().toISOString(),
    status: 'completed',
    category: 'income',
  }

  storeTransaction(transaction)
  
  const balances = getBalances()
  balances.foretagskonto += amount
  updateBalances(balances)

  return {
    success: true,
    transaction,
    message: `Inbetalning mottagen: ${amount.toLocaleString('sv-SE')} kr`,
  }
}

/**
 * Pay invoice (faktura)
 */
export async function payInvoice(
  amount: number,
  supplier: string,
  invoiceNumber: string,
  ocr?: string
): Promise<TransactionResponse> {
  return processTransaction({
    type: 'payment',
    amount,
    description: `Faktura ${invoiceNumber} - ${supplier}`,
    recipient: supplier,
    reference: ocr || invoiceNumber,
    fromAccount: 'foretagskonto',
    toAccount: 'external',
    category: 'expense',
  })
}

// ============================================
// Helper Functions
// ============================================

export function getAccountLabel(account: AccountType): string {
  switch (account) {
    case 'foretagskonto': return 'Företagskonto'
    case 'sparkonto': return 'Sparkonto'
    case 'skattekonto': return 'Skattekonto'
    case 'external': return 'Extern'
    default: return account
  }
}

export function getTransactionTypeLabel(type: BankTransaction['type']): string {
  switch (type) {
    case 'payment': return 'Betalning'
    case 'transfer': return 'Överföring'
    case 'deposit': return 'Insättning'
    case 'withdrawal': return 'Uttag'
    case 'salary': return 'Löneutbetalning'
    case 'tax': return 'Skatteinbetalning'
    case 'fee': return 'Avgift'
    default: return type
  }
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })
}
