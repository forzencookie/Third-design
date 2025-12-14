/**
 * Processed Supplier Invoices API
 */

import { NextResponse } from "next/server"
import { processSupplierInvoices, type NakedSupplierInvoice } from "@/services/invoice-processor"

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/mock/supplier-invoices`, { cache: 'no-store' })

    if (!response.ok) throw new Error('Failed to fetch')

    const data = await response.json()
    const nakedInvoices: NakedSupplierInvoice[] = data.invoices || []
    const processedInvoices = processSupplierInvoices(nakedInvoices)

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
