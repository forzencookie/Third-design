"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface AiProcessingStateProps {
    messages?: string[]
    subtext?: string
    className?: string
}

const DEFAULT_MESSAGES = [
    "Analyserar...",
    "Bearbetar data...",
    "Hämtar information...",
    "Snart klar..."
]

export function AiProcessingState({
    messages = DEFAULT_MESSAGES,
    subtext,
    className
}: AiProcessingStateProps) {
    const [messageIndex, setMessageIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % messages.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [messages])

    return (
        <div className={cn("flex flex-col items-center justify-center py-12 gap-6", className)}>
            <div className="h-16 w-16 rounded-full border-4 border-muted border-t-primary animate-spin" />
            <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg animate-in fade-in slide-in-from-bottom-2 duration-300 key={messageIndex}">
                    {messages[messageIndex]}
                </h3>
                {subtext && (
                    <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                        {subtext}
                    </p>
                )}
            </div>
        </div>
    )
}
