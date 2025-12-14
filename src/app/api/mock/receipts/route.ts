/**
 * Mock Receipts API - NAKED RECEIPTS
 * 
 * Simulates OCR/scan data from receipt uploads
 * Only returns raw extracted data - no categories or AI
 */

import { NextRequest, NextResponse } from "next/server"
import type { NakedReceipt } from "@/services/receipt-processor"

// In-memory storage
const mockReceipts: Map<string, NakedReceipt> = new Map()

// ============================================================================
// Naked Receipt Templates - Only raw OCR-like data
// ============================================================================

interface ReceiptTemplate {
  vendor: string
  amountRange: [number, number]
}

const RECEIPT_TEMPLATES: Record<string, ReceiptTemplate[]> = {
  restaurant: [
    { vendor: "ESPRESSO HOUSE AB", amountRange: [45, 150] },
    { vendor: "MAX BURGERS", amountRange: [89, 220] },
    { vendor: "VAPIANO SWEDEN", amountRange: [120, 350] },
    { vendor: "BASTARD BURGERS", amountRange: [130, 280] },
    { vendor: "STARBUCKS", amountRange: [55, 120] },
    { vendor: "WAYNES COFFEE", amountRange: [45, 100] },
  ],
  office: [
    { vendor: "STAPLES SWEDEN AB", amountRange: [200, 2500] },
    { vendor: "CLAS OHLSON AB", amountRange: [100, 1800] },
    { vendor: "IKEA AB", amountRange: [500, 8000] },
    { vendor: "MEDIA MARKT", amountRange: [1000, 15000] },
    { vendor: "ELGIGANTEN AB", amountRange: [800, 12000] },
  ],
  travel: [
    { vendor: "SAS SCANDINAVIAN", amountRange: [1500, 8500] },
    { vendor: "SJ AB", amountRange: [200, 1500] },
    { vendor: "SCANDIC HOTELS", amountRange: [1200, 2800] },
    { vendor: "CIRCLE K BENSIN", amountRange: [400, 1200] },
    { vendor: "PREEM AB", amountRange: [350, 1100] },
    { vendor: "UBER *TRIP", amountRange: [89, 450] },
  ],
  subscription: [
    { vendor: "SPOTIFY AB", amountRange: [129, 169] },
    { vendor: "ADOBE SYSTEMS", amountRange: [149, 599] },
    { vendor: "MICROSOFT IRELAND", amountRange: [100, 450] },
    { vendor: "GOOGLE *CLOUD", amountRange: [150, 500] },
    { vendor: "FIGMA INC", amountRange: [139, 449] },
  ],
  utility: [
    { vendor: "TELIA COMPANY", amountRange: [299, 899] },
    { vendor: "VATTENFALL AB", amountRange: [500, 2500] },
    { vendor: "IF SKADEFÖRSÄKRING", amountRange: [800, 3500] },
    { vendor: "TELENOR SVERIGE", amountRange: [249, 599] },
  ],
}

type ReceiptType = keyof typeof RECEIPT_TEMPLATES

// ============================================================================
// Helpers
// ============================================================================

function generateId(): string {
  return `rcpt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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

function generateNakedReceipt(type: ReceiptType): NakedReceipt {
  const templates = RECEIPT_TEMPLATES[type]
  const template = templates[Math.floor(Math.random() * templates.length)]
  
  return {
    id: generateId(),
    vendor: template.vendor,
    amount: randomAmount(template.amountRange[0], template.amountRange[1]),
    date: randomDate(14),
    imageUrl: `https://placehold.co/400x600/f5f5f5/666?text=${encodeURIComponent(template.vendor)}`,
  }
}

// ============================================================================
// API Handlers
// ============================================================================

/**
 * GET /api/mock/receipts
 * Returns all NAKED receipts
 */
export async function GET() {
  try {
    const receipts = Array.from(mockReceipts.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 100)

    return NextResponse.json({ 
      receipts, 
      count: receipts.length,
      type: "naked",
      note: "Process with receipt-processor service to add display properties"
    })
  } catch (error) {
    console.error('Error fetching receipts:', error)
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 })
  }
}

/**
 * POST /api/mock/receipts
 * Create a new NAKED receipt
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type = 'office' } = body

    const naked = generateNakedReceipt(type as ReceiptType)
    mockReceipts.set(naked.id, naked)

    return NextResponse.json({ 
      receipt: naked,
      stored: true,
      type: "naked",
      message: "Raw receipt created - use receipt-processor to add display properties"
    })
  } catch (error) {
    console.error('Error creating receipt:', error)
    return NextResponse.json({ error: 'Failed to create receipt' }, { status: 500 })
  }
}

/**
 * DELETE /api/mock/receipts
 */
export async function DELETE() {
  try {
    const count = mockReceipts.size
    mockReceipts.clear()
    return NextResponse.json({ message: `Deleted ${count} mock receipts` })
  } catch (error) {
    console.error('Error deleting receipts:', error)
    return NextResponse.json({ error: 'Failed to delete receipts' }, { status: 500 })
  }
}
