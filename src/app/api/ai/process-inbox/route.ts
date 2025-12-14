/**
 * AI Engine - Process Inbox Items
 * 
 * This endpoint scans unprocessed inbox items, analyzes them with OpenAI,
 * and creates corresponding entries in Invoices or Receipts.
 * The original inbox item is NOT deleted - it's linked to the created entity.
 */

import { NextResponse } from 'next/server'
import { mockDB } from '@/data/mock-db'
import type { InboxItem } from '@/types'
import { extractInvoiceDataWithGPT } from '@/services/invoice-ocr'

// Keywords for detecting PAID items (receipts)
const PAID_KEYWORDS = ['kvitto', 'betalad', 'kort', 'autogiro', 'dragits', 'betalt']

function extractAmount(text: string): number {
    const match = text.match(/(\d+[\d\s]*)(?:kr|SEK|\$|€)/i)
    return match ? parseFloat(match[1].replace(/\s/g, '')) : 1250
}

function isPaidDocument(item: InboxItem): boolean {
    const text = (item.title + ' ' + item.description).toLowerCase()
    return PAID_KEYWORDS.some(keyword => text.includes(keyword))
}

async function processInboxItem(item: InboxItem): Promise<{ entityId: string, entityType: 'supplier-invoice' | 'receipt' } | null> {
    // Skip if already processed
    if (item.aiStatus === 'processed') return null

    // AI reads the raw text content (simulating OCR)
    console.log(`[AI] Processing email from ${item.sender}: "${item.title}"`)

    // Use GPT to extract ALL invoice information from text
    const extractedData = await extractInvoiceDataWithGPT(item)

    if (!extractedData) {
        console.log(`[AI] Could not extract invoice data`)
        return null
    }

    console.log(`[AI] Extracted:`, extractedData)

    // Determine if already paid (receipt) or needs payment (invoice)
    if (extractedData.isPaid) {
        // RECEIPT - route to Kvitton
        console.log(`[AI] Detected as RECEIPT (already paid)`)
        const receiptId = `rcpt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        const receipt = {
            id: receiptId,
            supplier: extractedData.supplier,
            date: extractedData.date,
            amount: extractedData.amount.toString(),
            status: 'completed',
            category: extractedData.accountingCategory,
            attachment: 'email.pdf',
            sourceInboxId: item.id
        }
        mockDB.receipts = [receipt, ...mockDB.receipts]

        item.category = 'faktura'
        item.aiSuggestion = `✨ Kvitto - ${extractedData.note}`

        return { entityId: receiptId, entityType: 'receipt' }
    } else {
        // INVOICE - route to Leverantörsfakturor
        console.log(`[AI] Detected as INVOICE (needs payment)`)
        const invoiceId = `sinv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        mockDB.supplierInvoices.set(invoiceId, {
            id: invoiceId,
            invoiceNumber: extractedData.invoiceNumber || `AUTO-${Date.now()}`,
            supplierName: extractedData.supplier,
            amount: extractedData.amount,
            issueDate: extractedData.date,
            dueDate: extractedData.dueDate || extractedData.date,
            description: `${item.title} - ${extractedData.note}`,
            ocrNumber: extractedData.ocrNumber || `OCR-${Math.floor(Math.random() * 999999999)}`,
            accountingCode: extractedData.accountingCode,
            category: extractedData.accountingCategory,
        } as any)

        item.category = 'faktura'
        item.aiSuggestion = `✨ Faktura - ${extractedData.note}`

        return { entityId: invoiceId, entityType: 'supplier-invoice' }
    }
}

export async function POST() {
    try {
        console.log('[AI] Starting processing, inbox items:', mockDB.inboxItems.length)
        const results: { itemId: string, entityId: string, entityType: string }[] = []
        const errors: { itemId: string, error: string }[] = []

        // Find all pending items
        const pendingItems = mockDB.inboxItems.filter(
            item => item.aiStatus === 'pending' || !item.aiStatus
        )

        console.log(`[AI] Found ${pendingItems.length} pending items to process`)

        if (pendingItems.length === 0) {
            return NextResponse.json({
                success: true,
                processed: 0,
                results: [],
                errors: []
            })
        }

        // Batch process with concurrency limit (5 at a time)
        const BATCH_SIZE = 5
        const batches: InboxItem[][] = []

        for (let i = 0; i < pendingItems.length; i += BATCH_SIZE) {
            batches.push(pendingItems.slice(i, i + BATCH_SIZE))
        }

        console.log(`[AI] Processing ${pendingItems.length} items in ${batches.length} batches of ${BATCH_SIZE}`)

        // Process each batch in parallel
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex]
            console.log(`[AI] Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} items)`)

            // Process all items in this batch simultaneously
            const batchPromises = batch.map(async (item) => {
                try {
                    console.log(`[AI] Item ${item.id}: status=${item.aiStatus}, category=${item.category}, hasDocData=${!!item.documentData}`)

                    item.aiStatus = 'processing'
                    const result = await processInboxItem(item)

                    if (result) {
                        item.aiStatus = 'processed'
                        item.linkedEntityId = result.entityId
                        item.linkedEntityType = result.entityType
                        item.aiSuggestion = result.entityType === 'receipt'
                            ? '✨ Auto-registerad som kvitto'
                            : '✨ Auto-registerad som leverantörsfaktura'

                        results.push({
                            itemId: item.id,
                            entityId: result.entityId,
                            entityType: result.entityType
                        })

                        console.log(`[AI] ✓ Successfully processed ${item.id}`)
                    } else if (item.category !== 'faktura') {
                        // Non-invoice items are "processed" but don't create entities
                        item.aiStatus = 'processed'
                        console.log(`[AI] ⊘ Skipped non-invoice item ${item.id}`)
                    }
                } catch (error) {
                    // Mark as error but don't stop processing other items
                    item.aiStatus = 'error'
                    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
                    errors.push({ itemId: item.id, error: errorMsg })
                    console.error(`[AI] ✗ Error processing ${item.id}:`, errorMsg)
                }
            })

            // Wait for all items in this batch to complete
            await Promise.all(batchPromises)

            console.log(`[AI] Batch ${batchIndex + 1}/${batches.length} complete`)
        }

        console.log('[AI] All batches completed. Processed:', results.length, 'Errors:', errors.length)
        console.log('[AI] Supplier invoices count:', mockDB.supplierInvoices.size)

        return NextResponse.json({
            success: true,
            processed: results.length,
            results,
            errors: errors.length > 0 ? errors : undefined,
            totalPending: pendingItems.length,
            batchesProcessed: batches.length
        })
    } catch (error) {
        console.error('AI Processing Error:', error)
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
}

export async function GET() {
    // Return status of all inbox items
    const stats = {
        total: mockDB.inboxItems.length,
        pending: mockDB.inboxItems.filter(i => i.aiStatus === 'pending' || !i.aiStatus).length,
        processed: mockDB.inboxItems.filter(i => i.aiStatus === 'processed').length,
        invoicesCreated: mockDB.supplierInvoices.size,
        receiptsCreated: mockDB.receipts.length
    }
    return NextResponse.json(stats)
}
