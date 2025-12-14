/**
 * Bank Transaction Types
 * 
 * These types represent the "naked" bank transactions as they come from the bank.
 * Real bank data has minimal information - just the essential transaction details.
 * The bookkeeping layer "dresses" these with categories, accounts, and verifikationer.
 */

// ============================================
// Naked Bank Transaction (as from real bank)
// ============================================

/**
 * A raw transaction as it comes from the bank.
 * Minimal information, just like real bank statements.
 */
export interface NakedBankTransaction {
  /** Unique transaction ID from the bank */
  id: string
  /** Transaction timestamp */
  timestamp: string
  /** Amount (negative = outgoing, positive = incoming) */
  amount: number
  /** Transaction description (vendor name, reference, etc.) */
  description: string
  /** Bank reference number */
  reference?: string
  /** OCR number if available */
  ocr?: string
  /** Which account this is on */
  account: 'foretagskonto' | 'sparkonto' | 'skattekonto'
  /** Running balance after transaction (if available) */
  balanceAfter?: number
}

// ============================================
// Enriched Transaction (after AI/user processing)
// ============================================

/**
 * A bank transaction after being "dressed" by the bookkeeping system.
 * Contains all the original bank data plus categorization and verifikation.
 */
export interface EnrichedTransaction {
  /** The original naked bank transaction */
  bankTransaction: NakedBankTransaction
  /** AI-suggested or user-selected category */
  category?: TransactionCategory
  /** AI confidence in the categorization (0-100) */
  aiConfidence?: number
  /** Status of the bookkeeping process */
  status: 'pending' | 'categorized' | 'booked' | 'verified'
  /** Linked verifikation ID (if booked) */
  verifikationId?: string
  /** Linked receipt ID (if matched) */
  receiptId?: string
  /** Linked invoice ID (if matched) */
  invoiceId?: string
  /** User notes */
  notes?: string
  /** Processing timestamps */
  categorizedAt?: string
  bookedAt?: string
}

// ============================================
// Transaction Categories
// ============================================

export type TransactionCategory =
  | 'income'
  | 'salary'
  | 'rent'
  | 'utilities'
  | 'subscriptions'
  | 'office-supplies'
  | 'travel'
  | 'food-entertainment'
  | 'marketing'
  | 'professional-services'
  | 'insurance'
  | 'tax'
  | 'bank-fees'
  | 'transfer'
  | 'other-expense'
  | 'other-income'
  | 'uncategorized'

/**
 * Category metadata for display
 */
export const categoryMeta: Record<TransactionCategory, {
  label: string
  labelSv: string
  icon: string
  color: string
  defaultAccountNumber?: string
}> = {
  'income': {
    label: 'Income',
    labelSv: 'Intäkt',
    icon: 'TrendingUp',
    color: 'green',
    defaultAccountNumber: '3010',
  },
  'salary': {
    label: 'Salary',
    labelSv: 'Lön',
    icon: 'Users',
    color: 'blue',
    defaultAccountNumber: '7010',
  },
  'rent': {
    label: 'Rent',
    labelSv: 'Hyra',
    icon: 'Building2',
    color: 'purple',
    defaultAccountNumber: '5010',
  },
  'utilities': {
    label: 'Utilities',
    labelSv: 'El/Vatten/Värme',
    icon: 'Zap',
    color: 'yellow',
    defaultAccountNumber: '5310',
  },
  'subscriptions': {
    label: 'Subscriptions',
    labelSv: 'Prenumerationer',
    icon: 'RefreshCw',
    color: 'pink',
    defaultAccountNumber: '5420',
  },
  'office-supplies': {
    label: 'Office Supplies',
    labelSv: 'Kontorsmaterial',
    icon: 'Briefcase',
    color: 'orange',
    defaultAccountNumber: '6110',
  },
  'travel': {
    label: 'Travel',
    labelSv: 'Resor',
    icon: 'Plane',
    color: 'indigo',
    defaultAccountNumber: '5800',
  },
  'food-entertainment': {
    label: 'Food & Entertainment',
    labelSv: 'Mat & Representation',
    icon: 'UtensilsCrossed',
    color: 'amber',
    defaultAccountNumber: '5890',
  },
  'marketing': {
    label: 'Marketing',
    labelSv: 'Marknadsföring',
    icon: 'Megaphone',
    color: 'rose',
    defaultAccountNumber: '5910',
  },
  'professional-services': {
    label: 'Professional Services',
    labelSv: 'Konsulttjänster',
    icon: 'Briefcase',
    color: 'slate',
    defaultAccountNumber: '6530',
  },
  'insurance': {
    label: 'Insurance',
    labelSv: 'Försäkring',
    icon: 'Shield',
    color: 'emerald',
    defaultAccountNumber: '6310',
  },
  'tax': {
    label: 'Tax',
    labelSv: 'Skatt',
    icon: 'Receipt',
    color: 'red',
    defaultAccountNumber: '2510',
  },
  'bank-fees': {
    label: 'Bank Fees',
    labelSv: 'Bankavgifter',
    icon: 'CreditCard',
    color: 'gray',
    defaultAccountNumber: '6570',
  },
  'transfer': {
    label: 'Internal Transfer',
    labelSv: 'Intern överföring',
    icon: 'ArrowLeftRight',
    color: 'blue',
  },
  'other-expense': {
    label: 'Other Expense',
    labelSv: 'Övrig kostnad',
    icon: 'MinusCircle',
    color: 'gray',
    defaultAccountNumber: '6990',
  },
  'other-income': {
    label: 'Other Income',
    labelSv: 'Övrig intäkt',
    icon: 'PlusCircle',
    color: 'gray',
    defaultAccountNumber: '3990',
  },
  'uncategorized': {
    label: 'Uncategorized',
    labelSv: 'Ej kategoriserad',
    icon: 'HelpCircle',
    color: 'gray',
  },
}

// ============================================
// Bank Account Types
// ============================================

export type BankAccountType = 'foretagskonto' | 'sparkonto' | 'skattekonto'

export interface BankAccountInfo {
  type: BankAccountType
  label: string
  balance: number
  accountNumber: string // BAS-kontonummer
}

export const bankAccountMeta: Record<BankAccountType, {
  label: string
  description: string
  basAccountNumber: string
  icon: string
}> = {
  'foretagskonto': {
    label: 'Företagskonto',
    description: 'Huvudkonto för daglig verksamhet',
    basAccountNumber: '1930', // Företagskonto/Checkräkningskonto
    icon: 'CreditCard',
  },
  'sparkonto': {
    label: 'Sparkonto',
    description: 'Sparkonto för buffert',
    basAccountNumber: '1940', // Övriga bankkonton
    icon: 'Wallet',
  },
  'skattekonto': {
    label: 'Skattekonto',
    description: 'Skattekonto hos Skatteverket',
    basAccountNumber: '1630', // Skattekonto
    icon: 'Building2',
  },
}
