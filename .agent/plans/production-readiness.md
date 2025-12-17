---
description: Comprehensive plan to productionize the application, categorized by functional area
---

# Production Readiness Plan: The "Real App" Roadmap

This plan details the specific files and tasks required to transform the prototype into a fully functional accounting system. We assume **Phase 1 (Data Foundation)** is active, where the `server-db` (Simulator) is the single source of truth.

## 1. Bookkeeping (Bokföring)
**Goal:** Ensure the core accounting engine works. Buttons must trigger real Ledger writes.

### Core Components
*   **`src/components/accounting/verifikationer-table.tsx`**
    *   [ ] **Action:** Connect "Ny Verifikation" button to `POST /api/manual-verification`.
    *   [ ] **Action:** Ensure "Redigera" actually updates the Ledger entry.
*   **`src/components/accounting/huvudbok.tsx`** (General Ledger)
    *   [ ] **Action:** Verify it aggregates `server-db` data dynamically (no mock totals).
*   **`src/components/transactions/transactions-table.tsx`**
    *   [ ] **Action:** "Bokför" button must lock the transaction and generate a `Verification`.
*   **`src/components/invoices/invoices-table.tsx`** (Kundfakturor)
    *   [ ] **Action:** "Skapa faktura" must create a PDF + Ledger Entry (Debit 1510 / Credit 3010).
    *   [ ] **Action:** "Markera som betald" must create a Payment Entry (Debit 1930 / Credit 1510).
*   **`src/components/invoices/leverantorsfakturor-table.tsx`** (Supplier Bills)
    *   [ ] **Action:** "Attestera" must change status and allow payment.

## 2. Documents & Reports (Rapporter & Dokument)
**Goal:** Generate valid, downloadable documents for authorities and employees.

### A. Government Reports (Skatteverket / Bolagsverket)
*   **`src/components/reports/momsdeklaration-content.tsx`** (VAT)
    *   [x] **Update:** Replace hardcoded boxes (e.g. "48") with `calculateVatBox(ledger, 48)`.
    *   [x] **Action:** "Skapa fil" should generate an XML compatible with Skatteverket.
*   **`src/components/reports/inkomstdeklaration-content.tsx`** (INK2)
    *   [x] **Update:** Map Ledger accounts to INK2 fields (e.g. `2.1 Omsättning`).
    *   [x] **Action:** "Ladda ner PDF" generates a filled INK2 form.
*   **`src/components/reports/arsredovisning-content.tsx`** (Annual Report)
    *   [x] **Update:** Build `Resultaträkning` & `Balansräkning` aggregators from real Ledger data.

### B. Payroll (Lön & Utdelning)
*   **`src/components/payroll/lonebesked-content.tsx`** (Payslips)
    *   [x] **Action:** "Skapa lönebesked" must calculate Tax & Arbetsgivaravgift based on settings.
    *   [x] **Output:** Generate PDF Payslip for the employee.
    *   [x] **Ledger:** Create entry (Debit 7xxx / Credit 27xx / Credit 1930).
*   **`src/components/payroll/agi-content.tsx`** (Arbetsgivardeklaration)
    *   [x] **Update:** Aggregate data from generated payslips for the period.
    *   [x] **Action:** Generate AGI XML file.

### C. Company Information & Forms (Företagsuppgifter & Bolagsform)
Comprehensive coverage for Aktiebolag, Handelsbolag/Kommanditbolag, and Föreningar.

#### Aktiebolag (AB)
*   **`src/components/ownership/aktiebok.tsx`** (Share Register)
    *   [x] **Persistence:** Ensure share transfers are saved to DB.
    *   [ ] **Action:** "Ladda ner aktiebok" PDF generation.
*   **`src/components/corporate/bolagsstamma.tsx`** (General Meeting)
    *   [ ] **Action:** "Skapa stämmoprotokoll". Generate PDF from agenda/decisions.
    *   [ ] **Logic:** Implement voting rights calculation based on Share Register.
*   **`src/components/corporate/styrelseprotokoll.tsx`** (Board Minutes)
    *   [ ] **Action:** "Spara protokoll". Save decisions to DB (sometimes triggers Ledger events).
    *   [ ] **Action:** "Ladda ner PDF".

#### Handelsbolag & Kommanditbolag (HB/KB)
*   **`src/components/ownership/delagare.tsx`** (Partners)
    *   [x] **Logic:** Track "Bolagsmän" vs "Kommanditdelägare" (Liability difference).
*   **`src/components/ownership/delagaruttag.tsx`** (Partner Withdrawals)
    *   [x] **Action:** "Registrera uttag". Creates Ledger Entry (Debit 2013 / Credit 1930).
    *   [x] **Logic:** Implement "Eget Kapital" calculation per partner.
    *   [ ] **Tax:** Use `egenavgifter.tsx` logic to estimate personal tax liability for partners.

#### Ekonomisk Förening (Ek. För.)
*   **`src/components/corporate/medlemsregister.tsx`** (Members)
    *   [x] **Action:** "Ny medlem" -> Creates Ledger Entry (Debit 1930 / Credit 2083 Medlemsinsatser).
    *   [x] **Logic:** Handle "Insats" vs "Medlemsavgift" distinction.
*   **`src/components/corporate/arsmote.tsx`** (Association Annual Meeting)
    *   [x] **Action:** "Kallelse". Generate email/PDF notice to all active members.
    *   [x] **Logic:** Calculate "Röstlängd" (Voting List) based on active members.

## 3. Company Statistics (Företagsstatistik)
**Goal:** Live financial intelligence dashboards connected to Bookkeeping & Payroll.

### Data Source
*   **`src/components/statistics/statistics-data.ts`**
    *   [x] **Task:** DELETE this file. Replace with `useCompanyStatistics()` hook.
    *   [x] **Logic:** Implement `calculateLiquidity()`, `calculateProfitMargin()`, `calculateSolvency()`.

### Visual Components
*   **`src/components/statistics/overview-tab.tsx`**
    *   [x] **Connect:** `FinancialKPI` cards (Soliditet, Likviditet) to the new hook.
    *   [x] **Connect:** Liquidity Chart to `server-db` bank balances history.
*   **`src/components/statistics/expenses-tab.tsx`**
    *   [x] **Connect:** Pie Chart to Ledger Expense Accounts (4000-8999).
*   **`src/components/statistics/transactions-tab.tsx`**
    *   [x] **Connect:** Bar charts to actual Transaction/Invoice volumes.

## Execution Strategy (Phases)

1.  **Phase 1: The Core (Bookkeeping & Invoicing)** - *Current Focus*
    *   Get money In (Invoices) and Out (Bills) to hit the Ledger.
2.  **Phase 2: The Intelligence (Statistics)**
    *   Once data exists, visualize it in `CompanyStatistics`.
3.  **Phase 3: The Output (Reports & Payroll)**
    *   Generate the heavy PDFs/XMLs based on the solid data foundation.
4.  **Phase 4: Corporate Governance**
    *   Finalize form-specific logic (HB/KB withdrawals, Association members).
