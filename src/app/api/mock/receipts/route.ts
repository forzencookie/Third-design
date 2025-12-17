/**
 * Mock Receipts API - NAKED RECEIPTS with VISUAL DATA
 * 
 * Simulates OCR/scan data from receipt uploads
 * Returns raw extracted data + visual data for preview
 */

import { NextRequest, NextResponse } from "next/server"
import type { NakedReceipt } from "@/services/receipt-processor"
import type { ReceiptDocumentData } from "@/types/documents"

// In-memory storage
const mockReceipts: Map<string, NakedReceipt & { visualData?: ReceiptDocumentData }> = new Map()

// ============================================================================
// Naked Receipt Templates - Only raw OCR-like data
// ============================================================================

interface ReceiptTemplate {
  vendor: string
  amountRange: [number, number]
  category: ReceiptType
  logo: string
  lineItems: string[]
}

const RECEIPT_TEMPLATES: Record<string, ReceiptTemplate[]> = {
  restaurant: [
    {
      vendor: "ESPRESSO HOUSE AB",
      amountRange: [45, 150],
      category: "restaurant",
      logo: "https://ui-avatars.com/api/?name=Espresso+House&background=8B4513&color=fff&size=128&bold=true",
      lineItems: ["Caffè Latte Grande", "Croissant", "Bryggkaffe", "Chokladboll", "Focaccia"]
    },
    {
      vendor: "MAX BURGERS",
      amountRange: [89, 220],
      category: "restaurant",
      logo: "https://ui-avatars.com/api/?name=MAX&background=CC0000&color=fff&size=128&bold=true",
      lineItems: ["Originalmål", "Dippsås", "Coca-Cola Zero", "Veggie Burger", "Chili Cheese"]
    },
    {
      vendor: "VAPIANO SWEDEN",
      amountRange: [120, 350],
      category: "restaurant",
      logo: "https://ui-avatars.com/api/?name=Vapiano&background=228B22&color=fff&size=128&bold=true",
      lineItems: ["Pasta Carbonara", "Pizza Margherita", "Insalata Mista", "Aqua Panna", "Tiramisu"]
    },
    {
      vendor: "STARBUCKS",
      amountRange: [55, 120],
      category: "restaurant",
      logo: "https://ui-avatars.com/api/?name=Starbucks&background=00704A&color=fff&size=128&bold=true",
      lineItems: ["Caramel Macchiato", "Blueberry Muffin", "Cold Brew", "Cheesecake", "Bagel"]
    },
  ],
  office: [
    {
      vendor: "STAPLES SWEDEN AB",
      amountRange: [200, 2500],
      category: "office",
      logo: "https://ui-avatars.com/api/?name=Staples&background=CC0000&color=fff&size=128&bold=true",
      lineItems: ["Kopieringspapper A4", "Kulspetspenna Blå", "Häftapparat", "Tejp", "Mapp"]
    },
    {
      vendor: "CLAS OHLSON AB",
      amountRange: [100, 1800],
      category: "office",
      logo: "https://ui-avatars.com/api/?name=Clas+Ohlson&background=008000&color=fff&size=128&bold=true",
      lineItems: ["Skarvsladd 3m", "Förvaringslåda", "Batterier AA", "Glödlampa LED", "Verktygssats"]
    },
    {
      vendor: "IKEA AB",
      amountRange: [500, 8000],
      category: "office",
      logo: "https://ui-avatars.com/api/?name=IKEA&background=0051BA&color=FFDA1A&size=128&bold=true",
      lineItems: ["Skrivbordslampa", "Kontorsstol Markus", "Kallax Hylla", "Växt", "Kruka"]
    },
  ],
  travel: [
    {
      vendor: "SAS SCANDINAVIAN",
      amountRange: [1500, 8500],
      category: "travel",
      logo: "https://ui-avatars.com/api/?name=SAS&background=000066&color=fff&size=128&bold=true",
      lineItems: ["Flygbiljett ARN-CPH", "Flygbiljett CPH-LHR", "Bagageavgift", "Lounge Access", "Wifi ombord"]
    },
    {
      vendor: "SJ AB",
      amountRange: [200, 1500],
      category: "travel",
      logo: "https://ui-avatars.com/api/?name=SJ&background=E30613&color=fff&size=128&bold=true",
      lineItems: ["Tågbiljett Sthlm-Gbg", "Platsreservation", "Kaffe Bistro", "Tågbiljett Gbg-Malmö", "Ombokningsbar"]
    },
    {
      vendor: "UBER *TRIP",
      amountRange: [89, 450],
      category: "travel",
      logo: "https://ui-avatars.com/api/?name=Uber&background=000000&color=fff&size=128&bold=true",
      lineItems: ["Resa till kontoret", "Resa till flygplatsen", "Resa till kundmöte", "Driks", "Väntetid"]
    },
  ],
  subscription: [
    {
      vendor: "SPOTIFY AB",
      amountRange: [129, 169],
      category: "subscription",
      logo: "https://ui-avatars.com/api/?name=Spotify&background=1DB954&color=fff&size=128&bold=true",
      lineItems: ["Premium Individual", "Premium Duo", "Premium Family"]
    },
    {
      vendor: "ADOBE SYSTEMS",
      amountRange: [149, 599],
      category: "subscription",
      logo: "https://ui-avatars.com/api/?name=Adobe&background=FF0000&color=fff&size=128&bold=true",
      lineItems: ["Creative Cloud All Apps", "Photoshop Plan", "Illustrator Plan", "Acrobat Pro"]
    },
    {
      vendor: "MICROSOFT IRELAND",
      amountRange: [100, 450],
      category: "subscription",
      logo: "/logos/microsoft.png",
      lineItems: ["Microsoft 365 Business", "Azure Subscription", "Office 365 E3"]
    },
  ],
  utility: [
    {
      vendor: "TELIA COMPANY",
      amountRange: [299, 899],
      category: "utility",
      logo: "/logos/telia.png",
      lineItems: ["Företagsabonnemang 20GB", "Växeltjänst", "Mobilt Bredband", "Öppningsavgift"]
    },
    {
      vendor: "VATTENFALL AB",
      amountRange: [500, 2500],
      category: "utility",
      logo: "https://ui-avatars.com/api/?name=Vattenfall&background=FFD200&color=000&size=128&bold=true",
      lineItems: ["Elhandel Rörligt", "Elnät Säkringsavgift", "Elöverföring", "Energiskatt"]
    },
  ],
}

