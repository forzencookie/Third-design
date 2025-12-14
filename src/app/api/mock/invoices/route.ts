/**
 * Mock Invoices API - NAKED INVOICES
 * 
 * Simulates invoice data - only raw invoice info
 */

import { NextRequest, NextResponse } from "next/server"
import type { NakedInvoice } from "@/services/invoice-processor"

// In-memory storage
const mockInvoices: Map<string, NakedInvoice> = new Map()

// ============================================================================
// Customer Templates
// ============================================================================

const CUSTOMER_TEMPLATES = [
  { name: "Acme AB", email: "faktura@acme.se" },
  { name: "Tech Solutions Sweden", email: "accounting@techsolutions.se" },
  { name: "Konsultbolaget i Stockholm", email: "ekonomi@konsultbolaget.se" },
  { name: "Nordic Digital AB", email: "invoice@nordicdigital.com" },
  { name: "Startup Ventures", email: "finance@startupventures.se" },
  { name: "Media House Stockholm", email: "faktura@mediahouse.se" },
  { name: "E-commerce Solutions", email: "billing@ecommerce.se" },
  { name: "Green Energy AB", email: "accounting@greenenergy.se" },
]

const DESCRIPTIONS = [
  "Konsulttjänster",
  "Webbutveckling",
  "Design och UX",
  "Projektledning",
  "Teknisk rådgivning",
  "Systemutveckling",
  "Digital strategi",
  "Underhåll och support",
]

// ============================================================================
// Helpers
// ============================================================================

function generateId(): string {
  return `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const num = Math.floor(Math.random() * 900) + 100
  return `${year}-${num}`
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

function randomDate(daysBack: number = 30): string {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * daysBack)
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  return date.toISOString().split('T')[0]
}

function futureDate(daysAhead: number = 30): string {
  const now = new Date()
  const date = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
  return date.toISOString().split('T')[0]
}

function generateNakedInvoice(): NakedInvoice {
  const customer = CUSTOMER_TEMPLATES[Math.floor(Math.random() * CUSTOMER_TEMPLATES.length)]
  const description = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)]
  const issueDate = randomDate(14)
  const daysUntilDue = Math.floor(Math.random() * 30) + 10 // 10-40 days
  
  return {
    id: generateId(),
    invoiceNumber: generateInvoiceNumber(),
    customerName: customer.name,
    customerEmail: customer.email,
    amount: randomAmount(5000, 150000),
    issueDate,
    dueDate: futureDate(daysUntilDue),
    description: `${description} - ${new Date(issueDate).toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}`,
  }
}

// ============================================================================
// API Handlers
// ============================================================================

export async function GET() {
  try {
    const invoices = Array.from(mockInvoices.values())
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
      .slice(0, 100)

    return NextResponse.json({ 
      invoices, 
      count: invoices.length,
      type: "naked"
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { count = 1 } = body

    const newInvoices: NakedInvoice[] = []
    for (let i = 0; i < count; i++) {
      const naked = generateNakedInvoice()
      mockInvoices.set(naked.id, naked)
      newInvoices.push(naked)
    }

    return NextResponse.json({ 
      invoices: newInvoices,
      stored: true,
      type: "naked"
    })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const count = mockInvoices.size
    mockInvoices.clear()
    return NextResponse.json({ message: `Deleted ${count} mock invoices` })
  } catch (error) {
    console.error('Error deleting invoices:', error)
    return NextResponse.json({ error: 'Failed to delete invoices' }, { status: 500 })
  }
}
