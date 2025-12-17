/**
 * Mock Invoices API - NAKED INVOICES with VISUAL DATA
 * 
 * Simulates invoice data - only raw invoice info + visual data
 */

import { NextRequest, NextResponse } from "next/server"
import type { NakedInvoice } from "@/services/invoice-processor"
import type { InvoiceDocumentData } from "@/types/documents"

// In-memory storage
const mockInvoices: Map<string, NakedInvoice & { visualData?: InvoiceDocumentData }> = new Map()

// ============================================================================
// Customer Templates
// ============================================================================

const CUSTOMER_TEMPLATES = [
  { name: "Acme AB", email: "faktura@acme.se", address: "Industrivägen 1, 123 45 Solna" },
  { name: "Tech Solutions Sweden", email: "accounting@techsolutions.se", address: "Sveavägen 44, 111 34 Stockholm" },
  { name: "Konsultbolaget i Stockholm", email: "ekonomi@konsultbolaget.se", address: "Götgatan 12, 118 46 Stockholm" },
  { name: "Nordic Digital AB", email: "invoice@nordicdigital.com", address: "Kungsportsavenyen 21, 411 36 Göteborg" },
  { name: "Startup Ventures", email: "finance@startupventures.se", address: "Fjällgatan 23, 116 28 Stockholm" },
  { name: "Media House Stockholm", email: "faktura@mediahouse.se", address: "Drottninggatan 55, 111 21 Stockholm" },
  { name: "E-commerce Solutions", email: "billing@ecommerce.se", address: "Stortorget 2, 211 22 Malmö" },
  { name: "Green Energy AB", email: "accounting@greenenergy.se", address: "Teknikringen 10, 583 30 Linköping" },
]

interface ServiceTemplate {
  description: string
  unit: string
}

const DESCRIPTIONS: ServiceTemplate[] = [
  { description: "Konsulttjänster Webbutveckling", unit: "tim" },
  { description: "Design och UX - Projekt Alpha", unit: "tim" },
  { description: "Projektledning Q3", unit: "tim" },
  { description: "Teknisk rådgivning och arkitektur", unit: "tim" },
  { description: "Löpande systemunderhåll", unit: "mån" },
  { description: "Månadsavgift Hosting Enterprise", unit: "st" },
  { description: "Användarlicenser Premium", unit: "st" },
  { description: "Workshop Digital Strategi", unit: "dag" },
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

function generateVisualData(
  invoiceId: string,
  customer: typeof CUSTOMER_TEMPLATES[0],
  issueDate: string,
  dueDate: string,
  totalAmount: number
): InvoiceDocumentData {
  // Generate logical line items
  const itemCount = Math.floor(Math.random() * 3) + 1;
  const lineItems = [];
  let currentTotal = 0;

  // 25% VAT for services
  const vatRate = 25;

  // We work backwards from total amount to generate items
  const totalAmountExVat = totalAmount / 1.25;

  for (let i = 0; i < itemCount - 1; i++) {
    // Random portion of the total
    const portion = (1 / itemCount) * (0.8 + Math.random() * 0.4);
    const itemAmountExVat = Math.round(totalAmountExVat * portion);

    // Calculate price and qty strictly
    const qty = Math.floor(Math.random() * 10) + 1;
    const price = Math.round(itemAmountExVat / qty);
    const actualItemAmount = price * qty;

    currentTotal += actualItemAmount;

    lineItems.push({
      description: DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)].description,
      quantity: qty,
      unitPrice: price,
      vatRate,
      amount: actualItemAmount
    });
  }

  // Last item to balance
  const remainingAmountExVat = Math.round(totalAmountExVat - currentTotal);
  const lastQty = Math.floor(Math.random() * 5) + 1;
  const lastPrice = Math.round(remainingAmountExVat / lastQty);

  lineItems.push({
    description: DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)].description,
    quantity: lastQty,
    unitPrice: lastPrice,
    vatRate,
    amount: lastQty * lastPrice
  });

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const vatAmount = subtotal * 0.25;
  const finalTotal = subtotal + vatAmount;

  return {
    type: 'invoice',
    companyName: "Scope AI AB",
    companyLogo: "https://ui-avatars.com/api/?name=Scope+AI&background=0ea5e9&color=fff&size=128&bold=true",
    companyAddress: "Sveavägen 1, 111 57 Stockholm",
    companyOrgNr: "559123-4567",
    companyEmail: "hello@scopeai.se",
    companyPhone: "08-123 45 67",

    invoiceNumber: invoiceId,
    invoiceDate: issueDate,
    dueDate: dueDate,

    customerName: customer.name,
    customerAddress: customer.address,

    lineItems,

    subtotal,
    vatAmount,
    total: finalTotal, // Use calculated to ensure math adds up

    paymentInfo: {
      bankgiro: "123-4567",
      ocrNumber: `OCR${invoiceId.replace(/-/g, '')}`,
    }
  };
}

function generateNakedInvoice(): NakedInvoice & { visualData?: InvoiceDocumentData } {
  const customer = CUSTOMER_TEMPLATES[Math.floor(Math.random() * CUSTOMER_TEMPLATES.length)]
  const issueDate = randomDate(14)
  const daysUntilDue = Math.floor(Math.random() * 30) + 10 // 10-40 days
  const dueDate = futureDate(daysUntilDue)
  const invoiceNumber = generateInvoiceNumber()

  // Base raw amount
  const rawAmount = randomAmount(5000, 150000)

  const visualData = generateVisualData(
    invoiceNumber,
    customer,
    issueDate,
    dueDate,
    rawAmount
  );

  return {
    id: generateId(),
    invoiceNumber,
    customerName: customer.name,
    customerEmail: customer.email,
    amount: visualData.total, // Ensure data consistency
    issueDate,
    dueDate,
    description: `${visualData.lineItems[0].description} - ${new Date(issueDate).toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })}`,
    visualData
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

    const newInvoices: (NakedInvoice & { visualData?: InvoiceDocumentData })[] = []
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
