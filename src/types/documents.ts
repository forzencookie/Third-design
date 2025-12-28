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

export type DocumentData = InvoiceDocumentData | ReceiptDocumentData | CorporateDocumentData

// ============================================
// Corporate & Compliance Documents
// ============================================

/**
 * Signature request status
 */
export type SignatureStatus = 'pending' | 'signed' | 'declined' | 'expired'

/**
 * Signature on a document
 */
export interface SignatureRequest {
    id: string
    signerId: string           // User or Party ID
    signerName: string
    signerEmail?: string
    status: SignatureStatus
    requestedAt: Date
    signedAt?: Date
    method?: 'manual' | 'bankid' | 'email'  // Manual = uploaded signed PDF
}

/**
 * Corporate document types
 */
export type CorporateDocumentType =
    | 'board_protocol'        // Styrelseprotokoll
    | 'shareholder_protocol'  // Bolagsstämmoprotokoll
    | 'authority_form'        // Myndighetsformulär
    | 'statute_amendment'     // Bolagsordningsändring
    | 'other'

/**
 * Corporate document data for corporate actions
 */
export interface CorporateDocumentData {
    type: 'corporate'
    documentType: CorporateDocumentType

    // Identity
    id: string
    title: string
    description?: string

    // Version control
    version: number
    createdAt: Date
    updatedAt: Date

    // Content
    templateId?: string        // Reference to template used
    content?: string           // HTML or markdown content
    filePath?: string          // Path to generated PDF

    // Signatures
    signatures: SignatureRequest[]
    requiredSignatures: number // How many need to sign

    // Status derived from signatures
    isFullySigned: boolean

    // Linking
    relatedEventId?: string    // Links to HändelseEvent
    relatedActionId?: string   // Links to a corporate action
}

