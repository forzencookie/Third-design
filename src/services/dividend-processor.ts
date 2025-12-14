/**
 * Dividend Processor Service
 * 
 * Takes NAKED dividend/utdelning data and "clothes" them:
 * - Dividend history
 * - K10 declarations
 * - 3:12 calculations
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Raw dividend data - "naked"
 */
export interface NakedDividend {
  id: string
  year: string
  amount: number
  taxRate: number          // 0.20 = 20%
  status: 'planned' | 'paid'
  paymentDate?: string
}

/**
 * Raw K10 declaration - "naked"
 */
export interface NakedK10Declaration {
  id: string
  year: string
  status: 'draft' | 'submitted'
  deadline: string
  gransbelopp: number      // Threshold amount
  usedAmount: number       // Amount used this year
}

// ============================================================================
// Processed Types
// ============================================================================

export interface ProcessedDividend {
  year: string
  amount: number
  taxRate: string
  tax: number
  netAmount: number
  status: 'Planerad' | 'Utbetald'
}

export interface ProcessedK10Declaration {
  year: string
  status: 'Utkast' | 'Inskickad'
  deadline: string
  gransbelopp: number
  usedAmount: number
  savedAmount: number
}

// ============================================================================
// Status Mappings
// ============================================================================

const DIVIDEND_STATUS_MAP: Record<NakedDividend['status'], ProcessedDividend['status']> = {
  planned: 'Planerad',
  paid: 'Utbetald',
}

const K10_STATUS_MAP: Record<NakedK10Declaration['status'], ProcessedK10Declaration['status']> = {
  draft: 'Utkast',
  submitted: 'Inskickad',
}

// ============================================================================
// Processors
// ============================================================================

export function processDividend(naked: NakedDividend): ProcessedDividend {
  const tax = Math.round(naked.amount * naked.taxRate)
  const netAmount = naked.amount - tax
  
  return {
    year: naked.year,
    amount: naked.amount,
    taxRate: `${Math.round(naked.taxRate * 100)}%`,
    tax,
    netAmount,
    status: DIVIDEND_STATUS_MAP[naked.status],
  }
}

export function processK10Declaration(naked: NakedK10Declaration): ProcessedK10Declaration {
  return {
    year: naked.year,
    status: K10_STATUS_MAP[naked.status],
    deadline: naked.deadline,
    gransbelopp: naked.gransbelopp,
    usedAmount: naked.usedAmount,
    savedAmount: naked.gransbelopp - naked.usedAmount,
  }
}

export function processDividends(naked: NakedDividend[]): ProcessedDividend[] {
  return naked.map(processDividend)
}

export function processK10Declarations(naked: NakedK10Declaration[]): ProcessedK10Declaration[] {
  return naked.map(processK10Declaration)
}

// ============================================================================
// Mock Data Generators
// ============================================================================

export function generateMockDividends(): ProcessedDividend[] {
  const mockNaked: NakedDividend[] = [
    { id: "d-1", year: "2024", amount: 150000, taxRate: 0.20, status: "planned" },
    { id: "d-2", year: "2023", amount: 120000, taxRate: 0.20, status: "paid" },
    { id: "d-3", year: "2022", amount: 100000, taxRate: 0.20, status: "paid" },
    { id: "d-4", year: "2021", amount: 95000, taxRate: 0.20, status: "paid" },
    { id: "d-5", year: "2020", amount: 80000, taxRate: 0.20, status: "paid" },
    { id: "d-6", year: "2019", amount: 75000, taxRate: 0.20, status: "paid" },
    { id: "d-7", year: "2018", amount: 60000, taxRate: 0.20, status: "paid" },
  ]
  return processDividends(mockNaked)
}

export function generateMockK10Declarations(): ProcessedK10Declaration[] {
  const mockNaked: NakedK10Declaration[] = [
    { id: "k10-1", year: "2024", status: "draft", deadline: "2025-05-02", gransbelopp: 195250, usedAmount: 150000 },
    { id: "k10-2", year: "2023", status: "submitted", deadline: "2024-05-02", gransbelopp: 187550, usedAmount: 120000 },
    { id: "k10-3", year: "2022", status: "submitted", deadline: "2023-05-02", gransbelopp: 177100, usedAmount: 100000 },
  ]
  return processK10Declarations(mockNaked)
}
