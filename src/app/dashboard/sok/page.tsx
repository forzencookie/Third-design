"use client"

import { useState, useEffect, useMemo } from "react"
import {
    ArrowRight,
    BookOpen,
    PieChart,
    PiggyBank,
    Settings,
    Receipt,
    ClipboardCheck,
    Calculator,
    Send,
    FileBarChart,
    FileText,
    DollarSign,
    Gift,
    Car,
    Users,
    Landmark,
    Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { SearchBar } from "@/components/ui/search-bar"
import { Button } from "@/components/ui/button"

import { useCompany } from "@/providers/company-provider"
import { type FeatureKey } from "@/lib/company-types"
import { globalSearch, groupSearchResults, type SearchResult, type SearchResultGroup } from "@/services/search-service"

interface SearchItem {
    id: string
    title: string
    titleEnkel: string
    description: string
    icon: React.ReactNode
    href: string
    category: string
    feature?: FeatureKey // Optional feature key for visibility
    colorClass: string // Tailwind classes for icon bg and text color
}

// Category color mapping (with dark mode support)
const categoryColors: Record<string, string> = {
    "Bokföring": "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
    "Rapporter": "bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400",
    "Skatt": "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
    "Händelser": "bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400",
    "Parter": "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
    "Löner": "bg-pink-100 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400",
}

const searchItems: SearchItem[] = [
    // Bokföring (Emerald/Teal)
    { id: "1", title: "Transaktioner", titleEnkel: "Pengar in & ut", description: "Visa och hantera banktransaktioner", icon: <BookOpen className="h-4 w-4" />, href: "/dashboard/sok/bokforing?tab=transaktioner", category: "Bokföring", feature: "transaktioner", colorClass: categoryColors["Bokföring"] },
    { id: "2", title: "Fakturor & Kvitton", titleEnkel: "Kvitton", description: "Ladda upp och hantera kvitton", icon: <Receipt className="h-4 w-4" />, href: "/dashboard/sok/bokforing?tab=kvitton", category: "Bokföring", feature: "kvitton", colorClass: categoryColors["Bokföring"] },
    { id: "3", title: "Verifikationer", titleEnkel: "Alla bokningar", description: "Bokföringsverifikationer", icon: <ClipboardCheck className="h-4 w-4" />, href: "/dashboard/sok/bokforing?tab=verifikationer", category: "Bokföring", feature: "verifikationer", colorClass: categoryColors["Bokföring"] },

    // Rapporter (Orange) - Read-only output
    { id: "4", title: "Resultaträkning", titleEnkel: "Resultat", description: "Intäkter och kostnader", icon: <PieChart className="h-4 w-4" />, href: "/dashboard/sok/rapporter?tab=resultat", category: "Rapporter", feature: "resultatrakning", colorClass: categoryColors["Rapporter"] },
    { id: "5", title: "Balansräkning", titleEnkel: "Balans", description: "Tillgångar och skulder", icon: <FileBarChart className="h-4 w-4" />, href: "/dashboard/sok/rapporter?tab=balans", category: "Rapporter", feature: "balansrakning", colorClass: categoryColors["Rapporter"] },

    // Skatt & Deklarationer (Purple)
    { id: "6", title: "Momsdeklaration", titleEnkel: "Momsrapport", description: "Hantera moms", icon: <Calculator className="h-4 w-4" />, href: "/dashboard/sok/skatt?tab=momsdeklaration", category: "Skatt", feature: "momsdeklaration", colorClass: categoryColors["Skatt"] },
    { id: "7", title: "Inkomstdeklaration", titleEnkel: "Skatterapport", description: "Inkomstskatt", icon: <Send className="h-4 w-4" />, href: "/dashboard/sok/skatt?tab=inkomstdeklaration", category: "Skatt", feature: "inkomstdeklaration", colorClass: categoryColors["Skatt"] },
    { id: "8", title: "Årsredovisning", titleEnkel: "Årssammanställning", description: "Årsredovisning", icon: <FileBarChart className="h-4 w-4" />, href: "/dashboard/sok/skatt?tab=arsredovisning", category: "Skatt", feature: "arsredovisning", colorClass: categoryColors["Skatt"] },
    { id: "9", title: "Årsbokslut", titleEnkel: "Bokslut", description: "Årsbokslut", icon: <FileText className="h-4 w-4" />, href: "/dashboard/sok/skatt?tab=arsbokslut", category: "Skatt", feature: "arsbokslut", colorClass: categoryColors["Skatt"] },

    // Löner (Pink) - Conditional
    { id: "10", title: "Lönebesked", titleEnkel: "Lönebesked", description: "Hantera löner", icon: <FileText className="h-4 w-4" />, href: "/dashboard/sok/loner?tab=lonebesked", category: "Löner", feature: "lonebesked", colorClass: categoryColors["Löner"] },
    { id: "11", title: "Utdelning", titleEnkel: "Utdelning", description: "Aktieutdelning", icon: <DollarSign className="h-4 w-4" />, href: "/dashboard/sok/loner?tab=utdelning", category: "Löner", feature: "utdelning", colorClass: categoryColors["Löner"] },
    { id: "12", title: "Förmåner", titleEnkel: "Övriga Förmåner", description: "Hantera personalförmåner", icon: <Gift className="h-4 w-4" />, href: "/dashboard/sok/loner?tab=benefits", category: "Löner", feature: "lonebesked", colorClass: categoryColors["Löner"] },

    // Parter (Blue) - People & Roles
    { id: "13", title: "Aktiebok", titleEnkel: "Aktiebok", description: "Hantera aktiebok", icon: <BookOpen className="h-4 w-4" />, href: "/dashboard/sok/parter?tab=aktiebok", category: "Parter", feature: "aktiebok", colorClass: categoryColors["Parter"] },
    { id: "14", title: "Delägare", titleEnkel: "Ägare", description: "Hantera delägare", icon: <Users className="h-4 w-4" />, href: "/dashboard/sok/parter?tab=delagare", category: "Parter", feature: "delagare", colorClass: categoryColors["Parter"] },
    { id: "15", title: "Styrelseprotokoll", titleEnkel: "Styrelseanteckningar", description: "Protokoll från styrelsemöten", icon: <FileText className="h-4 w-4" />, href: "/dashboard/sok/parter?tab=styrelseprotokoll", category: "Parter", feature: "styrelseprotokoll", colorClass: categoryColors["Parter"] },
    { id: "16", title: "Bolagsstämma", titleEnkel: "Årsmöte (AB)", description: "Protokoll från bolagsstämma", icon: <Landmark className="h-4 w-4" />, href: "/dashboard/sok/parter?tab=bolagsstamma", category: "Parter", feature: "bolagsstamma", colorClass: categoryColors["Parter"] },

    // Händelser (Sky) - Universal for all company forms
    { id: "17", title: "Händelser", titleEnkel: "Historik", description: "Tidslinje över allt som hänt — beslut, dokument och åtgärder.", icon: <Activity className="h-4 w-4" />, href: "/dashboard/sok/handelser", category: "Händelser", colorClass: categoryColors["Händelser"] },
]

import { useTextMode } from "@/providers/text-mode-provider"

// Filter categories (new pillar structure)
const filterCategories = ["Bokföring", "Rapporter", "Skatt", "Händelser", "Parter", "Löner"] as const
type FilterCategory = typeof filterCategories[number] | null

export default function SokPage() {
    const [query, setQuery] = useState("")
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [activeFilter, setActiveFilter] = useState<FilterCategory>(null)
    const [contentResults, setContentResults] = useState<SearchResultGroup[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const { isEnkel } = useTextMode()
    const { hasFeature, companyType } = useCompany()

    // Deep search when query changes
    useEffect(() => {
        if (query.length >= 2) {
            setIsSearching(true)
            const filters = activeFilter === null ? [] : [activeFilter]
            globalSearch(query, { filters }).then(results => {
                setContentResults(groupSearchResults(results))
                setIsSearching(false)
            })
        } else {
            setContentResults([])
        }
    }, [query, activeFilter])

    const filteredItems = searchItems.filter(item => {
        // First check if the company supports this feature
        if (item.feature && !hasFeature(item.feature)) {
            return false
        }

        // Filter by active category
        if (activeFilter !== null && item.category !== activeFilter &&
            !(activeFilter === "Bokföring" && ["Bokföring"].includes(item.category)) &&
            !(activeFilter === "Rapporter" && ["Rapporter"].includes(item.category)) &&
            !(activeFilter === "Skatt" && ["Skatt"].includes(item.category)) &&
            !(activeFilter === "Händelser" && ["Händelser"].includes(item.category)) &&
            !(activeFilter === "Parter" && ["Parter"].includes(item.category)) &&
            !(activeFilter === "Löner" && ["Löner"].includes(item.category))
        ) {
            return false
        }

        // Then check if it matches the search query
        return (
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.titleEnkel.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        )
    })

    // Group by category
    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = []
        acc[item.category].push(item)
        return acc
    }, {} as Record<string, SearchItem[]>)


    useEffect(() => {
        setSelectedIndex(-1)
    }, [query])

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-3xl mx-auto pt-12 px-6">
                {/* Search Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Sök</h1>
                    <p className="text-muted-foreground">Hitta det du söker snabbt</p>
                </div>

                {/* Search Input */}
                <div className="mb-4">
                    <SearchBar
                        placeholder="Sök transaktioner, kvitton, dokument..."
                        value={query}
                        onChange={setQuery}
                        className="w-full"
                        size="lg"
                    />
                </div>

                {/* Category Buttons - always visible under search bar */}
                <div className="flex flex-wrap items-center justify-center gap-1 mb-8">
                    {/* All button */}
                    <button
                        onClick={() => setActiveFilter(null)}
                        className={cn(
                            "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                            activeFilter === null
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        Alla
                    </button>

                    {/* Category buttons */}
                    {filterCategories
                        .filter(cat => cat !== "Parter" || companyType !== 'ef')
                        .map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveFilter(category)}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                    activeFilter === category
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {category}
                            </button>
                        ))}
                </div>

                {/* Content Search Results (Deep Search) - ONLY when NOT in a category */}
                {contentResults.length > 0 && activeFilter === null && (
                    <div className="space-y-4 mb-8">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3">
                            Hittade i dina data
                        </h3>
                        {contentResults.map(group => (
                            <div key={group.category}>
                                <div className="text-xs font-medium text-muted-foreground mb-2 px-3">
                                    {group.category}
                                </div>
                                {group.results.map(result => (
                                    <a
                                        key={result.id}
                                        href={result.href}
                                        className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50 rounded-lg group"
                                    >
                                        <div className={cn("flex-shrink-0 w-6 h-6 rounded flex items-center justify-center", result.colorClass)}>
                                            <FileText className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-foreground/90">{result.title}</div>
                                            <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                                        </div>
                                        {result.amount && (
                                            <div className="text-sm font-medium">{result.amount}</div>
                                        )}
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors" />
                                    </a>
                                ))}
                                <a
                                    href={group.viewAllHref}
                                    className="block text-xs text-primary hover:underline px-4 py-2"
                                >
                                    Visa alla i {group.category} →
                                </a>
                            </div>
                        ))}
                        <div className="h-[2px] bg-border/40 rounded-full" />
                    </div>
                )}

                {/* Search loading state - only when not in category filter */}
                {isSearching && query.length > 0 && activeFilter === null && (
                    <div className="py-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mb-3" />
                        <p className="text-sm text-muted-foreground">Söker...</p>
                    </div>
                )}

                {/* No results state - global search */}
                {!isSearching && query.length >= 2 && contentResults.length === 0 && activeFilter === null && (
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground mb-2">Inga träffar för "{query}"</p>
                        <p className="text-sm text-muted-foreground/70">Prova ett annat sökord eller välj en kategori</p>
                    </div>
                )}

                {/* Typing hint (before deep search kicks in) */}
                {!isSearching && query.length > 0 && query.length < 2 && activeFilter === null && (
                    <div className="py-12 text-center">
                        <p className="text-sm text-muted-foreground">Skriv minst 2 tecken för att söka</p>
                    </div>
                )}

                {/* Category page navigation - only shows when filter is selected */}
                {activeFilter !== null && (
                    <div className="space-y-4 mb-8">
                        {/* Header with back button */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-foreground">
                                {activeFilter}
                                {query.length > 0 && (
                                    <span className="text-muted-foreground font-normal ml-2">
                                        · "{query}"
                                    </span>
                                )}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveFilter(null)}
                                className="text-xs text-muted-foreground"
                            >
                                ← Tillbaka
                            </Button>
                        </div>

                        {/* Deep search results - when inside category */}
                        {contentResults.length > 0 && (
                            <div className="space-y-3">
                                {contentResults.map(group => (
                                    <div key={group.category}>
                                        <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
                                            {group.category}
                                        </div>
                                        {group.results.map(result => (
                                            <a
                                                key={result.id}
                                                href={result.href}
                                                className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50 rounded-lg group"
                                            >
                                                <div className={cn("flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors", result.colorClass)}>
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm text-foreground/90">{result.title}</div>
                                                    <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                                                </div>
                                                {result.amount && (
                                                    <div className="text-sm font-medium">{result.amount}</div>
                                                )}
                                                <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors" />
                                            </a>
                                        ))}
                                        <a
                                            href={group.viewAllHref}
                                            className="block text-xs text-primary hover:underline px-4 py-2"
                                        >
                                            Visa alla i {group.category} →
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Loading state when searching within category */}
                        {isSearching && query.length > 0 && (
                            <div className="py-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mb-2" />
                                <p className="text-sm text-muted-foreground">Söker...</p>
                            </div>
                        )}

                        {/* Category navigation items - only show when no search query */}
                        {query.length === 0 && filteredItems.length > 0 && (
                            <div className="space-y-1">
                                {filteredItems.map(item => (
                                    <a
                                        key={item.id}
                                        href={item.href}
                                        className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/50 rounded-lg group"
                                    >
                                        <div className={cn("flex-shrink-0 w-6 h-6 rounded flex items-center justify-center", item.colorClass)}>
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="font-medium text-sm text-foreground/90">
                                                {isEnkel ? item.titleEnkel : item.title}
                                            </span>
                                            <div className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors" />
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* No results - only show if deep search also has no results and query exists */}
                        {!isSearching && query.length >= 2 && contentResults.length === 0 && (
                            <div className="py-8 text-center">
                                <p className="text-muted-foreground">Inga träffar för "{query}" i {activeFilter}</p>
                            </div>
                        )}
                    </div>
                )}


            </div>
        </div>
    )
}
