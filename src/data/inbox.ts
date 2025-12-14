// ============================================
// Inbox Mock Data
// ============================================

import type { InboxItem, InboxCategory } from "@/types"

// ============================================
// Category Configuration
// ============================================

export const categoryColors: Record<InboxCategory, string> = {
  skatt: "text-muted-foreground",
  myndighet: "text-muted-foreground",
  faktura: "text-muted-foreground",
  other: "text-muted-foreground",
}

export const categoryLabels: Record<InboxCategory, string> = {
  skatt: "Skatt",
  myndighet: "Myndighet",
  faktura: "Faktura",
  other: "Övrigt",
}

// ============================================
// Inbox Items (Kivra mail)
// ============================================

// ============================================
// Inbox Items (Kivra mail)
// ============================================

export const mockInboxItems: InboxItem[] = []
