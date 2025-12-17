
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server-db";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await db.get();
        const allInvoices = (data.invoices || []) as any[];
        const invoice = allInvoices.find((inv: any) => inv.id === id);

        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        if (invoice.status === 'Betald') {
            return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });
        }

        // 1. Update Invoice Status
        // TODO: Implement updateInvoice in db when customer invoices are migrated
        console.log(`Would update invoice ${id} to status 'Betald'`);

        // 2. Create Verification
        const total = parseFloat(invoice.amount) || 0;

        // Rounding
        const r = (n: number) => Math.round(n * 100) / 100;

        const verification = {
            date: new Date().toISOString().split('T')[0],
            description: `Betalning faktura ${id} - ${invoice.customer}`,
            sourceId: id,
            sourceType: 'payment',
            rows: [
                { account: '1930', description: 'Företagskonto', debit: r(total), credit: 0 },
                { account: '1510', description: 'Kundfordringar', debit: 0, credit: r(total) }
            ]
        };
        await db.addVerification(verification);

        // 3. Create Bank Transaction
        const transaction = {
            id: `TX-PAY-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: `Inbetalning ${id}`,
            amount: total, // Positive for income
            currency: 'SEK',
            account: '1930',
            category: '1510',
            status: 'Bokförd'
        };
        await db.addTransaction(transaction);

        return NextResponse.json({ success: true, verification, transaction });

    } catch (error) {
        console.error("Payment error:", error);
        return NextResponse.json({ error: "Failed to pay invoice" }, { status: 500 });
    }
}
