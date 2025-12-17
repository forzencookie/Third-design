/**
 * Processed Receipts API
 * 
 * GET: Fetches receipts from mockDB
 * POST: Saves a new receipt to mockDB
 */

import { NextRequest, NextResponse } from "next/server"
import { mockDB } from "@/data/mock-db"
import { randomUUID } from "crypto"

export async function GET() {
  try {
    // Return receipts from mockDB
    const receipts = mockDB.receipts || []

    return NextResponse.json({
      receipts,
      count: receipts.length,
      type: "processed"
    })

  } catch (error) {
    console.error('Error fetching receipts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch receipts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newReceipt = {
      id: body.id || `REC-${randomUUID().slice(0, 8)}`,
      supplier: body.supplier,
      date: body.date,
      amount: body.amount,
      moms: body.moms || null,
      category: body.category,
      status: body.status || 'pending',
      attachment: body.attachment || null,
      createdAt: new Date().toISOString()
    }

    // Add to mockDB
    mockDB.receipts = [newReceipt, ...(mockDB.receipts || [])]

    console.log(`[Receipts API] Created receipt: ${newReceipt.id} for ${newReceipt.supplier}`)

    return NextResponse.json({
      success: true,
      receipt: newReceipt
    })

  } catch (error) {
    console.error('Error saving receipt:', error)
    return NextResponse.json(
      { error: 'Failed to save receipt' },
      { status: 500 }
    )
  }
}
