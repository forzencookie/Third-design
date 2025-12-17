/**
 * AI Read Tools
 * 
 * Tools for reading/querying data from the dashboard.
 * These are safe operations that don't require confirmation.
 */

import { defineTool } from './registry'
import {
    generateMockPayslips,
    generateMockEmployees,
    generateMockAGIReports,
    type ProcessedPayslip,
    type ProcessedEmployee,
    type ProcessedAGIReport,
} from '@/services/payroll-processor'
import {
    generateMockVATPeriods,
    generateMockIncomeStatement,
    generateMockBalanceSheet,
    type ProcessedVATPeriod,
    type ProcessedFinancialItem,
} from '@/services/reports-processor'
import { mockTransactions, type Transaction } from '@/data/transactions'

// =============================================================================
// Transaction Tools
// =============================================================================

export interface GetTransactionsParams {
    limit?: number
    month?: string
    year?: number
    minAmount?: number
    maxAmount?: number
    status?: 'pending' | 'review' | 'booked'
}

export const getTransactionsTool = defineTool<GetTransactionsParams, Transaction[]>({
    name: 'get_transactions',
    description: 'Hämta transaktioner från bokföringen. Kan filtreras på period, belopp och status.',
    category: 'read',
    requiresConfirmation: false,
    parameters: {
        type: 'object',
        properties: {
            limit: {
                type: 'number',
                description: 'Max antal transaktioner att hämta (standard: 10)',
            },
            month: {
                type: 'string',
                description: 'Månad att filtrera på (t.ex. "januari", "februari")',
            },
            year: {
                type: 'number',
                description: 'År att filtrera på (t.ex. 2024)',
            },
            minAmount: {
                type: 'number',
                description: 'Minsta belopp (absolut värde)',
            },
            maxAmount: {
                type: 'number',
                description: 'Högsta belopp (absolut värde)',
            },
            status: {
                type: 'string',
                enum: ['pending', 'review', 'booked'],
                description: 'Filtrera på status',
            },
        },
    },
    execute: async (params) => {
        // Use mock transactions directly
        let filtered = [...mockTransactions]

        // Apply filters
        if (params.minAmount !== undefined) {
            filtered = filtered.filter(t => Math.abs(t.amountValue) >= params.minAmount!)
        }
        if (params.maxAmount !== undefined) {
            filtered = filtered.filter(t => Math.abs(t.amountValue) <= params.maxAmount!)
        }
        // Status filter removed - mock data uses different status types

        // Apply limit
        const limit = params.limit || 10
        const data = filtered.slice(0, limit)

        return {
            success: true,
            data,
            message: `Hittade ${filtered.length} transaktioner, visar ${data.length}.`,
            display: {
                component: 'TransactionsTable',
                props: { transactions: data },
                title: 'Transaktioner',
                fullViewRoute: '/dashboard/accounting/verifikationer',
            },
        }
    },
})

// =============================================================================
// Payroll Tools
// =============================================================================

export interface GetPayslipsParams {
    period?: string
    employee?: string
}

export const getPayslipsTool = defineTool<GetPayslipsParams, ProcessedPayslip[]>({
    name: 'get_payslips',
    description: 'Hämta lönebesked för anställda. Kan filtreras på period eller anställd.',
    category: 'read',
    requiresConfirmation: false,
    parameters: {
        type: 'object',
        properties: {
            period: {
                type: 'string',
                description: 'Period (t.ex. "December 2024")',
            },
            employee: {
                type: 'string',
                description: 'Namn på anställd',
            },
        },
    },
    execute: async (params) => {
        let payslips = generateMockPayslips()

        if (params.period) {
            payslips = payslips.filter(p =>
                p.period.toLowerCase().includes(params.period!.toLowerCase())
            )
        }
        if (params.employee) {
            payslips = payslips.filter(p =>
                p.employee.toLowerCase().includes(params.employee!.toLowerCase())
            )
        }

        return {
            success: true,
            data: payslips,
            message: `Hittade ${payslips.length} lönebesked.`,
            display: {
                component: 'PayslipsTable',
                props: { payslips },
                title: 'Lönebesked',
                fullViewRoute: '/dashboard/payroll',
            },
        }
    },
})

export const getEmployeesTool = defineTool<Record<string, never>, ProcessedEmployee[]>({
    name: 'get_employees',
    description: 'Hämta lista över alla anställda.',
    category: 'read',
    requiresConfirmation: false,
    parameters: {
        type: 'object',
        properties: {},
    },
    execute: async () => {
        const employees = generateMockEmployees()

        return {
            success: true,
            data: employees,
            message: `Du har ${employees.length} anställda.`,
            display: {
                component: 'EmployeeList',
                props: { employees },
                title: 'Anställda',
                fullViewRoute: '/dashboard/payroll',
            },
        }
    },
})

export const getAGIReportsTool = defineTool<{ period?: string }, ProcessedAGIReport[]>({
    name: 'get_agi_reports',
    description: 'Hämta AGI-rapporter (arbetsgivardeklarationer). Kan filtreras på period.',
    category: 'read',
    requiresConfirmation: false,
    parameters: {
        type: 'object',
        properties: {
            period: {
                type: 'string',
                description: 'Period att filtrera på (t.ex. "December 2024")',
            },
        },
    },
    execute: async (params) => {
        let reports = generateMockAGIReports()

        if (params.period) {
            reports = reports.filter(r =>
                r.period.toLowerCase().includes(params.period!.toLowerCase())
            )
        }

        return {
            success: true,
            data: reports,
            message: `Hittade ${reports.length} AGI-rapporter.`,
            display: {
                component: 'DeadlinesList',
                props: { items: reports },
                title: 'AGI-rapporter',
                fullViewRoute: '/dashboard/payroll',
            },
        }
    },
})

