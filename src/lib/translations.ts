/**
 * Centralized Translations for Enkel/Avancerad Mode
 * 
 * All UI text in one place for easy management.
 * Each key has both 'enkel' (beginner-friendly) and 'avancerad' (professional) versions.
 */

export const translations = {
  // ============================================================================
  // Navigation
  // ============================================================================
  nav: {
    inbox: { enkel: "Inkorg", avancerad: "Inkorg" },
    aiRobot: { enkel: "AI-hjälpen", avancerad: "AI Robot" },
    events: { enkel: "Nyheter", avancerad: "Händelser" },
    bookkeeping: { enkel: "Min bokföring", avancerad: "Bokföring" },
    reports: { enkel: "Rapporter", avancerad: "Rapporter" },
    payroll: { enkel: "Löner", avancerad: "Löner" },
    owners: { enkel: "Ägarinfo", avancerad: "Ägare & Styrning" },
    settings: { enkel: "Inställningar", avancerad: "Inställningar" },
    statistics: { enkel: "Statistik", avancerad: "Företagsstatistik" },
    more: { enkel: "Övrigt", avancerad: "Mer" },
  },

  // ============================================================================
  // Transactions / Bokföring
  // ============================================================================
  transactions: {
    title: { enkel: "Pengar in & ut", avancerad: "Transaktioner" },
    allTransactions: { enkel: "Alla betalningar", avancerad: "Alla transaktioner" },
    newTransaction: { enkel: "Ny betalning", avancerad: "Ny transaktion" },
    toRecord: { enkel: "Att sortera", avancerad: "Att bokföra" },
    recorded: { enkel: "Klara", avancerad: "Bokförda" },
    missingDoc: { enkel: "Saknar kvitto", avancerad: "Saknar underlag" },
    ignored: { enkel: "Hoppade över", avancerad: "Ignorerade" },
    all: { enkel: "Alla", avancerad: "Alla" },
    
    // Actions
    book: { enkel: "Sortera", avancerad: "Bokför" },
    bookAll: { enkel: "Sortera alla", avancerad: "Bokför alla" },
    bookSelected: { enkel: "Sortera valda", avancerad: "Bokför valda" },
    ignore: { enkel: "Hoppa över", avancerad: "Ignorera" },
    addReceipt: { enkel: "Lägg till kvitto", avancerad: "Lägg till underlag" },
    viewDetails: { enkel: "Visa detaljer", avancerad: "Visa detaljer" },
    
    // Table headers
    date: { enkel: "Datum", avancerad: "Datum" },
    description: { enkel: "Beskrivning", avancerad: "Beskrivning" },
    amount: { enkel: "Belopp", avancerad: "Belopp" },
    category: { enkel: "Typ", avancerad: "Kategori" },
    account: { enkel: "Konto", avancerad: "Bokföringskonto" },
    status: { enkel: "Status", avancerad: "Status" },
    
    // Status labels
    statusToRecord: { enkel: "Att sortera", avancerad: "Att bokföra" },
    statusRecorded: { enkel: "Klar", avancerad: "Bokförd" },
    statusMissingDoc: { enkel: "Saknar kvitto", avancerad: "Saknar underlag" },
    statusIgnored: { enkel: "Hoppad över", avancerad: "Ignorerad" },
    
    // Empty state
    empty: { enkel: "Inga betalningar ännu", avancerad: "Inga transaktioner" },
    emptyDesc: { enkel: "När du kopplar ditt bankkonto visas dina betalningar här", avancerad: "Transaktioner visas här när bankkontot är kopplat" },
    
    // Search
    search: { enkel: "Sök betalningar...", avancerad: "Sök transaktioner..." },
  },

  // ============================================================================
  // Invoices (Customer)
  // ============================================================================
  invoices: {
    title: { enkel: "Skicka fakturor", avancerad: "Kundfakturor" },
    create: { enkel: "Skapa faktura", avancerad: "Ny faktura" },
    send: { enkel: "Skicka", avancerad: "Skicka" },
    sendReminder: { enkel: "Skicka påminnelse", avancerad: "Skicka betalningspåminnelse" },
    markPaid: { enkel: "Markera betald", avancerad: "Markera som betald" },
    
    // Table headers
    invoiceNumber: { enkel: "Fakturanr", avancerad: "Fakturanummer" },
    customer: { enkel: "Kund", avancerad: "Kund" },
    issueDate: { enkel: "Skickad", avancerad: "Fakturadatum" },
    dueDate: { enkel: "Betala senast", avancerad: "Förfallodatum" },
    amount: { enkel: "Belopp", avancerad: "Belopp" },
    status: { enkel: "Status", avancerad: "Status" },
    
    // Status
    statusPaid: { enkel: "Betald", avancerad: "Betald" },
    statusSent: { enkel: "Skickad", avancerad: "Skickad" },
    statusDraft: { enkel: "Ej skickad", avancerad: "Utkast" },
    statusOverdue: { enkel: "Sen betalning", avancerad: "Förfallen" },
    statusCancelled: { enkel: "Avbruten", avancerad: "Makulerad" },
    
    // Stats
    outstanding: { enkel: "Väntar på betalning", avancerad: "Utestående" },
    overdue: { enkel: "Försenade", avancerad: "Förfallna" },
    paidThisMonth: { enkel: "Betalda denna månad", avancerad: "Betalda denna period" },
    
    // Empty
    empty: { enkel: "Inga fakturor ännu", avancerad: "Inga fakturor" },
    emptyDesc: { enkel: "Skapa din första faktura för att få betalt", avancerad: "Skapa fakturor för att fakturera kunder" },
    
    search: { enkel: "Sök fakturor...", avancerad: "Sök fakturor..." },
    
    // Bulk actions
    allInvoices: { enkel: "Alla fakturor", avancerad: "Alla fakturor" },
    invoices: { enkel: "fakturor", avancerad: "fakturor" },
    invoicesDeleted: { enkel: "Fakturor borttagna", avancerad: "Fakturor raderade" },
    invoicesDeletedDesc: { enkel: "fakturor har tagits bort", avancerad: "fakturor har raderats" },
    invoicesSent: { enkel: "Fakturor skickade", avancerad: "Fakturor skickade" },
    invoicesSentDesc: { enkel: "fakturor har skickats", avancerad: "fakturor har skickats" },
    preparingDownload: { enkel: "Förbereder", avancerad: "Förbereder" },
    invoiceDeleted: { enkel: "Faktura borttagen", avancerad: "Faktura raderad" },
    invoiceDeletedDesc: { enkel: "har tagits bort", avancerad: "har raderats" },
    reminderSent: { enkel: "Påminnelse skickad", avancerad: "Påminnelse skickad" },
    reminderSentDesc: { enkel: "Påminnelse har skickats till", avancerad: "Betalningspåminnelse har skickats till" },
    invoiceCreated: { enkel: "Faktura skapad!", avancerad: "Faktura skapad!" },
    invoiceCreatedDesc: { enkel: "Faktura till", avancerad: "Faktura till" },
    hasBeenCreated: { enkel: "har skapats", avancerad: "har skapats" },
    
    // Form
    createInvoice: { enkel: "Skapa ny faktura", avancerad: "Skapa ny faktura" },
    customerName: { enkel: "Kund", avancerad: "Kund" },
    enterCustomer: { enkel: "Ange kundnamn...", avancerad: "Ange kundnamn..." },
    customerRequired: { enkel: "Kundnamn behövs", avancerad: "Kundnamn krävs" },
    customerMinLength: { enkel: "Kundnamn måste vara minst 2 tecken", avancerad: "Kundnamn måste vara minst 2 tecken" },
    amountRequired: { enkel: "Belopp behövs", avancerad: "Belopp krävs" },
    amountPositive: { enkel: "Belopp måste vara mer än 0", avancerad: "Belopp måste vara större än 0" },
    amountTooLarge: { enkel: "Beloppet är för stort", avancerad: "Belopp är för stort" },
    requiredFields: { enkel: "* Måste fyllas i", avancerad: "* Obligatoriska fält" },
    creating: { enkel: "Skapar...", avancerad: "Skapar..." },
    
    // Details dialog
    details: { enkel: "Fakturadetaljer", avancerad: "Fakturadetaljer" },
    outgoingInvoices: { enkel: "Skickade fakturor", avancerad: "Utgående Fakturor" },
    lastUpdated: { enkel: "Senast uppdaterad:", avancerad: "Senaste uppdaterad:" },
  },

  // ============================================================================
  // Supplier Invoices
  // ============================================================================
  supplierInvoices: {
    title: { enkel: "Fakturor att betala", avancerad: "Leverantörsfakturor" },
    approve: { enkel: "Godkänn", avancerad: "Attestera" },
    pay: { enkel: "Betala", avancerad: "Betala" },
    reject: { enkel: "Avslå", avancerad: "Avvisa" },
    
    // Table headers
    supplier: { enkel: "Från", avancerad: "Leverantör" },
    invoiceNumber: { enkel: "Fakturanr", avancerad: "Fakturanummer" },
    invoiceDate: { enkel: "Datum", avancerad: "Fakturadatum" },
    dueDate: { enkel: "Betala senast", avancerad: "Förfallodatum" },
    amount: { enkel: "Belopp", avancerad: "Belopp" },
    ocr: { enkel: "Betalningsnummer", avancerad: "OCR-nummer" },
    status: { enkel: "Status", avancerad: "Status" },
    
    // Status
    statusReceived: { enkel: "Ny", avancerad: "Mottagen" },
    statusApproved: { enkel: "Godkänd", avancerad: "Attesterad" },
    statusPaid: { enkel: "Betald", avancerad: "Betald" },
    statusOverdue: { enkel: "Försenad", avancerad: "Förfallen" },
    statusDispute: { enkel: "Problem", avancerad: "Tvist" },
    
    // Stats
    unpaid: { enkel: "Obetalda", avancerad: "Obetalda fakturor" },
    toApprove: { enkel: "Att godkänna", avancerad: "Att attestera" },
    overdueAmount: { enkel: "Försenade", avancerad: "Förfallna" },
    aiMatched: { enkel: "AI-matchade", avancerad: "AI-matchade" },
    ofReceived: { enkel: "av mottagna", avancerad: "av mottagna" },
    invoices: { enkel: "fakturor", avancerad: "fakturor" },
    
    empty: { enkel: "Inga fakturor att betala", avancerad: "Inga leverantörsfakturor" },
    search: { enkel: "Sök fakturor...", avancerad: "Sök leverantörsfakturor..." },
    
    viewInvoice: { enkel: "Visa faktura", avancerad: "Visa faktura" },
    markAsPaid: { enkel: "Betald", avancerad: "Markera betald" },
    downloadPdf: { enkel: "Ladda ner", avancerad: "Ladda ner PDF" },
    setStatus: { enkel: "Ändra status", avancerad: "Sätt status" },
  },

  // ============================================================================
  // Receipts / Underlag
  // ============================================================================
  receipts: {
    title: { enkel: "Kvitton", avancerad: "Underlag" },
    upload: { enkel: "Ladda upp kvitto", avancerad: "Ladda upp underlag" },
    scan: { enkel: "Fotografera kvitto", avancerad: "Skanna underlag" },
    match: { enkel: "Koppla till betalning", avancerad: "Matcha med transaktion" },
    
    // Table headers
    supplier: { enkel: "Butik/Företag", avancerad: "Leverantör" },
    date: { enkel: "Datum", avancerad: "Datum" },
    amount: { enkel: "Belopp", avancerad: "Belopp" },
    category: { enkel: "Typ", avancerad: "Kategori" },
    status: { enkel: "Status", avancerad: "Status" },
    
    // Status
    statusVerified: { enkel: "Klar", avancerad: "Verifierad" },
    statusPending: { enkel: "Väntar", avancerad: "Väntar" },
    statusProcessing: { enkel: "Läser in...", avancerad: "Bearbetar" },
    statusNeedsReview: { enkel: "Kolla över", avancerad: "Granskning krävs" },
    statusProcessed: { enkel: "Behandlad", avancerad: "Behandlad" },
    statusRejected: { enkel: "Avvisad", avancerad: "Avvisad" },
    
    // Stats
    unmatched: { enkel: "Ej kopplade", avancerad: "Omatchade" },
    matched: { enkel: "Kopplade", avancerad: "Matchade" },
    
    empty: { enkel: "Inga kvitton ännu", avancerad: "Inga underlag" },
    emptyDesc: { enkel: "Ladda upp kvitton för att spara dem", avancerad: "Underlag visas här när de laddas upp" },
    search: { enkel: "Sök kvitton...", avancerad: "Sök underlag..." },
    
    // Bulk actions
    receipts: { enkel: "kvitton", avancerad: "underlag" },
    allReceipts: { enkel: "Alla kvitton", avancerad: "Alla underlag" },
    receiptsDeleted: { enkel: "Kvitton borttagna", avancerad: "Underlag raderade" },
    receiptsDeletedDesc: { enkel: "kvitton har tagits bort", avancerad: "underlag har raderats" },
    receiptsArchived: { enkel: "Kvitton arkiverade", avancerad: "Underlag arkiverade" },
    receiptsArchivedDesc: { enkel: "kvitton har arkiverats", avancerad: "underlag har arkiverats" },
    preparingDownload: { enkel: "Förbereder", avancerad: "Förbereder" },
    receiptDeleted: { enkel: "Kvitto borttaget", avancerad: "Underlag raderat" },
    totalReceipts: { enkel: "Alla kvitton", avancerad: "Totalt underlag" },
    matchedReceipts: { enkel: "Kopplade", avancerad: "Matchade" },
    unmatchedReceipts: { enkel: "Ej kopplade", avancerad: "Omatchade" },
    totalAmount: { enkel: "Totalt belopp", avancerad: "Total summa" },
    linkedToTransaction: { enkel: "Kopplade till betalning", avancerad: "Kopplade till transaktion" },
    notLinked: { enkel: "Ej kopplade", avancerad: "Ej kopplade" },
    uploadReceipt: { enkel: "Ladda upp kvitto", avancerad: "Ladda upp underlag" },
    details: { enkel: "Kvittoinfo", avancerad: "Underlagsdetaljer" },
    linkedTransaction: { enkel: "Kopplad betalning", avancerad: "Kopplad transaktion" },
    notLinkedYet: { enkel: "Ej kopplad ännu", avancerad: "Ej kopplad" },
    hasAttachment: { enkel: "Bilaga", avancerad: "Bilaga" },
  },

  // ============================================================================
  // Reports
  // ============================================================================
  reports: {
    title: { enkel: "Rapporter", avancerad: "Rapporter" },
    vatReport: { enkel: "Momsrapport", avancerad: "Momsdeklaration" },
    incomeReport: { enkel: "Skatterapport", avancerad: "Inkomstdeklaration" },
    annualReport: { enkel: "Årssammanställning", avancerad: "Årsredovisning" },
    yearEnd: { enkel: "Bokslut", avancerad: "Årsbokslut" },
    profitLoss: { enkel: "Vad du tjänat", avancerad: "Resultaträkning" },
    balanceSheet: { enkel: "Vad du äger & är skyldig", avancerad: "Balansräkning" },
    
    generate: { enkel: "Skapa rapport", avancerad: "Generera" },
    download: { enkel: "Ladda ner", avancerad: "Ladda ner" },
    submit: { enkel: "Skicka in", avancerad: "Skicka till Skatteverket" },
  },

  // ============================================================================
  // Payroll / Löner
  // ============================================================================
  payroll: {
    title: { enkel: "Löner", avancerad: "Löner" },
    payslip: { enkel: "Lönebesked", avancerad: "Lönebesked" },
    agi: { enkel: "Arbetsgivarinfo", avancerad: "AGI" },
    dividend: { enkel: "Utdelning", avancerad: "Utdelning" },
    selfEmploymentTax: { enkel: "Mina avgifter", avancerad: "Egenavgifter" },
    ownerWithdrawal: { enkel: "Ägaruttag", avancerad: "Delägaruttag" },
    
    createPayslip: { enkel: "Skapa lönebesked", avancerad: "Skapa lönebesked" },
    grossSalary: { enkel: "Lön före skatt", avancerad: "Bruttolön" },
    netSalary: { enkel: "Lön efter skatt", avancerad: "Nettolön" },
    tax: { enkel: "Skatt", avancerad: "Preliminärskatt" },
    employerFees: { enkel: "Arbetsgivaravgifter", avancerad: "Arbetsgivaravgifter" },
  },

  // ============================================================================
  // Owners / Ägare
  // ============================================================================
  owners: {
    title: { enkel: "Ägarinfo", avancerad: "Ägare & Styrning" },
    shareRegister: { enkel: "Aktiebok", avancerad: "Aktiebok" },
    shareholders: { enkel: "Ägare", avancerad: "Delägare" },
    memberRegister: { enkel: "Medlemmar", avancerad: "Medlemsregister" },
    boardMinutes: { enkel: "Styrelseanteckningar", avancerad: "Styrelseprotokoll" },
    agm: { enkel: "Årsmöte (AB)", avancerad: "Bolagsstämma" },
    annualMeeting: { enkel: "Årsmöte", avancerad: "Årsmöte" },
  },

  // ============================================================================
  // AI / Suggestions
  // ============================================================================
  ai: {
    suggestion: { enkel: "Förslag", avancerad: "AI-förslag" },
    suggestions: { enkel: "förslag", avancerad: "AI-förslag" },
    confidence: { enkel: "Säkerhet", avancerad: "Konfidens" },
    approve: { enkel: "Godkänn", avancerad: "Acceptera förslag" },
    approveAll: { enkel: "Godkänn alla", avancerad: "Acceptera alla förslag" },
    reject: { enkel: "Nej tack", avancerad: "Avvisa" },
    edit: { enkel: "Ändra", avancerad: "Redigera förslag" },
    categorizedAs: { enkel: "Verkar vara", avancerad: "Kategoriserad som" },
    suggestedAccount: { enkel: "Föreslagen typ", avancerad: "Föreslaget konto" },
    reason: { enkel: "Varför?", avancerad: "Motivering" },
    categorization: { enkel: "AI-förslag", avancerad: "AI-kategorisering" },
  },

  // ============================================================================
  // Bookkeeping Terms
  // ============================================================================
  bookkeeping: {
    debit: { enkel: "In på kontot", avancerad: "Debet" },
    credit: { enkel: "Ut från kontot", avancerad: "Kredit" },
    journal: { enkel: "Alla händelser", avancerad: "Dagbok" },
    ledger: { enkel: "Kontoöversikt", avancerad: "Huvudbok" },
    verification: { enkel: "Kvitto/underlag", avancerad: "Verifikation" },
    verifications: { enkel: "Alla bokningar", avancerad: "Verifikationer" },
    fiscalYear: { enkel: "Räkenskapsår", avancerad: "Räkenskapsår" },
    assets: { enkel: "Det du äger", avancerad: "Tillgångar" },
    liabilities: { enkel: "Det du är skyldig", avancerad: "Skulder" },
    equity: { enkel: "Eget kapital", avancerad: "Eget kapital" },
    revenue: { enkel: "Pengar in", avancerad: "Intäkter" },
    expenses: { enkel: "Pengar ut", avancerad: "Kostnader" },
    profit: { enkel: "Det du tjänat", avancerad: "Resultat" },
    loss: { enkel: "Förlust", avancerad: "Förlust" },
    balance: { enkel: "Pengar kvar", avancerad: "Saldo" },
    vat: { enkel: "Moms", avancerad: "Mervärdesskatt" },
    vatIn: { enkel: "Moms du betalat", avancerad: "Ingående moms" },
    vatOut: { enkel: "Moms du fått in", avancerad: "Utgående moms" },
    vatToPay: { enkel: "Moms att betala", avancerad: "Moms att betala" },
  },

  // ============================================================================
  // Common Actions
  // ============================================================================
  actions: {
    save: { enkel: "Spara", avancerad: "Spara" },
    cancel: { enkel: "Avbryt", avancerad: "Avbryt" },
    delete: { enkel: "Ta bort", avancerad: "Radera" },
    edit: { enkel: "Ändra", avancerad: "Redigera" },
    view: { enkel: "Visa", avancerad: "Visa" },
    download: { enkel: "Ladda ner", avancerad: "Ladda ner" },
    upload: { enkel: "Ladda upp", avancerad: "Ladda upp" },
    search: { enkel: "Sök", avancerad: "Sök" },
    filter: { enkel: "Filtrera", avancerad: "Filter" },
    sort: { enkel: "Sortera", avancerad: "Sortera" },
    refresh: { enkel: "Uppdatera", avancerad: "Uppdatera" },
    close: { enkel: "Stäng", avancerad: "Stäng" },
    back: { enkel: "Tillbaka", avancerad: "Tillbaka" },
    next: { enkel: "Nästa", avancerad: "Nästa" },
    previous: { enkel: "Föregående", avancerad: "Föregående" },
    confirm: { enkel: "Bekräfta", avancerad: "Bekräfta" },
    create: { enkel: "Skapa", avancerad: "Skapa" },
    add: { enkel: "Lägg till", avancerad: "Lägg till" },
    remove: { enkel: "Ta bort", avancerad: "Ta bort" },
    select: { enkel: "Välj", avancerad: "Välj" },
    selectAll: { enkel: "Välj alla", avancerad: "Markera alla" },
    deselectAll: { enkel: "Avmarkera alla", avancerad: "Avmarkera alla" },
    export: { enkel: "Exportera", avancerad: "Exportera" },
    import: { enkel: "Importera", avancerad: "Importera" },
    print: { enkel: "Skriv ut", avancerad: "Skriv ut" },
    copy: { enkel: "Kopiera", avancerad: "Kopiera" },
    duplicate: { enkel: "Kopiera", avancerad: "Duplicera" },
    archive: { enkel: "Arkivera", avancerad: "Arkivera" },
    restore: { enkel: "Återställ", avancerad: "Återställ" },
    openMenu: { enkel: "Öppna meny", avancerad: "Öppna meny" },
    viewDetails: { enkel: "Visa mer", avancerad: "Visa detaljer" },
    new: { enkel: "Ny", avancerad: "Ny" },
    clearFilter: { enkel: "Ta bort filter", avancerad: "Rensa filter" },
    send: { enkel: "Skicka", avancerad: "Skicka" },
    downloading: { enkel: "Laddar ner...", avancerad: "Laddar ner..." },
  },

  // ============================================================================
  // Common Labels
  // ============================================================================
  labels: {
    name: { enkel: "Namn", avancerad: "Namn" },
    email: { enkel: "E-post", avancerad: "E-post" },
    phone: { enkel: "Telefon", avancerad: "Telefon" },
    address: { enkel: "Adress", avancerad: "Adress" },
    date: { enkel: "Datum", avancerad: "Datum" },
    time: { enkel: "Tid", avancerad: "Tid" },
    amount: { enkel: "Belopp", avancerad: "Belopp" },
    total: { enkel: "Totalt", avancerad: "Totalt" },
    subtotal: { enkel: "Delsumma", avancerad: "Delsumma" },
    description: { enkel: "Beskrivning", avancerad: "Beskrivning" },
    notes: { enkel: "Anteckningar", avancerad: "Anteckningar" },
    comment: { enkel: "Kommentar", avancerad: "Kommentar" },
    type: { enkel: "Typ", avancerad: "Typ" },
    category: { enkel: "Typ", avancerad: "Kategori" },
    status: { enkel: "Status", avancerad: "Status" },
    reference: { enkel: "Referens", avancerad: "Referens" },
    attachment: { enkel: "Bilaga", avancerad: "Bilaga" },
    attachments: { enkel: "Bilagor", avancerad: "Bilagor" },
    lastUpdated: { enkel: "Senast uppdaterad", avancerad: "Senast uppdaterad" },
    createdAt: { enkel: "Skapad", avancerad: "Skapad" },
    company: { enkel: "Företag", avancerad: "Företag" },
    orgNumber: { enkel: "Orgnummer", avancerad: "Organisationsnummer" },
    filterByStatus: { enkel: "Filtrera på status", avancerad: "Filtrera på status" },
    sortBy: { enkel: "Sortera", avancerad: "Sortera efter" },
    actions: { enkel: "Åtgärder", avancerad: "Åtgärder" },
    supplier: { enkel: "Från", avancerad: "Leverantör" },
    account: { enkel: "Konto", avancerad: "Konto" },
  },

  // ============================================================================
  // Stats / Dashboard
  // ============================================================================
  stats: {
    toRecord: { enkel: "Att sortera", avancerad: "Att bokföra" },
    recorded: { enkel: "Klara", avancerad: "Bokförda" },
    thisMonth: { enkel: "Denna månad", avancerad: "Denna period" },
    thisYear: { enkel: "I år", avancerad: "Innevarande år" },
    thisPeriod: { enkel: "Denna period", avancerad: "Denna period" },
    income: { enkel: "Pengar in", avancerad: "Intäkter" },
    expenses: { enkel: "Pengar ut", avancerad: "Kostnader" },
    profit: { enkel: "Vinst", avancerad: "Resultat" },
    balance: { enkel: "På kontot", avancerad: "Saldo" },
    unpaidInvoices: { enkel: "Obetalda fakturor", avancerad: "Utestående fakturor" },
    overdueInvoices: { enkel: "Försenade fakturor", avancerad: "Förfallna fakturor" },
    vatToPay: { enkel: "Moms att betala", avancerad: "Utgående moms" },
    vatToReceive: { enkel: "Moms att få tillbaka", avancerad: "Ingående moms" },
    totalTransactions: { enkel: "Antal betalningar", avancerad: "Totalt transaktioner" },
    totalInvoices: { enkel: "Antal fakturor", avancerad: "Totalt fakturor" },
    totalReceipts: { enkel: "Antal kvitton", avancerad: "Totalt kvitton" },
    pendingReview: { enkel: "Att granska", avancerad: "Väntar på granskning" },
    outstanding: { enkel: "Obetalda", avancerad: "Utestående" },
    overdue: { enkel: "Försenade", avancerad: "Förfallna" },
    paid: { enkel: "Betalda", avancerad: "Betalt" },
    toPay: { enkel: "Att betala", avancerad: "Att betala" },
    needsAttention: { enkel: "Behöver åtgärdas", avancerad: "Kräver uppmärksamhet" },
    approved: { enkel: "Godkända", avancerad: "Attesterade" },
  },

  // ============================================================================
  // Settings
  // ============================================================================
  settings: {
    title: { enkel: "Inställningar", avancerad: "Inställningar" },
    account: { enkel: "Mitt konto", avancerad: "Konto" },
    company: { enkel: "Företaget", avancerad: "Företagsinformation" },
    integrations: { enkel: "Kopplingar", avancerad: "Integrationer" },
    billing: { enkel: "Betalning", avancerad: "Fakturering" },
    notifications: { enkel: "Aviseringar", avancerad: "Notiser" },
    appearance: { enkel: "Utseende", avancerad: "Utseende" },
    language: { enkel: "Språk", avancerad: "Språk & region" },
    accessibility: { enkel: "Tillgänglighet", avancerad: "Tillgänglighet" },
    security: { enkel: "Säkerhet", avancerad: "Säkerhet & sekretess" },
    
    modeTitle: { enkel: "Hur vill du använda appen?", avancerad: "Läge" },
    modeEasy: { enkel: "Enkel", avancerad: "Enkel" },
    modeAdvanced: { enkel: "Avancerad", avancerad: "Avancerad" },
    modeEasyDesc: { enkel: "Enkla ord och förklaringar", avancerad: "Grundläggande funktioner" },
    modeAdvancedDesc: { enkel: "Bokföringstermer", avancerad: "Alla funktioner" },
  },

  // ============================================================================
  // Errors & Empty States
  // ============================================================================
  errors: {
    generic: { enkel: "Något gick fel", avancerad: "Ett fel uppstod" },
    notFound: { enkel: "Hittades inte", avancerad: "Resursen kunde inte hittas" },
    unauthorized: { enkel: "Du har inte tillgång", avancerad: "Ej behörig" },
    validation: { enkel: "Kontrollera uppgifterna", avancerad: "Valideringsfel" },
    network: { enkel: "Ingen internetanslutning", avancerad: "Nätverksfel" },
    tryAgain: { enkel: "Försök igen", avancerad: "Försök igen" },
    noMatchingInvoices: { enkel: "Inga fakturor hittades", avancerad: "Inga fakturor matchar din sökning" },
    noMatchingReceipts: { enkel: "Inga kvitton hittades", avancerad: "Inga kvitton matchar din sökning" },
    noMatchingTransactions: { enkel: "Inga betalningar hittades", avancerad: "Inga transaktioner matchar din sökning" },
  },

  // ============================================================================
  // Confirmations
  // ============================================================================
  confirm: {
    delete: { enkel: "Vill du ta bort detta?", avancerad: "Bekräfta borttagning" },
    deleteDesc: { enkel: "Det går inte att ångra", avancerad: "Denna åtgärd kan inte ångras" },
    unsavedChanges: { enkel: "Du har osparade ändringar", avancerad: "Osparade ändringar" },
    unsavedChangesDesc: { enkel: "Vill du lämna utan att spara?", avancerad: "Ändringar kommer att förloras" },
    yes: { enkel: "Ja", avancerad: "Ja" },
    no: { enkel: "Nej", avancerad: "Nej" },
    areYouSure: { enkel: "Är du säker?", avancerad: "Är du säker?" },
    cannotUndo: { enkel: "Det går inte att ångra detta", avancerad: "Denna åtgärd kan inte ångras. Objektet kommer att raderas permanent." },
  },
} as const

// Type helpers
export type TranslationKey = keyof typeof translations
export type Translations = typeof translations
