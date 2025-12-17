// ============================================
// Invoices Mock Data (Kundfakturor)
// Source for Utgående moms (output VAT)
// ============================================

import { INVOICE_STATUSES, type InvoiceStatus } from "@/lib/status-types"
import type { Invoice } from "@/types"

// Re-export type for convenience
export type { Invoice }

export const mockInvoices: Invoice[] = [
    {
        id: "FAK-001",
        invoiceNumber: "2024-001",
        customer: "Teknikbolaget AB",
        issueDate: "2024-10-15",
        dueDate: "2024-11-15",
        amount: 50000,       // Net amount
        vatAmount: 12500,    // 25% VAT
        vatRate: 25,
        status: INVOICE_STATUSES.RECORDED,
    },
    {
        id: "FAK-002",
        invoiceNumber: "2024-002",
        customer: "Digital Solutions AB",
        issueDate: "2024-11-01",
        dueDate: "2024-12-01",
        amount: 80000,
        vatAmount: 20000,    // 25% VAT
        vatRate: 25,
        status: "Betald",
    },
    {
        id: "FAK-003",
        invoiceNumber: "2024-003",
        customer: "StartupX AB",
        issueDate: "2024-11-20",
        dueDate: "2024-12-20",
        amount: 35000,
        vatAmount: 8750,     // 25% VAT
        vatRate: 25,
        status: "Skickad",
    },
    {
        id: "FAK-004",
        invoiceNumber: "2024-004",
        customer: "Konsultgruppen AB",
        issueDate: "2024-12-01",
        dueDate: "2025-01-01",
        amount: 120000,
        vatAmount: 30000,    // 25% VAT
        vatRate: 25,
        status: "Skickad",
    },
    {
        id: "FAK-005",
        invoiceNumber: "2024-005",
        customer: "Nordic Innovation AB",
        issueDate: "2024-12-10",
        dueDate: "2025-01-10",
        amount: 45000,
        vatAmount: 11250,    // 25% VAT
        vatRate: 25,
        status: "Utkast",
    },
]

// Re-export status for convenience
export { INVOICE_STATUSES }
export type { InvoiceStatus }

