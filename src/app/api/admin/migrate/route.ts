import { NextResponse } from 'next/server'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

// Force Node.js runtime since we use 'fs' module
export const runtime = 'nodejs'

// Inline function to read the old DB just for migration
function readLocalJSON() {
    try {
        const DB_PATH = path.join(process.cwd(), 'src', 'data', 'simulated-db.json');
        console.log("Migration: Looking for DB at:", DB_PATH);
        if (fs.existsSync(DB_PATH)) {
            const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
            console.log("Migration: Found local DB with keys:", Object.keys(data));
            return data;
        } else {
            console.log("Migration: DB file does not exist at", DB_PATH);
        }
    } catch (e) {
        console.error("Migration: Failed to read local JSON", e);
    }
    return { transactions: [], receipts: [], supplierInvoices: [], verifications: [] };
}

export async function GET() {
    console.log("Migration: Starting...")
    console.log("Migration: Checking env vars...")
    console.log("  NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING")
    console.log("  NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING")
    console.log("  SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING")

    // Check if Supabase is configured before proceeding
    if (!isSupabaseConfigured()) {
        console.error("Migration: Supabase is not configured!")
        return NextResponse.json({
            success: false,
            error: "Supabase is not configured. Please set environment variables in .env.local",
            required: [
                "NEXT_PUBLIC_SUPABASE_URL",
                "NEXT_PUBLIC_SUPABASE_ANON_KEY",
                "SUPABASE_SERVICE_ROLE_KEY"
            ]
        }, { status: 500 })
    }

    try {
        console.log("Migration: Initializing Supabase Admin...")
        const supabase = getSupabaseAdmin()
        console.log("Migration: Supabase Admin initialized.")

        console.log("Migration: Reading local JSON DB...")
        const jsonData = readLocalJSON()
        console.log("Migration: JSON DB read. Transactions:", jsonData.transactions?.length)

        const results = {
            transactions: 0,
            receipts: 0,
            supplierInvoices: 0,
            verifications: 0,
            errors: [] as string[]
        }

        // 1. Migrate Transactions
        if (jsonData.transactions?.length) {
            console.log("Migration: Uploading transactions...")
            const { error } = await supabase.from('transactions').upsert(
                jsonData.transactions.map((t: any) => ({
                    id: t.id,
                    date: t.date,
                    description: t.description,
                    amount: t.amount,
                    category: t.category,
                    status: t.status,
                    metadata: {
                        source: 'migration',
                        originalData: t
                    }
                }))
            )
            if (error) {
                console.error("Migration: Transaction Error:", error)
                results.errors.push(`Transactions: ${error.message}`)
            }
            else results.transactions = jsonData.transactions.length
        }

        // 2. Migrate Receipts
        if (jsonData.receipts?.length) {
            console.log("Migration: Uploading receipts...")
            const { error } = await supabase.from('receipts').upsert(
                jsonData.receipts.map((r: any) => ({
                    id: r.id,
                    date: r.date,
                    supplier: r.supplier,
                    amount: typeof r.amount === 'string' ? parseFloat(r.amount) : r.amount,
                    category: r.category,
                    status: r.status,
                    image_url: r.attachmentUrl
                }))
            )
            if (error) {
                console.error("Migration: Receipt Error:", error)
                results.errors.push(`Receipts: ${error.message}`)
            }
            else results.receipts = jsonData.receipts.length
        }

        // 3. Migrate Supplier Invoices
        if (jsonData.supplierInvoices?.length) {
            console.log("Migration: Uploading supplier invoices...")
            // @ts-ignore - Table likely missing in generated types
            const { error } = await supabase.from('supplier_invoices').upsert(
                jsonData.supplierInvoices.map((i: any) => ({
                    id: i.id,
                    invoice_number: i.invoiceNumber,
                    supplier_name: i.supplierName || i.supplier, // Handle varied naming
                    amount: i.amount,
                    vat_amount: i.vatAmount,
                    total_amount: i.totalAmount || i.amount,
                    due_date: i.dueDate,
                    issue_date: i.invoiceDate,
                    status: i.status?.toLowerCase() || 'mottagen',
                    ocr: i.ocr || i.ocrNumber
                }))
            )
            if (error) {
                console.error("Migration: Supplier Invoice Error:", error)
                results.errors.push(`SupplierInvoices: ${error.message}`)
            }
            else results.supplierInvoices = jsonData.supplierInvoices.length
        }

        // 4. Migrate Verifications
        if (jsonData.verifications?.length) {
            console.log("Migration: Uploading verifications...")
            // @ts-ignore
            const { error } = await supabase.from('verifications').upsert(
                jsonData.verifications.map((v: any) => ({
                    id: v.id,
                    date: v.date,
                    description: v.description,
                    rows: v.rows // JSONB
                }))
            )
            if (error) {
                console.error("Migration: Verification Error:", error)
                results.errors.push(`Verifications: ${error.message}`)
            }
            else results.verifications = jsonData.verifications.length
        }

        console.log("Migration: Finished.", results)
        return NextResponse.json({
            success: true,
            message: "Migration attempted",
            details: results
        })

    } catch (error: any) {
        console.error("Migration: CRITICAL ERROR:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
