"use client"

import * as React from "react"
import {
    User,
    Moon,
    Sun,
    Monitor,
    FileText,
    AlertCircle,
    TrendingUp,
    Calendar,
    Smartphone,
    CreditCard,
    Globe,
    Keyboard,
    Lock,
    Mail,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useCompany } from "@/providers/company-provider"
import { useTextMode } from "@/providers/text-mode-provider"
import { CompanyTypeSelector } from "@/components/onboarding/company-type-selector"
import {
    SettingsPageHeader,
    SettingsFormField,
    SettingsSaveButton,
    SettingsToggle,
    SettingsToggleItem,
    IntegrationCard,
    BillingHistoryRow,
    ThemeButton,
    SessionCard,
    KeyboardShortcut,
    SettingsSection,
    ModeButton,
} from "@/components/ui/settings-items"

interface SettingsFormData {
    name: string
    email: string
    orgNumber: string
    vatNumber: string
    address: string
    phone: string
    contactPerson: string
}

// =============================================================================
// Account Tab
// =============================================================================
export function AccountTab({ formData, setFormData, onSave }: {
    formData: SettingsFormData
    setFormData: React.Dispatch<React.SetStateAction<SettingsFormData>>
    onSave: () => void
}) {
    const { text } = useTextMode()
    return (
        <div className="space-y-6">
            <SettingsPageHeader
                title={text.settings.accountSettings}
                description={text.settings.accountDesc}
            />

            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src="" alt={text.settings.profilePicture} />
                    <AvatarFallback className="text-lg">JS</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <Button variant="outline" size="sm">{text.settings.changePicture}</Button>
                    <p className="text-xs text-muted-foreground">{text.settings.pictureHint}</p>
                </div>
            </div>

            <Separator />

            <div className="grid gap-4">
                <SettingsFormField
                    id="name"
                    label={text.labels.name}
                    placeholder="Johan Svensson"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <SettingsFormField
                    id="email"
                    label={text.labels.email}
                    type="email"
                    placeholder="johan@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>

            <SettingsSaveButton onClick={onSave} />
        </div>
    )
}

// =============================================================================
// Company Tab
// =============================================================================
export function CompanyTab({ formData, setFormData, onSave }: {
    formData: SettingsFormData
    setFormData: React.Dispatch<React.SetStateAction<SettingsFormData>>
    onSave: () => void
}) {
    const { text } = useTextMode()
    const { company, updateCompany } = useCompany()
    const accountingMethod = company?.accountingMethod || 'invoice'

    return (
        <div className="space-y-6">
            <SettingsPageHeader
                title={text.settings.companyInfo}
                description={text.settings.companyInfoDesc}
            />

            <SettingsSection
                title={text.settings.companyType}
                description={text.settings.companyTypeDesc}
            >
                <CompanyTypeSelector showDescription={false} columns={2} />
            </SettingsSection>

            <Separator />

            <div className="grid gap-4">
                <SettingsFormField
                    id="company-name"
                    label="Företagsnamn"
                    placeholder="Mitt Företag AB"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <div className="grid gap-2">
                    <Label>Bokföringsmetod</Label>
                    <Select
                        value={accountingMethod}
                        onValueChange={(val: 'cash' | 'invoice') => updateCompany({ accountingMethod: val })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="invoice">
                                <span className="font-medium block">Fakturametoden</span>
                                <span className="text-xs text-muted-foreground">Bokför vid faktura och betalning (Standard för AB)</span>
                            </SelectItem>
                            <SelectItem value="cash">
                                <span className="font-medium block">Kontantmetoden</span>
                                <span className="text-xs text-muted-foreground">Bokför endast vid betalning (Enklare)</span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <SettingsFormField
                        id="org-nr"
                        label="Organisationsnummer"
                        placeholder="556123-4567"
                        value={formData.orgNumber}
                        onChange={(e) => setFormData({ ...formData, orgNumber: e.target.value })}
                    />
                    <SettingsFormField
                        id="vat-nr"
                        label="Momsreg.nr"
                        placeholder="SE556123456701"
                        value={formData.vatNumber}
                        onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                    />
                </div>
                <SettingsFormField
                    id="address"
                    label="Adress"
                    placeholder="Storgatan 1, 111 22 Stockholm"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
            </div>

            <Separator />

            <SettingsSection
                title={text.settings.dataExport}
                description={text.settings.dataExportDesc}
            >
                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="font-medium">SIE-Export</p>
                            <p className="text-sm text-muted-foreground">Exportera hela din bokföring till SIE4-format</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => {
                        // In a real app, this would trigger a download
                        // window.location.href = '/api/sie/export'
                        alert("Export startad! Filen laddas ner strax.")
                    }}>
                        {text.settings.exportSIE}
                    </Button>
                </div>
            </SettingsSection>

            <SettingsSaveButton onClick={onSave} />
        </div>
    )
}

