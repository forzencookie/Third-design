/**
 * Payroll Processor Service
 * 
 * Takes NAKED payroll data and "clothes" them:
 * - Lönebesked (payslips)
 * - AGI reports
 * - Employees
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Raw employee data - "naked"
 */
export interface NakedEmployee {
  id: string
  name: string
  role: string
  monthlySalary: number
  taxRate: number          // 0.24 = 24%
  startDate: string
}

/**
 * Raw payslip data - "naked"
 */
export interface NakedPayslip {
  id: string
  employeeId: string
  employeeName: string
  period: string           // "December 2024"
  grossSalary: number
  taxDeduction: number
  otherDeductions?: number
  bonuses?: number
  status: 'draft' | 'pending' | 'sent'
}

/**
 * Raw AGI report data - "naked"
 */
export interface NakedAGIReport {
  id: string
  period: string           // "December 2024"
  dueDate: string          // "2025-01-12"
  employeeCount: number
  totalGrossSalary: number
  totalTaxDeduction: number
  employerContributions: number
  status: 'draft' | 'pending' | 'submitted'
}

// ============================================================================
// Processed Types
// ============================================================================

export interface ProcessedEmployee {
  id: string
  name: string
  role: string
  lastSalary: number
  taxRate: number
  startDate: string
}

export interface ProcessedPayslip {
  id: string
  employee: string
  period: string
  grossSalary: number
  tax: number
  netSalary: number
  status: 'Utkast' | 'Väntar' | 'Skickad'
}

export interface ProcessedAGIReport {
  period: string
  dueDate: string
  employees: number
  totalSalary: number
  tax: number
  contributions: number
  status: 'Utkast' | 'Väntar' | 'Inskickad'
}

// ============================================================================
// Status Mappings
// ============================================================================

const PAYSLIP_STATUS_MAP: Record<NakedPayslip['status'], ProcessedPayslip['status']> = {
  draft: 'Utkast',
  pending: 'Väntar',
  sent: 'Skickad',
}

const AGI_STATUS_MAP: Record<NakedAGIReport['status'], ProcessedAGIReport['status']> = {
  draft: 'Utkast',
  pending: 'Väntar',
  submitted: 'Inskickad',
}

// ============================================================================
// Processors
// ============================================================================

export function processEmployee(naked: NakedEmployee): ProcessedEmployee {
  return {
    id: naked.id,
    name: naked.name,
    role: naked.role,
    lastSalary: naked.monthlySalary,
    taxRate: naked.taxRate,
    startDate: naked.startDate,
  }
}

export function processPayslip(naked: NakedPayslip): ProcessedPayslip {
  const bonuses = naked.bonuses || 0
  const otherDeductions = naked.otherDeductions || 0
  const netSalary = naked.grossSalary + bonuses - naked.taxDeduction - otherDeductions
  
  return {
    id: naked.id,
    employee: naked.employeeName,
    period: naked.period,
    grossSalary: naked.grossSalary + bonuses,
    tax: naked.taxDeduction,
    netSalary,
    status: PAYSLIP_STATUS_MAP[naked.status],
  }
}

export function processAGIReport(naked: NakedAGIReport): ProcessedAGIReport {
  return {
    period: naked.period,
    dueDate: naked.dueDate,
    employees: naked.employeeCount,
    totalSalary: naked.totalGrossSalary,
    tax: naked.totalTaxDeduction,
    contributions: naked.employerContributions,
    status: AGI_STATUS_MAP[naked.status],
  }
}

export function processEmployees(naked: NakedEmployee[]): ProcessedEmployee[] {
  return naked.map(processEmployee)
}

export function processPayslips(naked: NakedPayslip[]): ProcessedPayslip[] {
  return naked.map(processPayslip)
}

export function processAGIReports(naked: NakedAGIReport[]): ProcessedAGIReport[] {
  return naked.map(processAGIReport)
}

// ============================================================================
// Mock Data Generators
// ============================================================================

export function generateMockEmployees(): ProcessedEmployee[] {
  const mockNaked: NakedEmployee[] = [
    { id: "anna", name: "Anna Andersson", role: "VD", monthlySalary: 45000, taxRate: 0.24, startDate: "2020-01-15" },
    { id: "erik", name: "Erik Eriksson", role: "Utvecklare", monthlySalary: 40000, taxRate: 0.24, startDate: "2021-03-01" },
  ]
  return processEmployees(mockNaked)
}

export function generateMockPayslips(): ProcessedPayslip[] {
  const mockNaked: NakedPayslip[] = [
    { id: "1", employeeId: "anna", employeeName: "Anna Andersson", period: "December 2024", grossSalary: 45000, taxDeduction: 10800, status: "pending" },
    { id: "2", employeeId: "erik", employeeName: "Erik Eriksson", period: "December 2024", grossSalary: 40000, taxDeduction: 9600, status: "pending" },
    { id: "3", employeeId: "anna", employeeName: "Anna Andersson", period: "November 2024", grossSalary: 45000, taxDeduction: 10800, status: "sent" },
    { id: "4", employeeId: "erik", employeeName: "Erik Eriksson", period: "November 2024", grossSalary: 40000, taxDeduction: 9600, status: "sent" },
    { id: "5", employeeId: "anna", employeeName: "Anna Andersson", period: "Oktober 2024", grossSalary: 45000, taxDeduction: 10800, status: "sent" },
    { id: "6", employeeId: "erik", employeeName: "Erik Eriksson", period: "Oktober 2024", grossSalary: 40000, taxDeduction: 9600, status: "sent" },
  ]
  return processPayslips(mockNaked)
}

export function generateMockAGIReports(): ProcessedAGIReport[] {
  const mockNaked: NakedAGIReport[] = [
    { id: "agi-1", period: "December 2024", dueDate: "12 jan 2025", employeeCount: 2, totalGrossSalary: 85000, totalTaxDeduction: 20400, employerContributions: 26690, status: "pending" },
    { id: "agi-2", period: "November 2024", dueDate: "12 dec 2024", employeeCount: 2, totalGrossSalary: 85000, totalTaxDeduction: 20400, employerContributions: 26690, status: "submitted" },
    { id: "agi-3", period: "Oktober 2024", dueDate: "12 nov 2024", employeeCount: 2, totalGrossSalary: 85000, totalTaxDeduction: 20400, employerContributions: 26690, status: "submitted" },
    { id: "agi-4", period: "September 2024", dueDate: "12 okt 2024", employeeCount: 2, totalGrossSalary: 85000, totalTaxDeduction: 20400, employerContributions: 26690, status: "submitted" },
  ]
  return processAGIReports(mockNaked)
}
