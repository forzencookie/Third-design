"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ============================================================================
// FieldGrid - Two-column form layout pattern
// Replaces: className="grid grid-cols-2 gap-4"
// ============================================================================

export interface FieldGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns (responsive by default) */
  columns?: 1 | 2 | 3 | 4
  /** Gap between items */
  gap?: "2" | "3" | "4" | "6" | "8"
  /** Whether to stack on mobile */
  responsive?: boolean
}

export function FieldGrid({ 
  className, 
  columns = 2,
  gap = "4",
  responsive = true,
  children,
  ...props 
}: FieldGridProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: responsive ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2",
    3: responsive ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-3",
    4: responsive ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-4",
  }

  const gapClasses = {
    "2": "gap-2",
    "3": "gap-3",
    "4": "gap-4",
    "6": "gap-6",
    "8": "gap-8",
  }

  return (
    <div
      className={cn("grid", columnClasses[columns], gapClasses[gap], className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================================================
// DialogBody - Dialog content wrapper pattern
// Replaces: className="space-y-4 py-4"
// ============================================================================

export interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spacing between children */
  spacing?: "2" | "3" | "4" | "6"
  /** Vertical padding */
  padding?: "2" | "3" | "4" | "6"
}

export function DialogBody({ 
  className, 
  spacing = "4",
  padding = "4",
  children,
  ...props 
}: DialogBodyProps) {
  const spacingClasses = {
    "2": "space-y-2",
    "3": "space-y-3",
    "4": "space-y-4",
    "6": "space-y-6",
  }

  const paddingClasses = {
    "2": "py-2",
    "3": "py-3",
    "4": "py-4",
    "6": "py-6",
  }

  return (
    <div
      className={cn(spacingClasses[spacing], paddingClasses[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================================================
// DetailsGrid - Label/value display pairs pattern
// ============================================================================

export interface DetailsGridProps extends React.HTMLAttributes<HTMLDListElement> {
  /** Items to display */
  items: Array<{
    label: string
    value: React.ReactNode
    hidden?: boolean
  }>
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4
  /** Gap between items */
  gap?: "2" | "3" | "4" | "6"
}

export function DetailsGrid({ 
  className, 
  items,
  columns = 2,
  gap = "4",
  ...props 
}: DetailsGridProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }

  const gapClasses = {
    "2": "gap-2",
    "3": "gap-3",
    "4": "gap-4",
    "6": "gap-6",
  }

  const visibleItems = items.filter(item => !item.hidden)

  return (
    <dl
      className={cn("grid", columnClasses[columns], gapClasses[gap], className)}
      {...props}
    >
      {visibleItems.map((item, index) => (
        <div key={index} className="space-y-1">
          <dt className="text-sm font-medium text-muted-foreground">
            {item.label}
          </dt>
          <dd className="text-sm">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

// ============================================================================
// DetailsRow - Single label/value row
// ============================================================================

export interface DetailsRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: React.ReactNode
  /** Layout direction */
  direction?: "horizontal" | "vertical"
}

export function DetailsRow({
  className,
  label,
  value,
  direction = "horizontal",
  ...props
}: DetailsRowProps) {
  if (direction === "vertical") {
    return (
      <div className={cn("space-y-1", className)} {...props}>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-between", className)} {...props}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
