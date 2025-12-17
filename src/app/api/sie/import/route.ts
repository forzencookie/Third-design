import { NextRequest, NextResponse } from "next/server"
import { parseSIE } from "@/lib/sie-parser"

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            )
        }

        const text = await file.text()
        const data = parseSIE(text)

        // Simulate database insertion delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // In a real app, we would loop through data.verifications 
        // and insert them into the transactions/verifications table.
        // For MVP/Demo, we just return the parsed stats.

        return NextResponse.json({
            success: true,
            stats: {
                verifications: data.verifications.length,
                accounts: data.accounts.length,
                balances: data.balances.length,
                period: data.fiskalYear[0] ? `${data.fiskalYear[0].start} - ${data.fiskalYear[0].end}` : 'N/A'
            }
        })
    } catch (error) {
        console.error("SIE Import error:", error)
        return NextResponse.json(
            { error: "Failed to parse SIE file" },
            { status: 500 }
        )
    }
}
