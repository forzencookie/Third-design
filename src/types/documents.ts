// Document data types for invoices and receipts

export interface InvoiceDocumentData {
    type: 'invoice'
    companyName: string
    companyLogo: string // Path to logo in /public/logos/
    companyAddress: string
    companyOrgNr: string
    companyPhone?: string
    companyEmail?: string

    invoiceNumber: string
    invoiceDate: string
    dueDate: string

    customerName: string
    customerAddress?: string

    lineItems: Array<{
        description: string
        quantity: number
        unitPrice: number
        vatRate: number // 25, 12, 6, or 0
        amount: number
    }>

    subtotal: number
    vatAmount: number
    total: number

    paymentInfo: {
        bankgiro?: string
        plusgiro?: string
        ocrNumber: string
        iban?: string
        bic?: string
    }

    notes?: string
}

export interface ReceiptDocumentData {
    type: 'receipt'
    companyName: string
    companyLogo: string
    companyAddress: string
    companyOrgNr: string

    receiptNumber: string
    receiptDate: string
    receiptTime: string

    storeName?: string
    cashierName?: string

    lineItems: Array<{
        description: string
        quantity: number
        unitPrice: number
        vatRate: number
        amount: number
    }>

    subtotal: number
    vatAmount: number
    total: number

    paymentMethod: 'Kort' | 'Kontant' | 'Swish' | 'Faktura'
    cardLastFour?: string

    notes?: string
}

export type DocumentData = InvoiceDocumentData | ReceiptDocumentData
