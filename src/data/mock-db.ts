
import { InboxItem } from "@/types"
import { NakedSupplierInvoice } from "@/services/invoice-processor"

// Initial mock data if needed, or empty
const INITIAL_INBOX: InboxItem[] = []
const INITIAL_INVOICES: NakedSupplierInvoice[] = []

class MockDatabase {
    public instanceId: number
    public inboxItems: InboxItem[] = []
    public supplierInvoices: Map<string, NakedSupplierInvoice> = new Map()
    public receipts: any[] = []

    constructor(instanceId: number) {
        this.instanceId = instanceId
        console.log(`[MockDB] Creating instance #${this.instanceId}`)
        this.inboxItems = [...INITIAL_INBOX]
        INITIAL_INVOICES.forEach(inv => this.supplierInvoices.set(inv.id, inv))
    }

    public reset() {
        console.log(`[MockDB #${this.instanceId}] Resetting data`)
        this.inboxItems = []
        this.supplierInvoices.clear()
        this.receipts = []
    }
}

// Use globalThis to persist across hot reloads
declare global {
    var mockDBInstance: MockDatabase | undefined
    var mockDBInstanceCount: number | undefined
}

if (!global.mockDBInstance) {
    global.mockDBInstanceCount = (global.mockDBInstanceCount || 0) + 1
    global.mockDBInstance = new MockDatabase(global.mockDBInstanceCount)
}

export const mockDB = global.mockDBInstance
console.log(`[MockDB] Using instance #${mockDB.instanceId}`)
