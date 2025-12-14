
export interface Verification {
    id: number
    date: string
    description: string
    amount: number
    konto: string
    kontoName: string
    hasTransaction: boolean
    hasUnderlag: boolean
}

// Shared mock data used across tables and reports
export const mockVerifikationer: Verification[] = [
    {
        id: 1,
        date: "2024-12-05",
        description: "IKEA kontorsmaterial",
        amount: -1200,
        konto: "5410",
        kontoName: "Förbrukningsinventarier",
        hasTransaction: true,
        hasUnderlag: true,
    },
    {
        id: 2,
        date: "2024-12-04",
        description: "Spotify Premium",
        amount: -169,
        konto: "5420",
        kontoName: "Programvaror",
        hasTransaction: true,
        hasUnderlag: true,
    },
    {
        id: 3,
        date: "2024-12-04",
        description: "Lunch kundmöte",
        amount: -450,
        konto: "6072",
        kontoName: "Representation",
        hasTransaction: true,
        hasUnderlag: false,
    },
    {
        id: 4,
        date: "2024-12-03",
        description: "Kundbetalning ABC AB",
        amount: 15000,
        konto: "3040",
        kontoName: "Försäljning tjänster",
        hasTransaction: true,
        hasUnderlag: true,
    },
    {
        id: 5,
        date: "2024-12-03",
        description: "Adobe Creative Cloud",
        amount: -599,
        konto: "5420",
        kontoName: "Programvaror",
        hasTransaction: true,
        hasUnderlag: true,
    },
    {
        id: 6,
        date: "2024-12-02",
        description: "Telia mobilabonnemang",
        amount: -349,
        konto: "6212",
        kontoName: "Telefon",
        hasTransaction: true,
        hasUnderlag: false,
    },
    {
        id: 7,
        date: "2024-12-01",
        description: "Clas Ohlson kontorsstol",
        amount: -2400,
        konto: "5410",
        kontoName: "Förbrukningsinventarier",
        hasTransaction: true,
        hasUnderlag: true,
    },
    // Adding Mock VAT entries for Q4
    {
        id: 8,
        date: "2024-12-31",
        description: "Utgående moms försäljning",
        amount: -3000, // Liability increases (Credit)
        konto: "2610",
        kontoName: "Utgående moms 25%",
        hasTransaction: false,
        hasUnderlag: true,
    },
    {
        id: 9,
        date: "2024-11-15",
        description: "Ingående moms inköp",
        amount: 1500, // Asset increases (Debit)
        konto: "2640",
        kontoName: "Ingående moms",
        hasTransaction: false,
        hasUnderlag: true,
    },
    {
        id: 10,
        date: "2024-10-20",
        description: "Utgående moms konsulttjänst",
        amount: -12500,
        konto: "2610",
        kontoName: "Utgående moms 25%",
        hasTransaction: false,
        hasUnderlag: true,
    }
]
