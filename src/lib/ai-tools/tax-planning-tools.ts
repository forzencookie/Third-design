/**
 * Tax Planning AI Tools
 * 
 * Tools for AI to manage periodiseringsfonder, förmåner, and investments.
 * All tools follow the AITool interface for registry integration.
 */

import { defineTool } from './registry'
import type { AITool } from './types'
import {
    listPeriodiseringsfonder,
    createPeriodiseringsfond,
    dissolvePeriodiseringsfond,
    getExpiringFonder,
    calculateTaxSavings,
} from '../periodiseringsfonder'
import {
    listAvailableBenefits,
    getBenefitDetails,
    assignBenefit,
    getEmployeeBenefits,
    getRemainingAllowance,
    suggestUnusedBenefits,
} from '../formaner'
import {
    listProperties,
    createProperty,
    listShareHoldings,
    createShareHolding,
    listCryptoHoldings,
    getInvestmentSummary,
} from '../investments'

// =============================================================================
// Periodiseringsfonder Tools
// =============================================================================

const listPeriodiseringsfondsTools = defineTool({
    name: 'list_periodiseringsfonder',
    description: 'List all periodiseringsfonder (tax allocation reserves). Shows active fonder with amounts, years, and expiry dates.',
    parameters: {
        type: 'object' as const,
        properties: {},
    },
    requiresConfirmation: false,
    category: 'read',
    execute: async () => {
        const fonder = await listPeriodiseringsfonder()
        return {
            success: true,
            data: fonder,
            message: `Found ${fonder.length} periodiseringsfonder`,
        }
    },
})

const createPeriodiseringsfondTool = defineTool({
    name: 'create_periodiseringsfond',
    description: 'Create a new periodiseringsfond to defer tax. Max 25% of profit for AB, 30% for EF. Must be dissolved within 6 years.',
    parameters: {
        type: 'object' as const,
        properties: {
            year: { type: 'number', description: 'Tax year (beskattningsår)' },
            amount: { type: 'number', description: 'Amount to allocate in SEK' },
        },
        required: ['year', 'amount'],
    },
    requiresConfirmation: true,
    category: 'write',
    execute: async (params: { year: number; amount: number }) => {
        const taxSavings = calculateTaxSavings(params.amount, 'AB')
        return {
            success: true,
            confirmationRequired: {
                title: 'Skapa periodiseringsfond',
                description: `Avs\u00e4tt ${params.amount.toLocaleString('sv-SE')} kr f\u00f6r beskattnings\u00e5r ${params.year}`,
                summary: [
                    { label: 'Belopp', value: `${params.amount.toLocaleString('sv-SE')} kr` },
                    { label: 'Skattebespaing', value: `${taxSavings.taxSaved.toLocaleString('sv-SE')} kr` },
                    { label: 'L\u00f6per ut', value: `${params.year + 6}-12-31` },
                ],
                action: { toolName: 'create_periodiseringsfond', params },
            },
        }
    },
})

const dissolvePeriodiseringsfondTool = defineTool({
    name: 'dissolve_periodiseringsfond',
    description: 'Dissolve (återför) a periodiseringsfond. Can be partial or full dissolution.',
    parameters: {
        type: 'object' as const,
        properties: {
            id: { type: 'string', description: 'ID of the fond to dissolve' },
            amount: { type: 'number', description: 'Amount to dissolve (optional, full dissolution if not specified)' },
        },
        required: ['id'],
    },
    requiresConfirmation: true,
    category: 'write',
    execute: async (params: { id: string; amount?: number }) => {
        const result = await dissolvePeriodiseringsfond(params.id, params.amount)
        if (result) {
            return {
                success: true,
                data: result,
                message: `Fond dissolved successfully`,
            }
        }
        return { success: false, error: 'Failed to dissolve fond' }
    },
})

const getExpiringFonderTool = defineTool({
    name: 'get_expiring_fonder',
    description: 'Get periodiseringsfonder that are expiring within a specified number of months. Useful for tax planning alerts.',
    parameters: {
        type: 'object' as const,
        properties: {
            withinMonths: { type: 'number', description: 'Number of months to look ahead (default 12)' },
        },
    },
    requiresConfirmation: false,
    category: 'read',
    execute: async (params: { withinMonths?: number }) => {
        const fonder = await getExpiringFonder(params.withinMonths || 12)
        return {
            success: true,
            data: fonder,
            message: fonder.length > 0
                ? `${fonder.length} fonder expiring within ${params.withinMonths || 12} months`
                : 'No fonder expiring soon',
        }
    },
})

// =============================================================================
// Förmåner Tools
// =============================================================================

const listBenefitsTool = defineTool({
    name: 'list_benefits',
    description: 'List all available employee benefits (förmåner). Filter by company type if needed.',
    parameters: {
        type: 'object' as const,
        properties: {
            companyType: { type: 'string', enum: ['AB', 'EF', 'EnskildFirma'], description: 'Company type filter' },
        },
    },
    requiresConfirmation: false,
    category: 'read',
    execute: async (params: { companyType?: 'AB' | 'EF' | 'EnskildFirma' }) => {
        const benefits = await listAvailableBenefits(params.companyType)
        return {
            success: true,
            data: benefits,
            message: `Found ${benefits.length} available benefits`,
        }
    },
})

