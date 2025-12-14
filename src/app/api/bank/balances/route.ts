/**
 * Bank Balances API
 * 
 * Quick endpoint to get just the account balances.
 * Used by dashboard widgets, sidebars, etc.
 */

import { NextResponse } from "next/server"

// Import the shared bank state by calling the main bank API
export async function GET() {
  try {
    // Fetch from main bank endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/bank`, {
      cache: 'no-store',
    })
    
    const data = await response.json()
    
    return NextResponse.json({
      balances: data.balances,
      accounts: [
        { id: 'foretagskonto', name: 'Företagskonto', balance: data.balances.foretagskonto },
        { id: 'sparkonto', name: 'Sparkonto', balance: data.balances.sparkonto },
        { id: 'skattekonto', name: 'Skattekonto', balance: data.balances.skattekonto },
      ],
      totalBalance: data.balances.foretagskonto + data.balances.sparkonto + data.balances.skattekonto,
    })
  } catch (error) {
    console.error('Failed to fetch balances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balances' },
      { status: 500 }
    )
  }
}
