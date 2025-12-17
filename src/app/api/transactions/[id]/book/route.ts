
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server-db";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        // 1. Find Transaction
        const data = await db.get();
        const allTransactions = data.transactions || [];
        const transaction = allTransactions.find((t: any) => t.id === id);

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // 2. Update Transaction Status
        const updates = {
            status: 'Bokförd',
            category: body.category,
            account: `${body.debitAccount} / ${body.creditAccount}`,
        };

        // Update raw transaction (or metadata depending on how we want to persist it)
        // We update the transaction directly here for simplicity in Phase 1
        await db.updateTransaction(id, updates);

        // 3. Create Verification
        // Handle amount as number (Supabase stores as number)
        const amount = typeof transaction.amount === 'number'
            ? transaction.amount
            : parseFloat(String(transaction.amount ?? 0));
        const absAmount = Math.abs(amount);

        const verification = {
            date: transaction.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            description: body.description || transaction.description,
            sourceId: id,
            sourceType: 'transaction',
            rows: [
                {
                    account: body.debitAccount,
                    description: 'Debet',
                    debit: absAmount,
                    credit: 0
                },
                {
                    account: body.creditAccount,
                    description: 'Kredit',
                    debit: 0,
                    credit: absAmount
                }
            ]
        };

        await db.addVerification(verification);

        return NextResponse.json({ success: true, verification });

    } catch (error) {
        console.error("Booking error:", error);
        return NextResponse.json({ error: "Failed to book transaction" }, { status: 500 });
    }
}
