"use client"

import * as React from "react"
import { SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FilterButtonProps {
  onClick?: () => void
  isActive?: boolean
  activeCount?: number
  label?: string
  className?: string
  children?: React.ReactNode
}

export function FilterButton({
  onClick,
  isActive = false,
  activeCount,
  label,
  className,
  children,
  size = "sm",
}: FilterButtonProps & { size?: "default" | "sm" | "lg" | "icon" }) {
  return (
    <Button
      variant="outline"
      size={size}
      onClick={onClick}
      className={cn(
        "gap-2",
        isActive && "border-primary text-primary",
        className
      )}
    >
      {children ?? (
        <>
          <SlidersHorizontal className="h-4 w-4" />
          {label && <span>{label}</span>}
          {activeCount !== undefined && activeCount > 0 && (
            <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-xs">
              {activeCount}
            </span>
          )}
        </>
      )}
    </Button>
  )
}

// Icon-only variant for compact layouts
export function FilterButtonIcon({
  onClick,
  isActive = false,
  className,
}: Omit<FilterButtonProps, 'label' | 'activeCount' | 'children'>) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-8 w-8 p-0",
        isActive && "border-primary text-primary",
        className
      )}
    >
      <SlidersHorizontal className="h-4 w-4" />
    </Button>
  )
}
