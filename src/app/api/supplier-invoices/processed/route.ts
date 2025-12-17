/**
 * Processed Supplier Invoices API
 */

import { NextResponse } from "next/server"
import { processSupplierInvoices, type NakedSupplierInvoice } from "@/services/invoice-processor"
import { db } from "@/lib/server-db"

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Fetch mocks
    let nakedInvoices: NakedSupplierInvoice[] = []
    try {
      const response = await fetch(`${baseUrl}/api/mock/supplier-invoices`, { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        nakedInvoices = data.invoices || []
      }
    } catch (e) {
      console.warn("Mock fetch failed", e)
    }

    // Fetch DB invoices
    const dbData = await db.get()
    const dbInvoices = dbData.supplierInvoices || []

    // Merge: Prefer DB versions if ID matches.
    const dbIds = new Set(dbInvoices.map((i: any) => i.id))
    const uniqueMocks = nakedInvoices.filter(i => !dbIds.has(i.id))

    // Cast to NakedSupplierInvoice (assuming DB stores compatible structure)
    const allNaked = [...dbInvoices, ...uniqueMocks] as NakedSupplierInvoice[]

    const processedInvoices = processSupplierInvoices(allNaked)

    return NextResponse.json({
      invoices: processedInvoices,
      count: processedInvoices.length,
      type: "processed"
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
