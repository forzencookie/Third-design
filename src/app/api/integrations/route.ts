import { NextResponse } from 'next/server'

// In-memory storage for integration states
// In a real app, this would be stored in a database per user
const integrationStates: Record<string, boolean> = {
    // Email Providers
    'gmail': false,
    'yahoo': false,
    'outlook': false,
    // Digital Post
    'kivra': false,
    // Other integrations (pre-existing, for reference)
    'bankgirot': true,
    'swish': true,
    'google-calendar': false,
    'skatteverket': false,
}

export async function GET() {
    return NextResponse.json({
        integrations: integrationStates
    })
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { id, connected } = body

        if (typeof id !== 'string' || typeof connected !== 'boolean') {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
        }

        // Update the integration state
        integrationStates[id] = connected

        return NextResponse.json({
            success: true,
            id,
            connected: integrationStates[id],
            integrations: integrationStates
        })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
