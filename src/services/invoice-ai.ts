import OpenAI from 'openai'
import { InvoiceDocumentData } from '@/types/documents'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 10000, // 10 second timeout for invoice processing
})

interface AIInvoiceAnalysis {
    accountingCategory: string // e.g., "5420 - Programvara"
    accountingCode: string // e.g., "5420"
    isRecurring: boolean
    confidence: number // 0-1
    suggestedNote: string
    flags: string[] // Any concerns or anomalies
}

/**
 * Uses OpenAI to intelligently analyze an invoice and suggest
 * accounting treatment, categorization, and flag any issues
 */
export async function analyzeInvoiceWithAI(
    invoice: InvoiceDocumentData
): Promise<AIInvoiceAnalysis> {
    try {
        const prompt = `You are an expert Swedish accountant analyzing a supplier invoice for categorization.

Company: ${invoice.companyName}
Amount: ${invoice.total} kr
Line items:
${invoice.lineItems.map(item => `- ${item.description}: ${item.amount} kr`).join('\n')}
Invoice date: ${invoice.invoiceDate}
Due date: ${invoice.dueDate}

Analyze this invoice and provide:
1. The correct Swedish accounting code (kontoplan) - common codes:
   - 5400: Software/SaaS subscriptions
   - 5410: Telecom
   - 5420: Software licenses
   - 6540: Web hosting/domains
   - 6230: Electricity
   - 6250: Heating
2. Whether this appears to be a recurring monthly expense
3. Any concerns or red flags (unusual amounts, suspicious items, etc.)
4. A brief note for the accounting record

Respond in JSON format only:
{
  "accountingCode": "5400",
  "accountingCategory": "Software subscriptions",
  "isRecurring": true/false,
  "confidence": 0-1,
  "suggestedNote": "Brief description",
  "flags": ["Any concerns"]
}`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Fast and cost-effective
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert Swedish accountant. Always respond with valid JSON only, no markdown.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3, // Low temperature for consistent categorization
            response_format: { type: 'json_object' }
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No response from OpenAI')
        }

        const analysis: AIInvoiceAnalysis = JSON.parse(content)

        console.log('[AI Analysis]', {
            company: invoice.companyName,
            category: analysis.accountingCategory,
            confidence: analysis.confidence
        })

        return analysis
    } catch (error) {
        console.error('[AI Analysis Error]', error)
        // Fallback to basic categorization if AI fails
        return {
            accountingCategory: 'General expense',
            accountingCode: '6000',
            isRecurring: false,
            confidence: 0,
            suggestedNote: 'Auto-categorized (AI unavailable)',
            flags: []
        }
    }
}
