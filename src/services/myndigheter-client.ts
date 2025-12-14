/**
 * Myndigheter API Client
 * 
 * Client-side service for submitting documents to the simulated
 * Skatteverket and Bolagsverket APIs.
 * 
 * Usage:
 *   import { submitToSkatteverket, submitToBolagsverket } from '@/services/myndigheter-client'
 *   
 *   const result = await submitToSkatteverket('agi', { period: 'December 2024', ... })
 *   if (result.success) { ... }
 */

// ============================================
// Types
// ============================================

export type SkatteverketDocumentType = 'agi' | 'moms' | 'k10' | 'inkomstdeklaration' | 'preliminarskatt'
export type BolagsverketDocumentType = 'arsredovisning' | 'andring-styrelse' | 'andring-kapital' | 'avregistrering'

export interface ValidationError {
  field: string
  code: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

export interface AIReviewResult {
  passed: boolean
  confidence: number
  errors: ValidationError[]
  warnings: ValidationError[]
  suggestions: string[]
  processingTime: number
}

export interface SkatteverketResponse {
  success: boolean
  submissionId: string
  referenceNumber: string
  status: 'accepted' | 'rejected' | 'needs-correction'
  message: string
  aiReview: AIReviewResult
  paymentInfo?: {
    amount: number
    dueDate: string
    bankgiro: string
    ocr: string
  }
  nextDeadline?: string
  error?: string
}

export interface BolagsverketResponse {
  success: boolean
  submissionId: string
  referenceNumber: string
  status: 'accepted' | 'rejected' | 'needs-correction' | 'pending-review'
  message: string
  aiReview: AIReviewResult
  estimatedProcessingDays: number
  fee?: {
    amount: number
    dueDate: string
    bankgiro: string
    ocr: string
  }
  error?: string
}

// ============================================
// Submission Storage (for viewing in simulator)
// ============================================

const SUBMISSIONS_KEY = 'myndigheter_submissions'

export interface StoredSubmission {
  id: string
  agency: 'skatteverket' | 'bolagsverket'
  documentType: string
  submittedAt: string
  data: Record<string, unknown>
  response: SkatteverketResponse | BolagsverketResponse
}

function storeSubmission(submission: StoredSubmission): void {
  if (typeof window === 'undefined') return
  
  const stored = localStorage.getItem(SUBMISSIONS_KEY)
  const submissions: StoredSubmission[] = stored ? JSON.parse(stored) : []
  submissions.unshift(submission)
  // Keep only last 50 submissions
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions.slice(0, 50)))
}

export function getStoredSubmissions(): StoredSubmission[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(SUBMISSIONS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function clearStoredSubmissions(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SUBMISSIONS_KEY)
}

// ============================================
// API Functions
// ============================================

/**
 * Submit a document to Skatteverket (simulated)
 * 
 * @param documentType - Type of document (agi, moms, k10, etc.)
 * @param data - Document data
 * @returns Promise with submission result
 * 
 * @example
 * const result = await submitToSkatteverket('agi', {
 *   period: 'December 2024',
 *   employees: 2,
 *   totalSalary: 85000,
 *   tax: 20400,
 *   contributions: 26690,
 * })
 */
export async function submitToSkatteverket(
  documentType: SkatteverketDocumentType,
  data: Record<string, unknown>
): Promise<SkatteverketResponse> {
  try {
    const response = await fetch('/api/simulator/skatteverket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentType, data }),
    })

    const result: SkatteverketResponse = await response.json()

    // Store for viewing in simulator
    storeSubmission({
      id: result.submissionId || `temp_${Date.now()}`,
      agency: 'skatteverket',
      documentType,
      submittedAt: new Date().toISOString(),
      data,
      response: result,
    })

    return result
  } catch (error) {
    console.error('Error submitting to Skatteverket:', error)
    return {
      success: false,
      submissionId: '',
      referenceNumber: '',
      status: 'rejected',
      message: 'Kunde inte ansluta till Skatteverket',
      aiReview: {
        passed: false,
        confidence: 0,
        errors: [{ field: 'network', code: 'NETWORK_ERROR', message: 'Nätverksfel', severity: 'error' }],
        warnings: [],
        suggestions: [],
        processingTime: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Submit a document to Bolagsverket (simulated)
 * 
 * @param documentType - Type of document (arsredovisning, andring-styrelse, etc.)
 * @param data - Document data
 * @returns Promise with submission result
 * 
 * @example
 * const result = await submitToBolagsverket('arsredovisning', {
 *   year: 2024,
 *   companyName: 'Min Firma AB',
 *   orgNumber: '5566778899',
 *   revenue: 2400000,
 *   expenses: 1800000,
 *   profit: 600000,
 *   assets: 1500000,
 *   liabilities: 500000,
 *   equity: 1000000,
 * })
 */
export async function submitToBolagsverket(
  documentType: BolagsverketDocumentType,
  data: Record<string, unknown>
): Promise<BolagsverketResponse> {
  try {
    const response = await fetch('/api/simulator/bolagsverket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentType, data }),
    })

    const result: BolagsverketResponse = await response.json()

    // Store for viewing in simulator
    storeSubmission({
      id: result.submissionId || `temp_${Date.now()}`,
      agency: 'bolagsverket',
      documentType,
      submittedAt: new Date().toISOString(),
      data,
      response: result,
    })

    return result
  } catch (error) {
    console.error('Error submitting to Bolagsverket:', error)
    return {
      success: false,
      submissionId: '',
      referenceNumber: '',
      status: 'rejected',
      message: 'Kunde inte ansluta till Bolagsverket',
      aiReview: {
        passed: false,
        confidence: 0,
        errors: [{ field: 'network', code: 'NETWORK_ERROR', message: 'Nätverksfel', severity: 'error' }],
        warnings: [],
        suggestions: [],
        processingTime: 0,
      },
      estimatedProcessingDays: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// Convenience helpers
// ============================================

/**
 * Helper to create AGI submission data from payroll data
 */
export function createAGIData(params: {
  period: string
  employees: number
  totalSalary: number
  tax: number
  contributions: number
}) {
  return {
    period: params.period,
    employees: params.employees,
    totalSalary: params.totalSalary,
    tax: params.tax,
    contributions: params.contributions,
  }
}

/**
 * Helper to create Moms submission data
 */
export function createMomsData(params: {
  period: string
  outputVat: number
  inputVat: number
  vatToPay: number
}) {
  return {
    period: params.period,
    outputVat: params.outputVat,
    inputVat: params.inputVat,
    vatToPay: params.vatToPay,
  }
}

/**
 * Helper to create Årsredovisning submission data
 */
export function createArsredovisningData(params: {
  year: number
  companyName: string
  orgNumber: string
  revenue: number
  expenses: number
  profit: number
  assets: number
  liabilities: number
  equity: number
}) {
  return { ...params }
}
