// ============================================
// Services Layer - Central Export
// ============================================

export * from "./inbox"

// Transaction services - use transactions.ts for mock/dev, transactions-supabase.ts for production
// Default export is the mock service for development
export * from "./transactions"

// Processor services - transform raw data into display-ready format
export * from "./receipt-processor"
export * from "./invoice-processor"
export * from "./verifikation-processor"
export * from "./payroll-processor"
export * from "./dividend-processor"
export * from "./reports-processor"
export * from "./ownership-processor"
export * from "./calendar-processor"

// Simulator services - for testing/demo
export * from "./myndigheter-client"

// Bank client utilities (legacy - prefer using /api/bank endpoints directly)
export * as BankSimulator from "./bank-client"

// Note: bank-transaction-service removed to avoid duplicate exports
// Use /api/bank endpoints instead for bank transaction flow
