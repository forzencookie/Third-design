/**
 * Bolagsverket Simulator API
 * 
 * This endpoint receives documents from the app (Årsredovisning, board changes, etc.)
 * and simulates Bolagsverket's response with AI validation.
 * 
 * POST /api/simulator/bolagsverket
 * 
 * Body: {
 *   documentType: 'arsredovisning' | 'andring-styrelse' | 'andring-kapital' | 'avregistrering'
 *   data: { ... document data ... }
 * }
 */

import { NextRequest, NextResponse } from "next/server"

// Types
type DocumentType = 'arsredovisning' | 'andring-styrelse' | 'andring-kapital' | 'avregistrering'

interface ValidationError {
  field: string
  code: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

interface AIReviewResult {
  passed: boolean
  confidence: number
  errors: ValidationError[]
  warnings: ValidationError[]
  suggestions: string[]
  processingTime: number
}

interface SubmissionResponse {
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
}

// Document configurations
const DOCUMENT_CONFIGS: Record<DocumentType, {
  name: string
  requiredFields: string[]
  fee: number
  processingDays: { min: number, max: number }
}> = {
  arsredovisning: {
    name: 'Årsredovisning',
    requiredFields: ['year', 'companyName', 'orgNumber', 'revenue', 'expenses', 'profit', 'assets', 'liabilities', 'equity'],
    fee: 0, // Free if submitted digitally
    processingDays: { min: 5, max: 14 },
  },
  'andring-styrelse': {
    name: 'Ändring av styrelse',
    requiredFields: ['companyName', 'orgNumber', 'changes', 'effectiveDate'],
    fee: 1100,
    processingDays: { min: 3, max: 10 },
  },
  'andring-kapital': {
    name: 'Ändring av aktiekapital',
    requiredFields: ['companyName', 'orgNumber', 'currentCapital', 'newCapital', 'reason'],
    fee: 2200,
    processingDays: { min: 7, max: 21 },
  },
  avregistrering: {
    name: 'Avregistrering av bolag',
    requiredFields: ['companyName', 'orgNumber', 'reason', 'finalDate'],
    fee: 0,
    processingDays: { min: 14, max: 60 },
  },
}

// AI Validation functions
function validateArsredovisning(data: Record<string, unknown>): AIReviewResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const suggestions: string[] = []

  // Check required fields
  const requiredFields = ['year', 'companyName', 'orgNumber', 'revenue', 'profit', 'assets', 'liabilities', 'equity']
  for (const field of requiredFields) {
    if (!data[field] && data[field] !== 0) {
      errors.push({ field, code: 'MISSING_FIELD', message: `${field} saknas`, severity: 'error' })
    }
  }

  const assets = Number(data.assets) || 0
  const liabilities = Number(data.liabilities) || 0
  const equity = Number(data.equity) || 0
  const revenue = Number(data.revenue) || 0
  const expenses = Number(data.expenses) || 0
  const profit = Number(data.profit) || 0

  // Validate balance sheet equation: Assets = Liabilities + Equity
  const expectedAssets = liabilities + equity
  if (assets > 0 && Math.abs(assets - expectedAssets) > 1) {
    errors.push({
      field: 'assets',
      code: 'BALANCE_SHEET_ERROR',
      message: `Balansräkning stämmer inte: Tillgångar (${assets.toLocaleString('sv-SE')}) ≠ Skulder (${liabilities.toLocaleString('sv-SE')}) + Eget kapital (${equity.toLocaleString('sv-SE')})`,
      severity: 'error'
    })
  }

  // Validate profit calculation
  const expectedProfit = revenue - expenses
  if (profit !== 0 && Math.abs(profit - expectedProfit) > 1) {
    warnings.push({
      field: 'profit',
      code: 'PROFIT_MISMATCH',
      message: `Resultat (${profit.toLocaleString('sv-SE')}) matchar inte intäkter - kostnader (${expectedProfit.toLocaleString('sv-SE')})`,
      severity: 'warning'
    })
  }

  // Check for negative equity (going concern issue)
  if (equity < 0) {
    warnings.push({
      field: 'equity',
      code: 'NEGATIVE_EQUITY',
      message: 'Negativt eget kapital - kontrollplikt kan gälla',
      severity: 'warning'
    })
    suggestions.push('Vid negativt eget kapital måste styrelsen upprätta kontrollbalansräkning')
  }

  // Validate org number format (10 digits)
  const orgNumber = String(data.orgNumber || '').replace(/\D/g, '')
  if (orgNumber.length !== 10) {
    errors.push({
      field: 'orgNumber',
      code: 'INVALID_ORG_NUMBER',
      message: 'Organisationsnummer måste vara 10 siffror',
      severity: 'error'
    })
  }

  const passed = errors.length === 0
  const confidence = Math.max(0.5, 1 - (errors.length * 0.2) - (warnings.length * 0.05))

  return { passed, confidence, errors, warnings, suggestions, processingTime: Math.random() * 2000 + 1000 }
}

function validateStyrelseandring(data: Record<string, unknown>): AIReviewResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const suggestions: string[] = []

  if (!data.changes || (Array.isArray(data.changes) && data.changes.length === 0)) {
    errors.push({ field: 'changes', code: 'NO_CHANGES', message: 'Inga ändringar angivna', severity: 'error' })
  }

  if (!data.effectiveDate) {
    errors.push({ field: 'effectiveDate', code: 'MISSING_DATE', message: 'Datum för ändring saknas', severity: 'error' })
  } else {
    const effectiveDate = new Date(data.effectiveDate as string)
    const now = new Date()
    const daysDiff = (now.getTime() - effectiveDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysDiff > 14) {
      warnings.push({
        field: 'effectiveDate',
        code: 'LATE_REGISTRATION',
        message: 'Anmälan bör göras inom 14 dagar från ändringsdatum',
        severity: 'warning'
      })
    }
  }

  // Validate org number
  const orgNumber = String(data.orgNumber || '').replace(/\D/g, '')
  if (orgNumber.length !== 10) {
    errors.push({ field: 'orgNumber', code: 'INVALID_ORG_NUMBER', message: 'Organisationsnummer måste vara 10 siffror', severity: 'error' })
  }

  const passed = errors.length === 0
  const confidence = Math.max(0.5, 1 - (errors.length * 0.2) - (warnings.length * 0.05))

  return { passed, confidence, errors, warnings, suggestions, processingTime: Math.random() * 1500 + 500 }
}

