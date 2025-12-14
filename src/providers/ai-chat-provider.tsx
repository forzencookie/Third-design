"use client"

import * as React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { AIChatDialog } from "@/components/ui/ai-chat-dialog"

interface AIChatContextType {
  isOpen: boolean
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined)

export function useAIChat() {
  const context = useContext(AIChatContext)
  if (!context) {
    throw new Error("useAIChat must be used within an AIChatProvider")
  }
  return context
}

export function AIChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openChat = useCallback(() => setIsOpen(true), [])
  const closeChat = useCallback(() => setIsOpen(false), [])
  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), [])

  return (
    <AIChatContext.Provider value={{ isOpen, openChat, closeChat, toggleChat }}>
      {children}
      <AIChatDialog isOpen={isOpen} onClose={closeChat} />
    </AIChatContext.Provider>
  )
}
