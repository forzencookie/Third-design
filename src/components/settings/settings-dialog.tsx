"use client"

import * as React from "react"
import {
  Bell,
  Building2,
  CreditCard,
  Globe,
  Keyboard,
  Lock,
  Paintbrush,
  Puzzle,
  Shield,
  User,
  Moon,
  Sun,
  Monitor,
  FileText,
  AlertCircle,
  TrendingUp,
  Calendar,
  Smartphone,
  Mail,
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { CompanyTypeSelector } from "../onboarding/company-type-selector"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTextMode } from "@/providers/text-mode-provider"
import { cn } from "@/lib/utils"
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

const data = {
  nav: [
    { name: "Konto", icon: User },
    { name: "Företagsinformation", icon: Building2 },
    { name: "Integrationer", icon: Puzzle },
    { name: "Fakturering", icon: CreditCard },
    { name: "Notiser", icon: Bell },
    { name: "Utseende", icon: Paintbrush },
    { name: "Språk & region", icon: Globe },
    { name: "E-post", icon: Mail },
    { name: "Tillgänglighet", icon: Keyboard },
    { name: "Säkerhet & sekretess", icon: Lock },
  ],
}

interface SettingsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = React.useState("Konto")
  const [isExpanded, setIsExpanded] = React.useState(false)
  const { mode, setMode, isEnkel, isAvancerad } = useTextMode()
  const [integrations, setIntegrations] = React.useState<Record<string, boolean>>({})

  // Fetch integration states on mount
  React.useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const response = await fetch('/api/integrations')
        const data = await response.json()
        if (data.integrations) {
          setIntegrations(data.integrations)
        }
      } catch (error) {
        console.error('Failed to fetch integrations:', error)
      }
    }
    if (open) {
      fetchIntegrations()
    }
  }, [open])

  const toggleIntegration = async (id: string) => {
    const newState = !integrations[id]
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, connected: newState }),
      })
      const data = await response.json()
      if (data.success) {
        setIntegrations(prev => ({ ...prev, [id]: newState }))
      }
    } catch (error) {
      console.error('Failed to toggle integration:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        expandable
        onExpandedChange={setIsExpanded}
        className={cn(
          "overflow-hidden p-0",
          isExpanded
            ? "md:max-h-[90vh] md:max-w-[90vw] lg:max-w-[90vw]"
            : "md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]"
        )}
      >
        <DialogTitle className="sr-only">Inställningar</DialogTitle>
        <DialogDescription className="sr-only">
          Anpassa dina inställningar här.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {data.nav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          isActive={item.name === activeTab}
                          onClick={() => setActiveTab(item.name)}
                        >
                          <item.icon />
                          <span>{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className={cn(
            "flex flex-1 flex-col overflow-hidden transition-all duration-300",
            isExpanded ? "h-[calc(90vh-2rem)]" : "h-[480px]"
          )}>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Inställningar</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{activeTab}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
              {activeTab === "Konto" && (
                <div className="space-y-6">
                  <SettingsPageHeader
                    title="Kontoinställningar"
                    description="Hantera ditt konto och profil."
                  />

                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="" alt="Profilbild" />
                      <AvatarFallback className="text-lg">JS</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <Button variant="outline" size="sm">Ändra bild</Button>
                      <p className="text-xs text-muted-foreground">JPG, PNG eller GIF. Max 2MB.</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4">
                    <SettingsFormField id="name" label="Namn" placeholder="Johan Svensson" defaultValue="Johan Svensson" />
                    <SettingsFormField id="email" label="E-post" type="email" placeholder="johan@exempel.se" defaultValue="johan@exempel.se" />
                    <SettingsFormField id="phone" label="Telefon" type="tel" placeholder="070-123 45 67" />
                  </div>

                  <SettingsSaveButton />
                </div>
              )}
              {activeTab === "Företagsinformation" && (
                <div className="space-y-6">
                  <SettingsPageHeader
                    title="Företagsinformation"
                    description="Uppdatera ditt företags uppgifter och inställningar."
                  />

                  <SettingsSection
                    title="Företagsform"
                    description="Välj din företagsform för att anpassa funktioner och rapporter."
                  >
                    <CompanyTypeSelector showDescription={false} columns={2} />
                  </SettingsSection>

                  <Separator />

                  <div className="grid gap-4">
                    <SettingsFormField id="company-name" label="Företagsnamn" placeholder="Mitt Företag AB" />
                    <div className="grid grid-cols-2 gap-4">
                      <SettingsFormField id="org-nr" label="Organisationsnummer" placeholder="556123-4567" />
                      <SettingsFormField id="vat-nr" label="Momsreg.nr" placeholder="SE556123456701" />
                    </div>
                    <SettingsFormField id="address" label="Adress" placeholder="Storgatan 1, 111 22 Stockholm" />
                  </div>

                  <SettingsSaveButton />
                </div>
              )}
              {activeTab === "Integrationer" && (
                <div className="space-y-6">
                  <SettingsPageHeader
                    title="Integrationer"
                    description="Anslut externa tjänster och verktyg."
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <IntegrationCard
                      name="Bankgirot"
                      description="Automatisk betalningshantering"
                      connected
                    />
                    <IntegrationCard
                      name="Swish"
                      description="Ta emot betalningar via Swish"
                      connected
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
              )}
              {activeTab === "Fakturering" && (
                <div className="space-y-6">
                  <SettingsPageHeader
                    title="Fakturering"
                    description="Hantera ditt abonnemang och betalningsmetoder."
                  />

                  <div className="rounded-lg p-4 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Pro-plan</p>
                        <p className="text-sm text-muted-foreground">299 kr/månad</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">Aktiv</span>
                    </div>
                  </div>

                  <Separator />

                  <SettingsSection title="Betalningsmetod">
                    <div className="flex items-center justify-between rounded-lg border-2 border-border/60 p-4">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                          <p className="text-xs text-muted-foreground">Utgår 12/26</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Ändra</Button>
                    </div>
                  </SettingsSection>

                  <SettingsSection title="Faktureringshistorik">
                    <div className="space-y-2">
                      <BillingHistoryRow date="2024-01-01" amount="299 kr" status="Betald" />
                      <BillingHistoryRow date="2023-12-01" amount="299 kr" status="Betald" />
                      <BillingHistoryRow date="2023-11-01" amount="299 kr" status="Betald" />
                    </div>
                  </SettingsSection>
                </div>
              )}
              {activeTab === "Notiser" && (
                <div className="space-y-6">
                  <SettingsPageHeader
                    title="Notiser"
                    description="Anpassa hur och när du får notiser."
                  />

                  <SettingsSection title="E-postnotiser">
                    <div className="space-y-3">
                      <SettingsToggleItem
                        icon={FileText}
                        label="Nya fakturor"
                        description="När du får en ny faktura"
                        checked
                      />
                      <SettingsToggleItem
                        icon={AlertCircle}
                        label="Betalningspåminnelser"
                        description="Påminnelser om förfallna betalningar"
                        checked
                      />
                      <SettingsToggleItem
                        icon={TrendingUp}
                        label="Månadsrapporter"
                        description="Sammanfattning av månadens ekonomi"
                      />
                      <SettingsToggleItem
                        icon={Calendar}
                        label="Viktiga datum"
                        description="Påminnelser om momsdeklaration m.m."
                      />
                    </div>
                  </SettingsSection>

                  <Separator />

                  <SettingsSection title="Push-notiser">
                    <SettingsToggleItem
                      icon={Smartphone}
                      label="Mobilnotiser"
                      description="Få notiser på din mobil"
                    />
                  </SettingsSection>
                </div>
              )}
              {activeTab === "Utseende" && (
                <div className="space-y-6">
                  <SettingsPageHeader
                    title="Utseende"
                    description="Anpassa hur appen ser ut."
                  />

                  <SettingsSection title="Tema">
                    <div className="grid grid-cols-3 gap-3">
                      <ThemeButton value="light" label="Ljust" icon={Sun} />
                      <ThemeButton value="dark" label="Mörkt" icon={Moon} />
                      <ThemeButton value="system" label="System" icon={Monitor} />
                    </div>
                  </SettingsSection>

                  <Separator />

                  <SettingsSection title="Täthet">
                    <Select defaultValue="normal">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Välj täthet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Kompakt</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="comfortable">Bekväm</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsSection>

                  <SettingsSection title="Sidopanel">
                    <SettingsToggle
                      label="Komprimerad sidopanel"
                      description="Visa endast ikoner i sidopanelen"
                    />
                  </SettingsSection>
                </div>
              )}
              {activeTab === "Språk & region" && (
                <div className="space-y-6">
                  <SettingsPageHeader
                    title="Språk & region"
                    description="Välj språk och regional formatering."
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
                </div>
              )}
              {activeTab === "E-post" && (
                <div className="space-y-6">
                  <SettingsPageHeader
                    title="E-post"
                    description="Anslut dina e-postkonton och digital brevlåda."
                  />

                  <SettingsSection title="E-postleverantörer">
                    <div className="grid grid-cols-2 gap-3">
                      <IntegrationCard
                        name="Gmail"
                        description="Google Mail"
                        connected={integrations['gmail']}
                        onConnect={() => toggleIntegration('gmail')}
                        onDisconnect={() => toggleIntegration('gmail')}
                      />
                      <IntegrationCard
                        name="Yahoo Mail"
                        description="Yahoo e-post"
                        connected={integrations['yahoo']}
                        onConnect={() => toggleIntegration('yahoo')}
                        onDisconnect={() => toggleIntegration('yahoo')}
                      />
                      <IntegrationCard
                        name="Outlook"
                        description="Microsoft Outlook"
                        connected={integrations['outlook']}
                        onConnect={() => toggleIntegration('outlook')}
                        onDisconnect={() => toggleIntegration('outlook')}
                      />
                    </div>
                  </SettingsSection>

                  <Separator />

                  <SettingsSection title="Digital brevlåda">
                    <div className="grid grid-cols-2 gap-3">
                      <IntegrationCard
                        name="Kivra"
                        description="Digital post från myndigheter"
                        connected={integrations['kivra']}
                        onConnect={() => toggleIntegration('kivra')}
                        onDisconnect={() => toggleIntegration('kivra')}
                      />
                    </div>
                  </SettingsSection>
                </div>
              )}
              {activeTab === "Tillgänglighet" && (
                <div className="space-y-6">
                  <SettingsPageHeader
                    title="Tillgänglighet"
                    description="Anpassa appen för bättre tillgänglighet."
                  />

                  <SettingsSection title="Läge" description="Välj hur appen ska prata med dig.">
                    <div className="grid grid-cols-2 gap-3">
                      <ModeButton
                        label="Enkel"
                        description="Enkla ord och förklaringar"
                        selected={isEnkel}
                        onClick={() => setMode("enkel")}
                      />
                      <ModeButton
                        label="Avancerad"
                        description="Bokföringstermer"
                        selected={isAvancerad}
                        onClick={() => setMode("avancerad")}
                      />
                    </div>
                  </SettingsSection>

                  <Separator />

                  <div className="space-y-4">
                    <SettingsToggle
                      label="Reducera rörelse"
                      description="Minska animationer och övergångar"
                    />
                    <SettingsToggle
                      label="Hög kontrast"
                      description="Öka kontrasten för bättre läsbarhet"
                    />
                    <SettingsToggle
                      label="Större text"
                      description="Använd större textstorlek överallt"
                    />
                  </div>

                  <Separator />

                  <SettingsSection title="Tangentbordsgenvägar">
                    <div className="space-y-2 text-sm">
                      <KeyboardShortcut action="Öppna sökfält" keys="⌘ + K" />
                      <KeyboardShortcut action="Ny transaktion" keys="⌘ + N" />
                      <KeyboardShortcut action="Öppna inställningar" keys="⌘ + ," />
                      <KeyboardShortcut action="Stäng dialog" keys="Esc" />
                    </div>
                  </SettingsSection>
                </div>
              )}
              {activeTab === "Säkerhet & sekretess" && (
                <div className="space-y-6">
                  <SettingsPageHeader
                    title="Säkerhet & sekretess"
                    description="Hantera säkerhet och integritetsinställningar."
                  />

                  <SettingsSection title="Lösenord">
                    <div className="grid gap-3">
                      <SettingsFormField id="current-password" label="Nuvarande lösenord" type="password" />
                      <SettingsFormField id="new-password" label="Nytt lösenord" type="password" />
                      <SettingsFormField id="confirm-password" label="Bekräfta lösenord" type="password" />
                      <Button variant="outline" size="sm" className="w-fit">Ändra lösenord</Button>
                    </div>
                  </SettingsSection>

                  <Separator />

                  <SettingsSection title="Tvåfaktorsautentisering">
                    <div className="flex items-center justify-between rounded-lg border-2 border-border/60 p-4">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">2FA är aktiverat</p>
                          <p className="text-xs text-muted-foreground">Via autentiseringsapp</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Hantera</Button>
                    </div>
                  </SettingsSection>

                  <SettingsSection title="Aktiva sessioner">
                    <div className="space-y-2">
                      <SessionCard
                        device="MacBook Pro"
                        location="Stockholm"
                        isCurrent
                        deviceType="desktop"
                      />
                      <SessionCard
                        device="iPhone 15"
                        location="Stockholm"
                        deviceType="mobile"
                        onLogout={() => { }}
                      />
                    </div>
                  </SettingsSection>
                </div>
              )}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}