// =============================================================================
// Integrations Tab
// =============================================================================
export function IntegrationsTab() {
    const { text } = useTextMode()
    return (
        <div className="space-y-6">
            <SettingsPageHeader
                title={text.settings.integrationsSettings}
                description={text.settings.integrationsDesc}
            />

            <div className="grid grid-cols-2 gap-3">
                <IntegrationCard
                    name="Bankgirot"
                    description="Automatisk betalningshantering"
                    comingSoon
                />
                <IntegrationCard
                    name="Swish"
                    description="Ta emot betalningar via Swish"
                    comingSoon
                />
                <IntegrationCard
                    name="Google Kalender"
                    description="Synkronisera viktiga datum"
                />
                <IntegrationCard
                    name="Skatteverket"
                    description="Direktanslutning för deklarationer"
                />
            </div>
        </div>
    )
}

// =============================================================================
// Billing Tab
// =============================================================================
export function BillingTab() {
    const { text } = useTextMode()
    return (
        <div className="space-y-6">
            <SettingsPageHeader
                title={text.settings.billingSettings}
                description={text.settings.billingDesc}
            />

            <div className="rounded-lg p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Pro-plan</p>
                        <p className="text-sm text-muted-foreground">299 kr/månad</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">{text.settings.active}</span>
                </div>
            </div>

            <Separator />

            <SettingsSection title={text.settings.paymentMethod}>
                <div className="flex items-center justify-between rounded-lg border-2 border-border/60 p-4">
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                            <p className="text-xs text-muted-foreground">{text.settings.expires} 12/26</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm">{text.actions.edit}</Button>
                </div>
            </SettingsSection>

            <SettingsSection title={text.settings.billingHistory}>
                <div className="space-y-2">
                    <BillingHistoryRow date="2024-01-01" amount="299 kr" status="Betald" />
                    <BillingHistoryRow date="2023-12-01" amount="299 kr" status="Betald" />
                    <BillingHistoryRow date="2023-11-01" amount="299 kr" status="Betald" />
                </div>
            </SettingsSection>
        </div>
    )
}

// =============================================================================
// Notifications Tab
// =============================================================================
export function NotificationsTab() {
    const { text } = useTextMode()
    return (
        <div className="space-y-6">
            <SettingsPageHeader
                title={text.settings.notificationsSettings}
                description={text.settings.notificationsDesc}
            />

            <SettingsSection title={text.settings.emailNotifications}>
                <div className="space-y-3">
                    <SettingsToggleItem
                        icon={FileText}
                        label={text.settings.newInvoices}
                        description={text.settings.newInvoicesDesc}
                        checked
                    />
                    <SettingsToggleItem
                        icon={AlertCircle}
                        label={text.settings.paymentReminders}
                        description={text.settings.paymentRemindersDesc}
                        checked
                    />
                    <SettingsToggleItem
                        icon={TrendingUp}
                        label={text.settings.monthlyReports}
                        description={text.settings.monthlyReportsDesc}
                    />
                    <SettingsToggleItem
                        icon={Calendar}
                        label={text.settings.importantDates}
                        description={text.settings.importantDatesDesc}
                    />
                </div>
            </SettingsSection>

            <Separator />

            <SettingsSection title={text.settings.pushNotifications}>
                <SettingsToggleItem
                    icon={Smartphone}
                    label={text.settings.mobileNotifications}
                    description={text.settings.mobileNotificationsDesc}
                />
            </SettingsSection>
        </div>
    )
}