// =============================================================================
// VAT Tools
// =============================================================================

export const getVatReportTool = defineTool<{ period?: string }, ProcessedVATPeriod[]>({
    name: 'get_vat_report',
    description: 'Hämta momsdeklarationer. Visar utgående och ingående moms samt nettobelopp.',
    category: 'read',
    requiresConfirmation: false,
    parameters: {
        type: 'object',
        properties: {
            period: {
                type: 'string',
                description: 'Period (t.ex. "Q4 2024")',
            },
        },
    },
    execute: async (params) => {
        let periods = generateMockVATPeriods()

        if (params.period) {
            periods = periods.filter(p =>
                p.period.toLowerCase().includes(params.period!.toLowerCase())
            )
        }

        // Calculate totals for the message
        const upcoming = periods.find(p => p.status === 'Kommande')

        let message = `Hittade ${periods.length} momsperioder.`
        if (upcoming) {
            const action = upcoming.netVat > 0 ? 'betala' : 'få tillbaka'
            message += ` Nästa period (${upcoming.period}): ${Math.abs(upcoming.netVat).toLocaleString('sv-SE')} kr att ${action}, deadline ${upcoming.dueDate}.`
        }

        return {
            success: true,
            data: periods,
            message,
            display: {
                component: 'VatSummary',
                props: { periods },
                title: 'Momsdeklaration',
                fullViewRoute: '/dashboard/myndigheter/momsdeklaration',
            },
        }
    },
})

// =============================================================================
// Financial Statement Tools
// =============================================================================

export const getIncomeStatementTool = defineTool<Record<string, never>, ProcessedFinancialItem[]>({
    name: 'get_income_statement',
    description: 'Hämta resultaträkning med intäkter, kostnader och årets resultat.',
    category: 'read',
    requiresConfirmation: false,
    parameters: {
        type: 'object',
        properties: {},
    },
    execute: async () => {
        const items = generateMockIncomeStatement()
        const result = items.find(i => i.label === 'Årets resultat')

        return {
            success: true,
            data: items,
            message: result
                ? `Årets resultat: ${result.value.toLocaleString('sv-SE')} kr`
                : 'Resultaträkning hämtad.',
            display: {
                component: 'IncomeStatement',
                props: { items },
                title: 'Resultaträkning',
                fullViewRoute: '/dashboard/reports',
            },
        }
    },
})

export const getBalanceSheetTool = defineTool<Record<string, never>, ProcessedFinancialItem[]>({
    name: 'get_balance_sheet',
    description: 'Hämta balansräkning med tillgångar, skulder och eget kapital.',
    category: 'read',
    requiresConfirmation: false,
    parameters: {
        type: 'object',
        properties: {},
    },
    execute: async () => {
        const items = generateMockBalanceSheet()
        const total = items.find(i => i.label === 'Summa tillgångar')

        return {
            success: true,
            data: items,
            message: total
                ? `Summa tillgångar: ${total.value.toLocaleString('sv-SE')} kr`
                : 'Balansräkning hämtad.',
            display: {
                component: 'BalanceSheet',
                props: { items },
                title: 'Balansräkning',
                fullViewRoute: '/dashboard/reports',
            },
        }
    },
})

// =============================================================================
// Summary Tools
// =============================================================================

export interface CompanyStats {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    employeeCount: number
    pendingVat: number
    upcomingDeadlines: number
}

export const getCompanyStatsTool = defineTool<Record<string, never>, CompanyStats>({
    name: 'get_company_stats',
    description: 'Hämta en sammanfattning av företagets ekonomiska status.',
    category: 'read',
    requiresConfirmation: false,
    parameters: {
        type: 'object',
        properties: {},
    },
    execute: async () => {
        const income = generateMockIncomeStatement()
        const employees = generateMockEmployees()
        const vat = generateMockVATPeriods()
        const agi = generateMockAGIReports()

        const revenue = income.find(i => i.label === 'Rörelseintäkter')?.value || 0
        const expenses = income.find(i => i.label === 'Rörelsekostnader')?.value || 0
        const profit = income.find(i => i.label === 'Årets resultat')?.value || 0

        const upcomingVat = vat.find(p => p.status === 'Kommande')
        const pendingAgi = agi.filter(r => r.status !== 'Inskickad').length

        const stats: CompanyStats = {
            totalRevenue: revenue,
            totalExpenses: Math.abs(expenses),
            netProfit: profit,
            employeeCount: employees.length,
            pendingVat: upcomingVat?.netVat || 0,
            upcomingDeadlines: pendingAgi + (upcomingVat ? 1 : 0),
        }

        return {
            success: true,
            data: stats,
            message: `Omsättning: ${revenue.toLocaleString('sv-SE')} kr. Resultat: ${profit.toLocaleString('sv-SE')} kr. ${stats.upcomingDeadlines} kommande deadlines.`,
            display: {
                component: 'CompanyStats',
                props: { stats },
                title: 'Företagsöversikt',
                fullViewRoute: '/dashboard',
            },
        }
    },
})

// =============================================================================
// Export all read tools
// =============================================================================

export const readTools = [
    getTransactionsTool,
    getPayslipsTool,
    getEmployeesTool,
    getAGIReportsTool,
    getVatReportTool,
    getIncomeStatementTool,
    getBalanceSheetTool,
    getCompanyStatsTool,
]
