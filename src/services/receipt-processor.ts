/**
 * Receipt Processor Service
 * 
 * Takes NAKED receipts (raw scan/upload data) and "clothes" them:
 * - Adds display properties (icons, colors)
 * - Adds status
 * - Runs AI categorization for BAS account
 */

import { RECEIPT_STATUSES, type ReceiptStatus } from "@/lib/status-types"

// ============================================================================
// Types
// ============================================================================

/**
 * Raw receipt from scan/upload - "naked" with only OCR/extracted data
 */
export interface NakedReceipt {
  id: string
  vendor: string           // "ESPRESSO HOUSE" - from OCR
  amount: number           // 89.00 - extracted amount
  date: string             // "2025-12-10" - ISO date
  imageUrl?: string        // URL to uploaded image
  ocrText?: string         // Raw OCR text
}

/**
 * AI categorization suggestion for receipt
 */
export interface ReceiptAISuggestion {
  category: string
  account: string
  confidence: number
  reasoning?: string
}

/**
 * Fully processed receipt ready for display
 */
export interface ProcessedReceipt {
  id: string
  supplier: string
  date: string
  amount: string
  amountValue: number
  category: string
  iconName: string
  iconColor: string
  status: ReceiptStatus
  hasAttachment: boolean
  attachmentUrl?: string
  linkedTransaction?: string
  aiSuggestion?: ReceiptAISuggestion
}

// ============================================================================
// Category Icon & Color Mappings
// ============================================================================

export function getReceiptIconForCategory(category: string): string {
  const iconMap: Record<string, string> = {
    // Swedish categories
    'Representation': 'Coffee',
    'Kontorsmaterial': 'Tag',
    'Inventarier': 'Package',
    'IT-utrustning': 'Monitor',
    'Resekostnader': 'Plane',
    'Logi': 'Building2',
    'Drivmedel': 'Fuel',
    'Programvara': 'Smartphone',
    'Telefoni': 'Phone',
    'El': 'Zap',
    'Försäkringar': 'Shield',
    'Övriga kostnader': 'Tag',
    // English categories (for backward compatibility)
    'Software': 'Smartphone',
    'Travel': 'Plane',
    'Hosting': 'Server',
    'Office Supplies': 'Tag',
    'Equipment': 'Monitor',
    'Meals': 'Coffee',
  }
  return iconMap[category] || 'Receipt'
}

export function getReceiptIconColorForCategory(category: string): string {
  const colorMap: Record<string, string> = {
    // Swedish categories
    'Representation': 'text-amber-600',
    'Kontorsmaterial': 'text-orange-500',
    'Inventarier': 'text-indigo-500',
    'IT-utrustning': 'text-blue-500',
    'Resekostnader': 'text-purple-500',
    'Logi': 'text-indigo-500',
    'Drivmedel': 'text-yellow-600',
    'Programvara': 'text-blue-500',
    'Telefoni': 'text-cyan-500',
    'El': 'text-yellow-500',
    'Försäkringar': 'text-emerald-500',
    'Övriga kostnader': 'text-gray-500',
    // English categories (for backward compatibility)
    'Software': 'text-blue-500',
    'Travel': 'text-purple-500',
    'Hosting': 'text-green-500',
    'Office Supplies': 'text-orange-500',
    'Equipment': 'text-gray-500',
    'Meals': 'text-amber-600',
  }
  return colorMap[category] || 'text-gray-500'
}

// ============================================================================
// AI Categorization
// ============================================================================

