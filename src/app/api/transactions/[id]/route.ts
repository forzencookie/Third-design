import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server-db"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const body = await request.json()

        // Validate body (simple check)
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 })
        }

        // Update metadata in server-db
        // This merges with existing metadata
        const updatedMetadata = db.updateTransactionMetadata(id, body)

        return NextResponse.json({
            success: true,
            data: updatedMetadata
        })
    } catch (error) {
        console.error(`Failed to update transaction ${id}:`, error)
        return NextResponse.json(
            { success: false, error: 'Failed to update transaction' },
            { status: 500 }
        )
    }
}
