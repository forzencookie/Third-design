import { NextResponse } from 'next/server'
import { db } from '@/lib/server-db'
import type { BookingData } from '@/components/transactions/BookingDialog'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = (await request.json()) as BookingData
        const { id } = await params

        // Create the verification
        // Standard bookkeeping for receipts:
        // Debit: Expense Account (body.debitAccount)
        // Credit: Private Utlägg (2893) or Company Card (2440 or 1930) depending on payment
        // We use body.creditAccount which defaults to suggestion.

        const newVerification = {
            id: crypto.randomUUID(),
            series: 'B', // Kvitton/Verifikationer
            number: Math.floor(Math.random() * 1000),
            date: new Date().toISOString().split('T')[0],
            description: body.description || 'Kvitto',
            rows: [
                { account: body.debitAccount, debit: body.amount || 0, credit: 0 },
                { account: body.creditAccount, debit: 0, credit: body.amount || 0 }
            ]
        }

        db.addVerification(newVerification)

        return NextResponse.json({ success: true })

    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to book receipt' },
            { status: 500 }
        )
    }
}