const getBenefitDetailsTool = defineTool({
    name: 'get_benefit_details',
    description: 'Get detailed information about a specific benefit type, including tax rules and limits.',
    parameters: {
        type: 'object' as const,
        properties: {
            benefitId: { type: 'string', description: 'ID of the benefit (e.g., friskvard, tjanstebil)' },
        },
        required: ['benefitId'],
    },
    requiresConfirmation: false,
    category: 'read',
    execute: async (params: { benefitId: string }) => {
        const benefit = await getBenefitDetails(params.benefitId)
        if (benefit) {
            return {
                success: true,
                data: benefit,
                message: `Details for ${benefit.name}`,
            }
        }
        return { success: false, error: 'Benefit not found' }
    },
})

const assignBenefitTool = defineTool({
    name: 'assign_benefit',
    description: 'Assign a benefit to an employee. Calculates förmånsvärde automatically.',
    parameters: {
        type: 'object' as const,
        properties: {
            employeeName: { type: 'string', description: 'Name of the employee' },
            benefitType: { type: 'string', description: 'ID of the benefit type' },
            amount: { type: 'number', description: 'Amount in SEK' },
            year: { type: 'number', description: 'Year for the benefit' },
            month: { type: 'number', description: 'Month for the benefit (optional)' },
        },
        required: ['employeeName', 'benefitType', 'amount', 'year'],
    },
    requiresConfirmation: true,
    category: 'write',
    execute: async (params: { employeeName: string; benefitType: string; amount: number; year: number; month?: number }) => {
        const result = await assignBenefit(params)
        if (result) {
            return {
                success: true,
                data: result,
                message: `Benefit assigned to ${params.employeeName}`,
            }
        }
        return { success: false, error: 'Failed to assign benefit' }
    },
})

const suggestUnusedBenefitsTool = defineTool({
    name: 'suggest_unused_benefits',
    description: 'Suggest tax-free benefits that an employee has not used yet this year.',
    parameters: {
        type: 'object' as const,
        properties: {
            employeeName: { type: 'string', description: 'Name of the employee' },
            year: { type: 'number', description: 'Year to check' },
        },
        required: ['employeeName', 'year'],
    },
    requiresConfirmation: false,
    category: 'read',
    execute: async (params: { employeeName: string; year: number }) => {
        const suggestions = await suggestUnusedBenefits(params.employeeName, params.year)
        return {
            success: true,
            data: suggestions,
            message: suggestions.length > 0
                ? `${suggestions.length} unused tax-free benefits available`
                : 'All tax-free benefits have been used',
        }
    },
})

// =============================================================================
// Investment Tools
// =============================================================================

const getInvestmentSummaryTool = defineTool({
    name: 'get_investment_summary',
    description: 'Get a summary of all company investments: properties, shares, and crypto holdings.',
    parameters: {
        type: 'object' as const,
        properties: {},
    },
    requiresConfirmation: false,
    category: 'read',
    execute: async () => {
        const summary = await getInvestmentSummary()
        return {
            success: true,
            data: summary,
            message: `Portfolio: ${summary.properties.count} properties, ${summary.shares.count} shares, ${summary.crypto.count} crypto`,
        }
    },
})

const listPropertiesTool = defineTool({
    name: 'list_properties',
    description: 'List all company properties (fastigheter) with depreciation and book values.',
    parameters: {
        type: 'object' as const,
        properties: {},
    },
    requiresConfirmation: false,
    category: 'read',
    execute: async () => {
        const properties = await listProperties()
        return {
            success: true,
            data: properties,
            message: `Found ${properties.length} properties`,
        }
    },
})

const listShareHoldingsTool = defineTool({
    name: 'list_share_holdings',
    description: 'List all share holdings (aktieinnehav) in other companies.',
    parameters: {
        type: 'object' as const,
        properties: {},
    },
    requiresConfirmation: false,
    category: 'read',
    execute: async () => {
        const shares = await listShareHoldings()
        return {
            success: true,
            data: shares,
            message: `Found ${shares.length} share holdings`,
        }
    },
})

const listCryptoHoldingsTool = defineTool({
    name: 'list_crypto_holdings',
    description: 'List all cryptocurrency holdings.',
    parameters: {
        type: 'object' as const,
        properties: {},
    },
    requiresConfirmation: false,
    category: 'read',
    execute: async () => {
        const crypto = await listCryptoHoldings()
        return {
            success: true,
            data: crypto,
            message: `Found ${crypto.length} crypto holdings`,
        }
    },
})

// =============================================================================
// Export All Tools
// =============================================================================

export const taxPlanningTools: AITool<any, any>[] = [
    // Periodiseringsfonder
    listPeriodiseringsfondsTools,
    createPeriodiseringsfondTool,
    dissolvePeriodiseringsfondTool,
    getExpiringFonderTool,
    // Förmåner
    listBenefitsTool,
    getBenefitDetailsTool,
    assignBenefitTool,
    suggestUnusedBenefitsTool,
    // Investments
    getInvestmentSummaryTool,
    listPropertiesTool,
    listShareHoldingsTool,
    listCryptoHoldingsTool,
]
