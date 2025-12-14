/**
 * Processed Receipts API
 * 
 * Fetches NAKED receipts from mock API and processes them
 */

import { NextResponse } from "next/server"
import { 
  processReceipts, 
  type NakedReceipt 
} from "@/services/receipt-processor"

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/mock/receipts`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch from mock API')
    }
    
    const data = await response.json()
    const nakedReceipts: NakedReceipt[] = data.receipts || []
    
    const processedReceipts = processReceipts(nakedReceipts)
    
    return NextResponse.json({
      receipts: processedReceipts,
      count: processedReceipts.length,
      type: "processed"
    })
    
  } catch (error) {
    console.error('Error processing receipts:', error)
    return NextResponse.json(
      { error: 'Failed to process receipts' },
      { status: 500 }
    )
  }
}
