
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server-db";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Find the invoice
        // We assume invoices are loaded from server-db
        const data = await db.get();
        const allInvoices = (data.invoices || []) as any[];
        const invoice = allInvoices.find((inv: any) => inv.id === id);

        if (!invoice) {
            // Fallback check if it's new/unsaved (shouldn't happen with our flow)
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        if (invoice.status === 'Skickad' || invoice.status === 'Betald') {
            return NextResponse.json({ error: "Invoice already booked" }, { status: 400 });
        }

        // 1. Update Invoice Status
        // TODO: Implement updateInvoice in db when customer invoices are migrated
        // For now, just log the status update
        console.log(`Would update invoice ${id} to status 'Skickad'`);

        // 2. Create Verification
        const total = parseFloat(invoice.amount) || 0;

        // Simplistic VAT calc: assume 25% if not specified
        // invoice.vatAmount might be stored if we update the create flow, 
        // otherwise derived.
        let vat = 0;
        if (invoice.vatAmount !== undefined) {
            vat = parseFloat(invoice.vatAmount);
        } else {
            // Assume default 25% incl VAT: Price = Net * 1.25 -> Net = Price / 1.25 -> VAT = Price - Net
            vat = total - (total / 1.25);
        }
        const net = total - vat;

        // Rounding to 2 decimals
        const r = (n: number) => Math.round(n * 100) / 100;

        const verification = {
            date: new Date().toISOString().split('T')[0],
            description: `Faktura ${id} - ${invoice.customer}`,
            sourceId: id,
            sourceType: 'invoice',
            rows: [
                { account: '1510', description: 'Kundfordringar', debit: r(total), credit: 0 },
                { account: '3001', description: 'Försäljning inom Sverige', debit: 0, credit: r(net) },
                { account: '2611', description: 'Utgående moms 25%', debit: 0, credit: r(vat) }
            ]
        };

        await db.addVerification(verification);

        return NextResponse.json({ success: true, verification });

    } catch (error) {
        console.error("Booking error:", error);
        return NextResponse.json({ error: "Failed to book invoice" }, { status: 500 });
    }
}
