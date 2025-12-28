"use client"

import * as React from "react"
import { Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"


interface FilterButtonProps extends React.ComponentProps<typeof Button> {
  isActive?: boolean
  activeCount?: number
  label?: string
}

const FilterButton = React.forwardRef<HTMLButtonElement, FilterButtonProps>(
  function FilterButton({ isActive = false, activeCount, label, className, children, ...props }, ref) {
    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        className={cn(
          "gap-2",
          isActive && "border-primary text-primary",
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            <Eye className="h-4 w-4" />

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
)

// Icon-only variant for compact layouts
const FilterButtonIcon = React.forwardRef<HTMLButtonElement, Omit<FilterButtonProps, 'label' | 'activeCount'>>(
  function FilterButtonIcon({ isActive = false, className, ...props }, ref) {
    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          isActive && "border-primary text-primary",
          className
        )}
        {...props}
      >
        <Eye className="h-4 w-4" />

      </Button>
    )
  }
)

export { FilterButton, FilterButtonIcon }
