/**
 * Calendar Processor Service
 * 
 * Takes NAKED calendar data and "clothes" them:
 * - Calendar events (deadlines, reminders, tax dates)
 * - Daily bookkeeping summaries
 */

import type { StatusVariant } from "@/components/ui/status-badge"

// ============================================================================
// Calendar Event Types
// ============================================================================

export type CalendarEventType = "deadline" | "reminder" | "tax" | "submission" | "meeting"

export interface NakedCalendarEvent {
  id: string
  title: string
  date: string // ISO date string from API
  type: string // Raw type from API
  description?: string
}

export interface ProcessedCalendarEvent {
  id: string
  title: string
  date: Date
  type: CalendarEventType
  description?: string
  statusVariant: StatusVariant
  iconName: string
}

// ============================================================================
// Daily Summary Types
// ============================================================================

export interface NakedDailySummary {
  date: string // ISO date string from API
  bookkeepingDone: boolean
  transactionsCount: number
  invoicesCount: number
  receiptsCount: number
  profitOrLoss: number
  notes?: string
}

export interface ProcessedDailySummary {
  date: Date
  bookkeepingDone: boolean
  transactionsCount: number
  invoicesCount: number
  receiptsCount: number
  profitOrLoss: number
  formattedProfitOrLoss: string
  profitOrLossLabel: "Vinst" | "Förlust" | "Noll"
  notes?: string
  statusVariant: StatusVariant
}

// ============================================================================
// Event Type Mappings
// ============================================================================

const EVENT_TYPE_MAP: Record<string, CalendarEventType> = {
  // Swedish
  deadline: "deadline",
  påminnelse: "reminder",
  reminder: "reminder",
  skatt: "tax",
  tax: "tax",
  inlämning: "submission",
  submission: "submission",
  möte: "meeting",
  meeting: "meeting",
}

const EVENT_TYPE_TO_VARIANT: Record<CalendarEventType, StatusVariant> = {
  deadline: "error",
  reminder: "violet",
  tax: "warning",
  submission: "purple",
  meeting: "success",
}

const EVENT_TYPE_TO_ICON: Record<CalendarEventType, string> = {
  deadline: "AlertTriangle",
  reminder: "Bell",
  tax: "Calculator",
  submission: "Send",
  meeting: "Users",
}

// ============================================================================
// Processor Functions
// ============================================================================

function normalizeEventType(rawType: string): CalendarEventType {
  const normalized = rawType.toLowerCase()
  return EVENT_TYPE_MAP[normalized] || "reminder"
}

export function processCalendarEvent(naked: NakedCalendarEvent): ProcessedCalendarEvent {
  const type = normalizeEventType(naked.type)
  
  return {
    id: naked.id,
    title: naked.title,
    date: new Date(naked.date),
    type,
    description: naked.description,
    statusVariant: EVENT_TYPE_TO_VARIANT[type],
    iconName: EVENT_TYPE_TO_ICON[type],
  }
}

export function processCalendarEvents(naked: NakedCalendarEvent[]): ProcessedCalendarEvent[] {
  return naked.map(processCalendarEvent)
}

// ============================================================================
// Daily Summary Processor
// ============================================================================

function formatRevenue(amount: number): string {
  if (amount === 0) return "0 kr"
  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? "-" : ""
  
  // Use full numbers for up to 5 figures (99 999), use tn for 6+ figures (100 000+)
  if (absAmount >= 100000) {
    const formatted = (absAmount / 1000).toFixed(0)
    return `${sign}${formatted}tn kr`
  }
  // Format with space as thousands separator for Swedish style
  const formatted = absAmount.toLocaleString("sv-SE")
  return `${sign}${formatted} kr`
}

function getProfitOrLossLabel(amount: number): "Vinst" | "Förlust" | "Noll" {
  if (amount > 0) return "Vinst"
  if (amount < 0) return "Förlust"
  return "Noll"
}

function getSummaryStatusVariant(summary: NakedDailySummary): StatusVariant {
  if (!summary.bookkeepingDone && summary.transactionsCount > 0) {
    return "warning" // Has transactions but not booked
  }
  if (summary.profitOrLoss < 0) {
    return "error" // Loss
  }
  if (summary.bookkeepingDone) {
    return "success" // All good
  }
  return "neutral"
}

export function processDailySummary(naked: NakedDailySummary): ProcessedDailySummary {
  return {
    date: new Date(naked.date),
    bookkeepingDone: naked.bookkeepingDone,
    transactionsCount: naked.transactionsCount,
    invoicesCount: naked.invoicesCount,
    receiptsCount: naked.receiptsCount,
    profitOrLoss: naked.profitOrLoss,
    formattedProfitOrLoss: formatRevenue(naked.profitOrLoss),
    profitOrLossLabel: getProfitOrLossLabel(naked.profitOrLoss),
    notes: naked.notes,
    statusVariant: getSummaryStatusVariant(naked),
  }
}

export function processDailySummaries(naked: NakedDailySummary[]): ProcessedDailySummary[] {
  return naked.map(processDailySummary)
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getEventTypeLabel(type: CalendarEventType): string {
  const labels: Record<CalendarEventType, string> = {
    deadline: "Deadline",
    reminder: "Påminnelse",
    tax: "Skatt",
    submission: "Inlämning",
    meeting: "Möte",
  }
  return labels[type]
}

export function getEventVariant(type: CalendarEventType): StatusVariant {
  return EVENT_TYPE_TO_VARIANT[type]
}

export function getEventIconName(type: CalendarEventType): string {
  return EVENT_TYPE_TO_ICON[type]
}
