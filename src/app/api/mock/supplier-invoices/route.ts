/**
 * Mock Supplier Invoices API - NAKED
 */

import { NextRequest, NextResponse } from "next/server"
import type { NakedSupplierInvoice } from "@/services/invoice-processor"

import { mockDB } from "@/data/mock-db"

// Use shared DB instance
// const mockSupplierInvoices: Map<string, NakedSupplierInvoice> = new Map()

const SUPPLIER_TEMPLATES = [
  { name: "Kontorsleverantören AB", type: "office" },
  { name: "IT-Partner Sverige", type: "tech" },
  { name: "Städservice Stockholm", type: "service" },
  { name: "Reklambyra XYZ", type: "marketing" },
  { name: "Redovisningskonsulterna", type: "accounting" },
  { name: "Webbutvecklarna AB", type: "tech" },
  { name: "Transport & Logistik", type: "logistics" },
  { name: "Försäkringsbolaget", type: "insurance" },
]

function generateId(): string {
  return `sinv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function generateInvoiceNumber(): string {
  return `F${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

function randomDate(daysBack: number = 30): string {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * daysBack)
  return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
}

function futureDate(daysAhead: number = 30): string {
  const now = new Date()
  return new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
}

function generateNakedSupplierInvoice(): NakedSupplierInvoice {
  const supplier = SUPPLIER_TEMPLATES[Math.floor(Math.random() * SUPPLIER_TEMPLATES.length)]
  const issueDate = randomDate(14)
  const daysUntilDue = Math.floor(Math.random() * 25) + 5

  return {
    id: generateId(),
    invoiceNumber: generateInvoiceNumber(),
    supplierName: supplier.name,
    amount: randomAmount(2000, 80000),
    issueDate,
    dueDate: futureDate(daysUntilDue),
    description: `Faktura från ${supplier.name}`,
    ocrNumber: Math.random() > 0.3 ? `${Math.floor(Math.random() * 900000000) + 100000000}` : undefined,
  }
}

export async function GET() {
  try {
    const invoices = Array.from(mockDB.supplierInvoices.values())
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())

    return NextResponse.json({
      invoices,
      count: invoices.length,
      type: "naked"
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { count = 1 } = body

    const newInvoices: NakedSupplierInvoice[] = []
    for (let i = 0; i < count; i++) {
      const naked = generateNakedSupplierInvoice()
      mockDB.supplierInvoices.set(naked.id, naked)
      newInvoices.push(naked)
    }

    return NextResponse.json({ invoices: newInvoices, stored: true, type: "naked" })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE() {
  const count = mockDB.supplierInvoices.size
  mockDB.supplierInvoices.clear()
  return NextResponse.json({ message: `Deleted ${count}` })
}
