import { NextResponse } from 'next/server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

// Force Node.js runtime
export const runtime = 'nodejs'

// Import mock data from TypeScript files
import { mockTransactions } from '@/data/transactions'
import { mockReceipts } from '@/data/receipts'
import { mockSupplierInvoices } from '@/data/ownership'

// Sample verifications (since none exist in mock data)
const sampleVerifications = [
    {
        id: 'A-1',
        series: 'A',
        number: 1,
        date: '2024-05-02',
        description: 'Figma prenumeration - IT-kostnader',
        rows: [
            { account: '5420', description: 'IT-kostnader', debit: 392, credit: 0 },
            { account: '2640', description: 'Ingående moms', debit: 98, credit: 0 },
            { account: '1930', description: 'Företagskonto', debit: 0, credit: 490 }
        ]
    },
    {
        id: 'A-2',
        series: 'A',
        number: 2,
        date: '2024-05-07',
        description: 'Kundbetalning Acme AB',
        rows: [
            { account: '1930', description: 'Företagskonto', debit: 45000, credit: 0 },
            { account: '3001', description: 'Försäljning tjänster', debit: 0, credit: 36000 },
            { account: '2611', description: 'Utgående moms', debit: 0, credit: 9000 }
        ]
    },
    {
        id: 'A-3',
        series: 'A',
        number: 3,
        date: '2024-05-10',
        description: 'Kontorsmaterial Staples',
        rows: [
            { account: '5410', description: 'Kontorsmaterial', debit: 996, credit: 0 },
            { account: '2640', description: 'Ingående moms', debit: 249, credit: 0 },
            { account: '1930', description: 'Företagskonto', debit: 0, credit: 1245 }
        ]
    }
]

export async function GET() {
    console.log("Seed: Starting database seed...")

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
        return NextResponse.json({
            success: false,
            error: "Supabase is not configured. Please set environment variables."
        }, { status: 500 })
    }

    try {
        const supabase = getSupabaseAdmin()

        const results = {
            transactions: { inserted: 0, errors: [] as string[] },
            receipts: { inserted: 0, errors: [] as string[] },
            supplierInvoices: { inserted: 0, errors: [] as string[] },
            verifications: { inserted: 0, errors: [] as string[] },
        }

        // Fixed demo user UUID (consistent across seeds)
        const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

        // 0. Create demo user first (required for transactions and receipts)
        console.log("Seed: Creating demo user...")
        const { error: userError } = await supabase.from('users').upsert({
            id: DEMO_USER_ID,
            email: 'demo@example.com',
            full_name: 'Demo User',
            preferred_name: 'Demo',
        }, { onConflict: 'id' })

        if (userError) {
            console.error("Seed: User creation error:", userError)
        }

        // 1. Seed Transactions with proper UUIDs
        // Note: Existing transactions table uses UUID for id and user_id
        console.log("Seed: Inserting transactions...")
        if (mockTransactions?.length) {
            const transactionData = mockTransactions.map((t, idx) => ({
                id: `00000000-0000-0000-0001-${String(idx + 1).padStart(12, '0')}`, // Generate consistent UUID
                occurred_at: new Date(t.timestamp).toISOString(),
                description: t.name,
                amount: t.amountValue,
                currency: 'SEK',
                status: t.status === 'Bokförd' ? 'completed' : 'pending',
                merchant: t.name,
                user_id: DEMO_USER_ID,
                metadata: {
                    iconName: t.iconName,
                    iconColor: t.iconColor,
                    account: t.account,
                    originalAmount: t.amount,
                    category: t.category,
                    vatAmount: t.vatAmount,
                    originalId: t.id,
                }
            }))

            const { error } = await supabase.from('transactions').upsert(transactionData, {
                onConflict: 'id'
            })

            if (error) {
                console.error("Seed: Transaction error:", error)
                results.transactions.errors.push(error.message)
            } else {
                results.transactions.inserted = transactionData.length
            }
        }

        // 2. Seed Receipts
        // Note: Existing receipts table uses UUID for id and requires user_id
        console.log("Seed: Inserting receipts...")
        if (mockReceipts?.length) {
            const receiptData = mockReceipts.map((r, idx) => ({
                // Don't provide id - let DB generate UUID
                vendor: r.supplier,
                total_amount: parseFloat(r.amount.replace(/[^\d.-]/g, '')),
                currency: 'SEK',
                user_id: DEMO_USER_ID, // Use proper UUID
                captured_at: new Date().toISOString(),
                transaction_count: 1,
                metadata: {
                    category: r.category,
                    attachment: r.attachment,
                    originalDate: r.date,
                    originalId: r.id,
                    status: r.status,
                }
            }))

            // Use insert instead of upsert since we're not providing id
            const { error } = await supabase.from('receipts').insert(receiptData)

            if (error) {
                console.error("Seed: Receipt error:", error)
                results.receipts.errors.push(error.message)
            } else {
                results.receipts.inserted = receiptData.length
            }
        }

        // 3. Seed Supplier Invoices
        console.log("Seed: Inserting supplier invoices...")
        if (mockSupplierInvoices?.length) {
            const invoiceData = mockSupplierInvoices.map(i => ({
                id: i.id,
                invoice_number: i.invoiceNumber,
                supplier_name: i.supplierName,
                amount: i.amount || i.totalAmount * 0.8, // Estimate net if not provided
                vat_amount: i.vatAmount || i.totalAmount * 0.2,
                total_amount: i.totalAmount,
                due_date: i.dueDate,
                issue_date: i.invoiceDate,
                status: i.status?.toLowerCase() || 'mottagen',
                ocr: i.ocrReference || null,
            }))

            // @ts-ignore - Table might not be in generated types yet
            const { error } = await supabase.from('supplier_invoices').upsert(invoiceData, {
                onConflict: 'id'
            })

            if (error) {
                console.error("Seed: Supplier invoice error:", error)
                results.supplierInvoices.errors.push(error.message)
            } else {
                results.supplierInvoices.inserted = invoiceData.length
            }
        }

        // 4. Seed Verifications
        console.log("Seed: Inserting verifications...")
        if (sampleVerifications?.length) {
            const verificationData = sampleVerifications.map(v => ({
                id: v.id,
                series: v.series || 'A',
                number: v.number || null,
                date: v.date,
                description: v.description,
                rows: v.rows,
            }))

            // @ts-ignore - Table might not be in generated types yet
            const { error } = await supabase.from('verifications').upsert(verificationData, {
                onConflict: 'id'
            })

            if (error) {
                console.error("Seed: Verification error:", error)
                results.verifications.errors.push(error.message)
            } else {
                results.verifications.inserted = verificationData.length
            }
        }

        // 5. Seed a default company
        console.log("Seed: Inserting default company...")
        // @ts-ignore
        await supabase.from('companies').upsert({
            id: 'demo-company',
            name: 'Demo Företag AB',
            org_number: '556123-4567',
            settings: {
                accountingMethod: 'invoice',
                fiscalYearStart: '01-01',
            }
        }, { onConflict: 'id' })

        console.log("Seed: Complete!", results)

        return NextResponse.json({
            success: true,
            message: "Database seeded successfully!",
            results,
            summary: {
                totalInserted:
                    results.transactions.inserted +
                    results.receipts.inserted +
                    results.supplierInvoices.inserted +
                    results.verifications.inserted,
                hasErrors:
                    results.transactions.errors.length > 0 ||
                    results.receipts.errors.length > 0 ||
                    results.supplierInvoices.errors.length > 0 ||
                    results.verifications.errors.length > 0
            }
        })

    } catch (error: any) {
        console.error("Seed: Critical error:", error)
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