// =============================================================================
// Appearance Tab
// =============================================================================
export function AppearanceTab() {
    const { text } = useTextMode()
    return (
        <div className="space-y-6">
            <SettingsPageHeader
                title={text.settings.appearanceSettings}
                description={text.settings.appearanceDesc}
            />

            <SettingsSection title={text.settings.theme}>
                <div className="grid grid-cols-3 gap-3">
                    <ThemeButton value="light" label={text.settings.themeLight} icon={Sun} />
                    <ThemeButton value="dark" label={text.settings.themeDark} icon={Moon} />
                    <ThemeButton value="system" label={text.settings.themeSystem} icon={Monitor} />
                </div>
            </SettingsSection>

            <Separator />

            <SettingsSection title={text.settings.density}>
                <Select defaultValue="normal">
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={text.settings.density} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="compact">{text.settings.densityCompact}</SelectItem>
                        <SelectItem value="normal">{text.settings.densityNormal}</SelectItem>
                        <SelectItem value="comfortable">{text.settings.densityComfortable}</SelectItem>
                    </SelectContent>
                </Select>
            </SettingsSection>

            <SettingsSection title={text.settings.sidebar}>
                <SettingsToggle
                    label={text.settings.compactSidebar}
                    description={text.settings.compactSidebarDesc}
                />
            </SettingsSection>
        </div>
    )
}

// =============================================================================
// Language Tab
// =============================================================================
export function LanguageTab() {
    const { text } = useTextMode()
    const [mode, setMode] = React.useState("easy")

    return (
        <div className="space-y-6">
            <SettingsPageHeader
                title={text.settings.languageSettings}
                description={text.settings.languageDesc}
            />

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label>Språk</Label>
                    <Select defaultValue="sv">
                        <SelectTrigger>
                            <SelectValue placeholder="Välj språk" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sv">🇸🇪 Svenska</SelectItem>
                            <SelectItem value="en">🇬🇧 English</SelectItem>
                            <SelectItem value="no">🇳🇴 Norsk</SelectItem>
                            <SelectItem value="da">🇩🇰 Dansk</SelectItem>
                            <SelectItem value="fi">🇫🇮 Suomi</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label>Valuta</Label>
                    <Select defaultValue="sek">
                        <SelectTrigger>
                            <SelectValue placeholder="Välj valuta" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sek">SEK - Svenska kronor</SelectItem>
                            <SelectItem value="eur">EUR - Euro</SelectItem>
                            <SelectItem value="usd">USD - US Dollar</SelectItem>
                            <SelectItem value="nok">NOK - Norska kronor</SelectItem>
                            <SelectItem value="dkk">DKK - Danska kronor</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label>Datumformat</Label>
                    <Select defaultValue="sv">
                        <SelectTrigger>
                            <SelectValue placeholder="Välj datumformat" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sv">2024-01-15 (ÅÅÅÅ-MM-DD)</SelectItem>
                            <SelectItem value="eu">15/01/2024 (DD/MM/ÅÅÅÅ)</SelectItem>
                            <SelectItem value="us">01/15/2024 (MM/DD/ÅÅÅÅ)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label>Första dag i veckan</Label>
                    <Select defaultValue="monday">
                        <SelectTrigger>
                            <SelectValue placeholder="Välj första dag" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monday">Måndag</SelectItem>
                            <SelectItem value="sunday">Söndag</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Separator />

            <SettingsSection
                title={text.settings.textModeSection}
                description={text.settings.textModeDesc}
            >
                <div className="grid grid-cols-2 gap-3 mt-2">
                    <ModeButton
                        label="Enkel"
                        description="Förenklad terminologi för nybörjare"
                        selected={mode === "easy"}
                        onClick={() => setMode("easy")}
                    />
                    <ModeButton
                        label="Expert"
                        description="Standard bokföringstermer"
                        selected={mode === "expert"}
                        onClick={() => setMode("expert")}
                    />
                </div>
            </SettingsSection>
        </div>
    )
}

