import OpenAI from 'openai'
import type { InboxItem } from '@/types'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 15000,
})

interface ExtractedInvoiceData {
    supplier: string
    invoiceNumber: string | null
    amount: number
    date: string
    dueDate: string | null
    ocrNumber: string | null
    accountingCategory: string
    accountingCode: string
    note: string
    isPaid: boolean
}

/**
 * TRUE OCR - Uses GPT to extract ALL invoice data from raw email text
 * Simulates reading a PDF/image and extracting structured data
 */
export async function extractInvoiceDataWithGPT(
    item: InboxItem
): Promise<ExtractedInvoiceData | null> {
    try {
        const emailText = `
From: ${item.sender}
Subject: ${item.title}
Body:
${item.description}
`

        const prompt = `You are an AI OCR system reading an email about an invoice or receipt. Extract ALL invoice information from this text.

${emailText}

Extract and return JSON with:
{
  "supplier": "Company name",
  "invoiceNumber": "Invoice/receipt number or null",
  "amount": numeric total amount in kr,
  "date": "YYYY-MM-DD" (invoice/payment date),
  "dueDate": "YYYY-MM-DD" or null if not mentioned,
  "ocrNumber": "OCR/reference number or null",
  "accountingCategory": "Swedish category (e.g. Electricity, Software)",
  "accountingCode": "Code like 6230, 5400, etc",
  "note": "Brief note describing the expense",
  "isPaid": true if already paid/charged, false if needs payment
}

Common accounting codes:
- 6230: Electricity
- 5400: Software/SaaS
- 5420: Software licenses
- 6540: Web hosting/domains

Look for keywords like "charged", "payment", "automatic" to determine if already paid.`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an OCR system. Extract invoice data from text. Return only valid JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' }
        })

        const content = response.choices[0]?.message?.content
        if (!content) return null

        const data: ExtractedInvoiceData = JSON.parse(content)

        console.log('[AI OCR]', {
            supplier: data.supplier,
            amount: data.amount,
            invoiceNumber: data.invoiceNumber,
            isPaid: data.isPaid
        })

        return data
    } catch (error) {
        console.error('[AI OCR Error]', error)
        return null
    }
}
