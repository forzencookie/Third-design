
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server-db";

export async function GET() {
    try {
        const data = await db.get();
        // Return format compatible with invoices-table expectations if possible, 
        // or we update frontend. 
        // existing mock API (api/invoices/processed) returns: { invoices: [...] }
        return NextResponse.json({
            invoices: data.invoices || []
        });
    } catch (error) {
        console.error("Failed to fetch invoices:", error);
        return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Basic validation
        if (!body.customer || !body.amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newInvoice = {
            ...body,
            id: body.id || `FAK-${Date.now()}`,
            status: body.status || 'Utkast', // Default to Draft
            createdAt: new Date().toISOString()
        };

        // TODO: Implement addInvoice in db when customer invoices are migrated
        // For now, just return success with the invoice
        // const savedInvoice = db.addInvoice(newInvoice);

        return NextResponse.json({
            success: true,
            invoice: newInvoice
        });
    } catch (error) {
        console.error("Failed to create invoice:", error);
        return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
    }
}