type ReceiptType = keyof typeof RECEIPT_TEMPLATES

// ============================================================================
// Helpers
// ============================================================================

function generateId(): string {
  return `rcpt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

function randomDate(daysBack: number = 30): string {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * daysBack)
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  return date.toISOString().split('T')[0]
}

function generateVisualData(template: ReceiptTemplate, totalAmount: number, date: string): ReceiptDocumentData {
  // Generate 1-4 random line items that sum up to roughly the total amount
  const itemCount = Math.floor(Math.random() * 3) + 1;
  let currentTotal = 0;
  const lineItems = [];

  // VAT rate varies by category
  const vatRate = template.category === 'restaurant' ? 12 :
    template.category === 'travel' ? 6 : 25;

  for (let i = 0; i < itemCount - 1; i++) {
    const itemAmount = Math.round((totalAmount / itemCount) * (0.8 + Math.random() * 0.4));
    currentTotal += itemAmount;

    lineItems.push({
      description: template.lineItems[Math.floor(Math.random() * template.lineItems.length)],
      quantity: 1,
      unitPrice: itemAmount,
      vatRate,
      amount: itemAmount
    });
  }

  // Last item takes the remainder to match exact total
  const lastItemAmount = Math.round((totalAmount - currentTotal) * 100) / 100;
  lineItems.push({
    description: template.lineItems[Math.floor(Math.random() * template.lineItems.length)],
    quantity: 1,
    unitPrice: lastItemAmount,
    vatRate,
    amount: lastItemAmount
  });

  // Recalculate VAT
  const vatAmount = Math.round(totalAmount * (vatRate / (100 + vatRate)) * 100) / 100;
  const subtotal = Math.round((totalAmount - vatAmount) * 100) / 100;

  return {
    type: 'receipt',
    companyName: template.vendor,
    companyLogo: template.logo,
    companyAddress: "Storgatan 12, 111 22 Stockholm",
    companyOrgNr: "556000-0000",

    receiptNumber: Math.floor(Math.random() * 1000000).toString(),
    receiptDate: date,
    receiptTime: `${Math.floor(Math.random() * 14) + 8}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,

    storeName: "Stockholm City",
    cashierName: ["Anna", "Erik", "Maria", "Johan"][Math.floor(Math.random() * 4)],

    lineItems,

    subtotal,
    vatAmount,
    total: totalAmount,
    paymentMethod: 'Kort',
    cardLastFour: Math.floor(Math.random() * 9000 + 1000).toString()
  };
}

function generateNakedReceipt(type: ReceiptType): NakedReceipt & { visualData?: ReceiptDocumentData } {
  const templates = RECEIPT_TEMPLATES[type]
  const template = templates[Math.floor(Math.random() * templates.length)]

  const amount = randomAmount(template.amountRange[0], template.amountRange[1]);
  const date = randomDate(14);
  const id = generateId();

  const visualData = generateVisualData(template, amount, date);

  return {
    id,
    vendor: template.vendor,
    amount,
    date,
    imageUrl: `https://placehold.co/400x600/f5f5f5/666?text=${encodeURIComponent(template.vendor)}`,
    visualData
  }
}

// ============================================================================
// API Handlers
// ============================================================================

/**
 * GET /api/mock/receipts
 * Returns all NAKED receipts
 */
export async function GET() {
  try {
    const receipts = Array.from(mockReceipts.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 100)

    return NextResponse.json({
      receipts,
      count: receipts.length,
      type: "naked",
      note: "Process with receipt-processor service to add display properties"
    })
  } catch (error) {
    console.error('Error fetching receipts:', error)
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 })
  }
}

/**
 * POST /api/mock/receipts
 * Create a new NAKED receipt
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type = 'office' } = body

    const naked = generateNakedReceipt(type as ReceiptType)
    mockReceipts.set(naked.id, naked)

    return NextResponse.json({
      receipt: naked,
      stored: true,
      type: "naked",
      message: "Raw receipt created - use receipt-processor to add display properties"
    })
  } catch (error) {
    console.error('Error creating receipt:', error)
    return NextResponse.json({ error: 'Failed to create receipt' }, { status: 500 })
  }
}

/**
 * DELETE /api/mock/receipts
 */
export async function DELETE() {
  try {
    const count = mockReceipts.size
    mockReceipts.clear()
    return NextResponse.json({ message: `Deleted ${count} mock receipts` })
  } catch (error) {
    console.error('Error deleting receipts:', error)
    return NextResponse.json({ error: 'Failed to delete receipts' }, { status: 500 })
  }
}
