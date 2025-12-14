"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ============================================================================
// HelperText - Muted descriptive text pattern
// Replaces: className="text-sm text-muted-foreground"
// ============================================================================

export interface HelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Size variant */
  size?: "xs" | "sm" | "base"
  /** Whether to render as span instead of p */
  as?: "p" | "span" | "div"
}

export function HelperText({ 
  className, 
  size = "sm",
  as: Component = "p",
  children,
  ...props 
}: HelperTextProps) {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm", 
    base: "text-base",
  }

  return (
    <Component
      className={cn(sizeClasses[size], "text-muted-foreground", className)}
      {...props}
    >
      {children}
    </Component>
  )
}

// ============================================================================
// FormLabel - Form label pattern
// Replaces: className="text-sm font-medium"
// ============================================================================

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Whether the field is required */
  required?: boolean
}

export function FormLabel({ 
  className, 
  required,
  children,
  ...props 
}: FormLabelProps) {
  return (
    <label
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  )
}

// ============================================================================
// FormField - Combined label + input wrapper
// ============================================================================

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Field label */
  label?: string
  /** Helper text below the input */
  helper?: string
  /** Error message */
  error?: string
  /** Whether the field is required */
  required?: boolean
  /** Label htmlFor attribute */
  htmlFor?: string
}

export function FormField({
  className,
  label,
  helper,
  error,
  required,
  htmlFor,
  children,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label && (
        <FormLabel htmlFor={htmlFor} required={required}>
          {label}
        </FormLabel>
      )}
      {children}
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : helper ? (
        <HelperText size="xs">{helper}</HelperText>
      ) : null}
    </div>
  )
}
