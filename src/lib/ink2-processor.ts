
import { Verification } from "@/hooks/use-verifications"
import { ink2Fields } from "@/components/reports/constants"

export interface Ink2Field {
    field: string
    label: string
    value: number
}

export const Ink2Processor = {
    /**
     * Calculate INK2 fields from real ledger verifications for a specific year.
     */
    calculateInk2(verifications: Verification[], year: number): Ink2Field[] {
        // Initialize sums
        let nettoOmsattning = 0
        let ovrigaIntakter = 0
        let ravaror = 0
        let ovrigaExterna = 0
        let personal = 0
        let avskrivningar = 0
        let ranteIntakter = 0
        let ranteKostnader = 0

        // Helper to check year
        const getYear = (dateStr: string) => new Date(dateStr).getFullYear()

        verifications.forEach(v => {
            if (getYear(v.date) !== year) return

            v.rows.forEach(row => {
                // Net value = Credit - Debit (Standard P&L sign: Revenue +, Cost -)
                const net = (row.credit || 0) - (row.debit || 0)
                const acc = row.account

                if (acc >= "3000" && acc <= "3799") nettoOmsattning += net
                else if (acc >= "3800" && acc <= "3999") ovrigaIntakter += net
                else if (acc >= "4000" && acc <= "4999") ravaror += net
                else if (acc >= "5000" && acc <= "6999") ovrigaExterna += net
                else if (acc >= "7000" && acc <= "7699") personal += net
                else if (acc >= "7700" && acc <= "7899") avskrivningar += net
                else if (acc >= "8300" && acc <= "8399") ranteIntakter += net
                else if (acc >= "8400" && acc <= "8499") ranteKostnader += net
            })
        })

        // Calculate Result
        const bokfortResultat = nettoOmsattning + ovrigaIntakter + ravaror + ovrigaExterna + personal + avskrivningar + ranteIntakter + ranteKostnader

        return [
            { field: "1.1", label: "Nettoomsättning", value: nettoOmsattning },
            { field: "1.4", label: "Övriga rörelseintäkter", value: ovrigaIntakter },
            { field: "2.1", label: "Råvaror och förnödenheter", value: ravaror },
            { field: "2.4", label: "Övriga externa kostnader", value: ovrigaExterna },
            { field: "2.5", label: "Personalkostnader", value: personal },
            { field: "2.7", label: "Avskrivningar", value: avskrivningar },
            { field: "3.1", label: "Ränteintäkter", value: ranteIntakter },
            { field: "3.3", label: "Räntekostnader", value: ranteKostnader },
            { field: "4.1", label: "Bokfört resultat", value: bokfortResultat },
        ]
    }
}