function validateKapitalandring(data: Record<string, unknown>): AIReviewResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const suggestions: string[] = []

  const currentCapital = Number(data.currentCapital) || 0
  const newCapital = Number(data.newCapital) || 0

  if (currentCapital <= 0) {
    errors.push({ field: 'currentCapital', code: 'INVALID_CURRENT', message: 'Nuvarande aktiekapital måste anges', severity: 'error' })
  }

  if (newCapital <= 0) {
    errors.push({ field: 'newCapital', code: 'INVALID_NEW', message: 'Nytt aktiekapital måste anges', severity: 'error' })
  }

  // Minimum capital for AB is 25,000 SEK
  if (newCapital > 0 && newCapital < 25000) {
    errors.push({
      field: 'newCapital',
      code: 'BELOW_MINIMUM',
      message: 'Aktiekapital får inte understiga 25 000 kr för aktiebolag',
      severity: 'error'
    })
  }

  if (!data.reason) {
    errors.push({ field: 'reason', code: 'MISSING_REASON', message: 'Orsak till kapitaländring saknas', severity: 'error' })
  }

  // Validate org number
  const orgNumber = String(data.orgNumber || '').replace(/\D/g, '')
  if (orgNumber.length !== 10) {
    errors.push({ field: 'orgNumber', code: 'INVALID_ORG_NUMBER', message: 'Organisationsnummer måste vara 10 siffror', severity: 'error' })
  }

  const passed = errors.length === 0
  const confidence = Math.max(0.5, 1 - (errors.length * 0.2) - (warnings.length * 0.05))

  return { passed, confidence, errors, warnings, suggestions, processingTime: Math.random() * 1500 + 500 }
}

function validateGeneric(data: Record<string, unknown>, requiredFields: string[]): AIReviewResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const suggestions: string[] = []

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push({
        field,
        code: 'MISSING_FIELD',
        message: `Fältet "${field}" saknas eller är tomt`,
        severity: 'error'
      })
    }
  }

  const passed = errors.length === 0
  const confidence = Math.max(0.5, 1 - (errors.length * 0.2))

  return { passed, confidence, errors, warnings, suggestions, processingTime: Math.random() * 1000 + 500 }
}

function runAIValidation(documentType: DocumentType, data: Record<string, unknown>): AIReviewResult {
  switch (documentType) {
    case 'arsredovisning':
      return validateArsredovisning(data)
    case 'andring-styrelse':
      return validateStyrelseandring(data)
    case 'andring-kapital':
      return validateKapitalandring(data)
    default:
      const config = DOCUMENT_CONFIGS[documentType]
      return validateGeneric(data, config?.requiredFields || [])
  }
}

// Helper functions
function generateReferenceNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `BV-${date}-${random}`
}

function generateOCR(): string {
  return Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')
}

function getPaymentDueDate(): string {
  const now = new Date()
  const dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30)
  return dueDate.toISOString().slice(0, 10)
}

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentType, data } = body

    // Validate document type
    if (!documentType || !DOCUMENT_CONFIGS[documentType as DocumentType]) {
      return NextResponse.json({
        success: false,
        error: 'Invalid document type',
        validTypes: Object.keys(DOCUMENT_CONFIGS),
      }, { status: 400 })
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid data object',
      }, { status: 400 })
    }

    const config = DOCUMENT_CONFIGS[documentType as DocumentType]

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    // Run AI validation
    const aiReview = runAIValidation(documentType as DocumentType, data)

    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const referenceNumber = generateReferenceNumber()
    const processingDays = config.processingDays.min + Math.floor(Math.random() * (config.processingDays.max - config.processingDays.min))

    // Build response
    const response: SubmissionResponse = {
      success: aiReview.passed,
      submissionId,
      referenceNumber,
      status: aiReview.passed ? 'pending-review' : (aiReview.errors.length > 0 ? 'rejected' : 'needs-correction'),
      message: aiReview.passed 
        ? `Din ${config.name} har mottagits och kommer att behandlas inom ${processingDays} arbetsdagar.`
        : `Din ${config.name} innehåller fel som måste korrigeras innan den kan behandlas.`,
      aiReview,
      estimatedProcessingDays: processingDays,
      fee: config.fee > 0 ? {
        amount: config.fee,
        dueDate: getPaymentDueDate(),
        bankgiro: '5050-0128',
        ocr: generateOCR(),
      } : undefined,
    }
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('Bolagsverket simulator error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}

// GET handler to check API status
export async function GET() {
  return NextResponse.json({
    service: 'Bolagsverket Simulator',
    status: 'online',
    supportedDocuments: Object.entries(DOCUMENT_CONFIGS).map(([type, config]) => ({
      type,
      name: config.name,
      requiredFields: config.requiredFields,
      fee: config.fee,
      processingDays: config.processingDays,
    })),
    usage: {
      method: 'POST',
      body: {
        documentType: 'arsredovisning | andring-styrelse | andring-kapital | avregistrering',
        data: '{ ... document fields ... }'
      }
    }
  })
}
