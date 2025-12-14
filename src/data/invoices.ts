// ============================================
// Invoices Mock Data
// ============================================

import { INVOICE_STATUSES, type InvoiceStatus } from "@/lib/status-types"
import type { Invoice } from "@/types"

// Re-export type for convenience
export type { Invoice }

export const mockInvoices: Invoice[] = [
    // Empty array to start fresh
    // {
    //     id: "FAK-001",
    //     invoiceNumber: "2024-001",
    //     customer: "Teknikbolaget AB",
    //     issueDate: "2024-11-15",
    //     dueDate: "2024-12-15",
    //     amount: 45000,
    //     status: "Betald",
    // },
]

// Re-export status for convenience
export { INVOICE_STATUSES }
export type { InvoiceStatus }