export function getReceiptAICategorization(vendor: string, amount: number): ReceiptAISuggestion {
  const upperVendor = vendor.toUpperCase()
  
  // Food & Representation
  if (upperVendor.includes("ESPRESSO") || upperVendor.includes("STARBUCKS") || 
      upperVendor.includes("COFFEE") || upperVendor.includes("WAYNE") ||
      upperVendor.includes("FIKA")) {
    return {
      category: "Representation",
      account: "6072",
      confidence: 70,
      reasoning: "Kafé - möjlig representation"
    }
  }
  
  if (upperVendor.includes("MAX") || upperVendor.includes("MCDONALDS") || 
      upperVendor.includes("BURGER") || upperVendor.includes("RESTAURANG") ||
      upperVendor.includes("VAPIANO") || upperVendor.includes("BASTARD")) {
    return {
      category: "Representation",
      account: "6072",
      confidence: 65,
      reasoning: "Restaurang - verifiera om affärsmässig"
    }
  }
  
  // Office supplies
  if (upperVendor.includes("STAPLES") || upperVendor.includes("CLAS OHLSON") ||
      upperVendor.includes("KONTORS")) {
    return {
      category: "Kontorsmaterial",
      account: "6110",
      confidence: 85,
      reasoning: "Kontorsmaterialbutik identifierad"
    }
  }
  
  if (upperVendor.includes("IKEA")) {
    return {
      category: "Inventarier",
      account: "5410",
      confidence: 70,
      reasoning: "IKEA - kan vara kontor eller inventarier"
    }
  }
  
  if (upperVendor.includes("MEDIA MARKT") || upperVendor.includes("ELGIGANTEN") ||
      upperVendor.includes("WEBHALLEN") || upperVendor.includes("KOMPLETT")) {
    return {
      category: "IT-utrustning",
      account: "5411",
      confidence: 80,
      reasoning: "Elektronikbutik - troligt IT-inköp"
    }
  }
  
  // Travel
  if (upperVendor.includes("SAS") || upperVendor.includes("SJ ") ||
      upperVendor.includes("FLYGRESA") || upperVendor.includes("NORWEGIAN")) {
    return {
      category: "Resekostnader",
      account: "5800",
      confidence: 90,
      reasoning: "Transportbolag identifierat"
    }
  }
  
  if (upperVendor.includes("SCANDIC") || upperVendor.includes("NORDIC CHOICE") ||
      upperVendor.includes("HOTEL") || upperVendor.includes("BOOKING")) {
    return {
      category: "Logi",
      account: "5810",
      confidence: 88,
      reasoning: "Hotell/logi identifierat"
    }
  }
  
  if (upperVendor.includes("CIRCLE K") || upperVendor.includes("PREEM") ||
      upperVendor.includes("SHELL") || upperVendor.includes("OKQ8") ||
      upperVendor.includes("BENSIN")) {
    return {
      category: "Drivmedel",
      account: "5611",
      confidence: 85,
      reasoning: "Bränslestation identifierad"
    }
  }
  
  // Software/Subscriptions
  if (upperVendor.includes("SPOTIFY") || upperVendor.includes("ADOBE") ||
      upperVendor.includes("MICROSOFT") || upperVendor.includes("GOOGLE") ||
      upperVendor.includes("FIGMA") || upperVendor.includes("SLACK")) {
    return {
      category: "Programvara",
      account: "6540",
      confidence: 92,
      reasoning: "Programvaruleverantör identifierad"
    }
  }
  
  // Utilities
  if (upperVendor.includes("TELIA") || upperVendor.includes("TELENOR") ||
      upperVendor.includes("TRE ") || upperVendor.includes("COMVIQ")) {
    return {
      category: "Telefoni",
      account: "6212",
      confidence: 88,
      reasoning: "Teleoperatör identifierad"
    }
  }
  
  if (upperVendor.includes("VATTENFALL") || upperVendor.includes("EON") ||
      upperVendor.includes("FORTUM")) {
    return {
      category: "El",
      account: "5020",
      confidence: 85,
      reasoning: "Elleverantör identifierad"
    }
  }
  
  if (upperVendor.includes("FÖRSÄKRING") || upperVendor.includes("IF ") ||
      upperVendor.includes("TRYGG HANSA") || upperVendor.includes("LÄNSFÖRSÄKRING")) {
    return {
      category: "Försäkringar",
      account: "6310",
      confidence: 82,
      reasoning: "Försäkringsbolag identifierat"
    }
  }
  
  // Default
  return {
    category: "Övriga kostnader",
    account: "6990",
    confidence: 30,
    reasoning: "Okänd leverantör - manuell granskning krävs"
  }
}

// ============================================================================
// Main Processor
// ============================================================================

export function processReceipt(naked: NakedReceipt): ProcessedReceipt {
  const aiSuggestion = getReceiptAICategorization(naked.vendor, naked.amount)
  
  // Format amount
  const formattedAmount = new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(naked.amount) + ' kr'
  
  // Format date
  const dateObj = new Date(naked.date)
  const formattedDate = dateObj.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  
  return {
    id: naked.id,
    supplier: naked.vendor,
    date: formattedDate,
    amount: formattedAmount,
    amountValue: naked.amount,
    category: aiSuggestion.category,
    iconName: getReceiptIconForCategory(aiSuggestion.category),
    iconColor: getReceiptIconColorForCategory(aiSuggestion.category),
    status: RECEIPT_STATUSES.PENDING as ReceiptStatus,
    hasAttachment: !!naked.imageUrl,
    attachmentUrl: naked.imageUrl,
    aiSuggestion,
  }
}

export function processReceipts(naked: NakedReceipt[]): ProcessedReceipt[] {
  return naked.map(processReceipt)
}
