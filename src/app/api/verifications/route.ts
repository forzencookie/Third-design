
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server-db";

export async function GET() {
    try {
        const data = await db.get();
        return NextResponse.json({
            verifications: data.verifications || []
        });
    } catch (error) {
        console.error("Failed to fetch verifications:", error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Auto-assign ID if not present is handled by addVerification
        const verification = {
            date: body.date || new Date().toISOString().split('T')[0],
            description: body.description,
            rows: body.rows, // Expects [{ account, description, debit, credit }]
            sourceType: body.sourceType || 'manual'
        };

        const saved = await db.addVerification(verification);
        return NextResponse.json({ success: true, verification: saved });
    } catch (error) {
        console.error("Failed to create verification:", error);
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}
