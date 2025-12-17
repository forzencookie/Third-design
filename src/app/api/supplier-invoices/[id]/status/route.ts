
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server-db";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const status = body.status;

        // 1. Try update in DB
        const updated = await db.updateSupplierInvoice(id, { status });

        if (updated) {
            return NextResponse.json({ success: true, status });
        }

        // 2. If not in DB, try to find in Mock and migrate to DB
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const res = await fetch(`${baseUrl}/api/mock/supplier-invoices`, { cache: 'no-store' });

        if (res.ok) {
            const data = await res.json();
            const mockInvoices = data.invoices || [];
            const target = mockInvoices.find((i: any) => i.id === id);

            if (target) {
                // Determine new object
                const newObj = { ...target, status };
                // Add to DB (it will now persist and override mock in future fetches)
                await db.addSupplierInvoice(newObj);
                return NextResponse.json({ success: true, status });
            }
        }

        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    } catch (error) {
        console.error("Status update error:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}
