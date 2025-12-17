import { NextResponse } from 'next/server'

// Force Node.js runtime
export const runtime = 'nodejs'

export async function GET() {
    console.log("Test endpoint hit!")

    try {
        // Step 1: Test basic response
        console.log("Step 1: Basic response works")

        // Step 2: Test env vars
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        const service = process.env.SUPABASE_SERVICE_ROLE_KEY
        console.log("Step 2: Env vars:", {
            url: url ? "SET" : "MISSING",
            anon: anon ? "SET" : "MISSING",
            service: service ? "SET" : "MISSING"
        })

        // Step 3: Test fs module
        const fs = require('fs')
        const path = require('path')
        const cwd = process.cwd()
        console.log("Step 3: CWD:", cwd)

        // Step 4: Check if DB file exists
        const dbPath = path.join(cwd, 'src', 'data', 'simulated-db.json')
        const exists = fs.existsSync(dbPath)
        console.log("Step 4: DB exists:", exists, "at", dbPath)

        return NextResponse.json({
            success: true,
            message: "Test endpoint works!",
            env: {
                supabaseUrl: url ? "SET" : "MISSING",
                anonKey: anon ? "SET" : "MISSING",
                serviceKey: service ? "SET" : "MISSING"
            },
            cwd: cwd,
            dbExists: exists,
            dbPath: dbPath
        })

    } catch (error: any) {
        console.error("Test endpoint error:", error)
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