// =============================================================================
// Email Tab
// =============================================================================
export function EmailTab() {
    const { text } = useTextMode()
    return (
        <div className="space-y-6">
            <SettingsPageHeader
                title={text.settings.emailSettings}
                description={text.settings.emailDesc}
            />

            <SettingsSection title={text.settings.sender}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="from-name">Avsändarnamn</Label>
                        <input
                            id="from-name"
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="Mitt Företag AB"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="reply-to">Svarsadress</Label>
                        <input
                            id="reply-to"
                            type="email"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="support@mittforetag.se"
                        />
                    </div>
                </div>
            </SettingsSection>

            <Separator />

            <SettingsSection title="E-postsignatur">
                <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                    placeholder="Med vänliga hälsningar,&#10;Mitt Företag AB"
                />
            </SettingsSection>
        </div>
    )
}

// =============================================================================
// Accessibility Tab
// =============================================================================
export function AccessibilityTab() {
    const { text } = useTextMode()
    return (
        <div className="space-y-6">
            <SettingsPageHeader
                title={text.settings.accessibilitySettings}
                description={text.settings.accessibilityDesc}
            />

            <SettingsSection title={text.settings.shortcuts}>
                <div className="space-y-3">
                    <KeyboardShortcut action={text.settings.shortcutSearch} keys="⌘K" />
                    <KeyboardShortcut action={text.settings.shortcutNewInvoice} keys="⌘N" />
                    <KeyboardShortcut action={text.settings.shortcutSettings} keys="⌘," />
                    <KeyboardShortcut action={text.settings.shortcutOverview} keys="GO" />
                </div>
            </SettingsSection>

            <Separator />

            <SettingsSection title={text.settings.helpers}>
                <div className="space-y-4">
                    <SettingsToggle
                        label={text.settings.reduceMotion}
                        description={text.settings.reduceMotionDesc}
                    />
                    <SettingsToggle
                        label={text.settings.highContrast}
                        description={text.settings.highContrastDesc}
                    />
                </div>
            </SettingsSection>
        </div>
    )
}

// =============================================================================
// Security Tab
// =============================================================================
export function SecurityTab() {
    const { text } = useTextMode()
    return (
        <div className="space-y-6">
            <SettingsPageHeader
                title={text.settings.securitySettings}
                description={text.settings.securityDesc}
            />

            <SettingsSection title={text.settings.twoFactor}>
                <div className="flex items-center justify-between rounded-lg border-2 border-border/60 p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{text.settings.twoFactorEnabled}</p>
                            <p className="text-xs text-muted-foreground">{text.settings.twoFactorDesc}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">{text.settings.manage}</Button>
                </div>
            </SettingsSection>

            <Separator />

            <SettingsSection title={text.settings.activeSessions}>
                <div className="space-y-3">
                    <SessionCard
                        device="MacBook Pro"
                        location="Stockholm, Sverige"
                        isCurrent
                    />
                    <SessionCard
                        device="iPhone 15 Pro"
                        location="Stockholm, Sverige"
                    />
                </div>
            </SettingsSection>

            <Separator />

            <SettingsSection title={text.settings.privacy}>
                <div className="space-y-4">
                    <SettingsToggle
                        label={text.settings.analyticsData}
                        description={text.settings.analyticsDataDesc}
                        checked
                    />
                    <SettingsToggle
                        label={text.settings.marketing}
                        description={text.settings.marketingDesc}
                    />
                </div>
            </SettingsSection>
        </div>
    )
}
