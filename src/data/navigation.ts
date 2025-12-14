// ============================================
// Navigation Mock Data
// ============================================

import {
  BookOpen,
  Bot,
  Box,
  Apple,
  CheckSquare,
  Frame,
  Home,
  Mail,
  PieChart,
  Building2,
  Users,
  Puzzle,
  Settings,
  Landmark,
  Vote,
  FileText,
  PiggyBank,
  Captions,
} from "lucide-react"
import type { FeatureKey } from "@/lib/company-types"
import type { User, Team, NavItem } from "@/types"

// ============================================
// User Data
// ============================================

export const mockUser: User = {
  id: "user-1",
  name: "Rice",
  email: "rice@scopeai.se",
  avatar: "",
  plan: "Free",
}

// ============================================
// Teams Data
// ============================================

export const mockTeams: Team[] = [
  {
    id: "team-1",
    name: "Scope AI",
    logo: Box,
    plan: "Max",
  },
  {
    id: "team-2",
    name: "Mitt Företag AB",
    logo: Building2,
    plan: "Free",
  },
]

// ============================================
// Platform Navigation
// ============================================

export const navPlatform: NavItem[] = [
  {
    title: "Inkorg",
    titleEnkel: "Inkorg",
    url: "/dashboard/inbox",
    icon: Mail,
    isActive: true,
    muted: true,
  },
  {
    title: "Händelser",
    titleEnkel: "Nyheter",
    url: "/dashboard/dagbok",
    icon: Apple,
    muted: true,
  },
]

// ============================================
// Economy Navigation
// ============================================

export const navEconomy: NavItem[] = [
  {
    title: "Bokföring",
    titleEnkel: "Min bokföring",
    url: "/dashboard/accounting",
    icon: BookOpen,
    items: [
      {
        title: "Transaktioner",
        titleEnkel: "Pengar in & ut",
        url: "/dashboard/accounting?tab=transaktioner",
      },
      {
        title: "Fakturor & Kvitton",
        titleEnkel: "Kvitton",
        url: "/dashboard/accounting?tab=underlag",
      },
      {
        title: "Verifikationer",
        titleEnkel: "Alla bokningar",
        url: "/dashboard/accounting?tab=verifikationer",
      },
    ],
  },
  {
    title: "Rapporter",
    titleEnkel: "Rapporter",
    url: "/dashboard/reports",
    icon: PieChart,
    items: [
      {
        title: "Momsdeklaration",
        titleEnkel: "Momsrapport",
        url: "/dashboard/reports?tab=momsdeklaration",
        featureKey: "momsdeklaration",
      },
      {
        title: "Inkomstdeklaration",
        titleEnkel: "Skatterapport",
        url: "/dashboard/reports?tab=inkomstdeklaration",
        featureKey: "inkomstdeklaration",
      },
      {
        title: "Årsredovisning",
        titleEnkel: "Årssammanställning",
        url: "/dashboard/reports?tab=arsredovisning",
        featureKey: "arsredovisning",
      },
      {
        title: "Årsbokslut",
        titleEnkel: "Bokslut",
        url: "/dashboard/reports?tab=arsbokslut",
        featureKey: "arsbokslut",
      },
    ],
  },
  {
    title: "Löner",
    titleEnkel: "Löner",
    url: "/dashboard/payroll",
    icon: PiggyBank,
    items: [
      {
        title: "Lönebesked",
        titleEnkel: "Lönebesked",
        url: "/dashboard/payroll?tab=lonebesked",
        featureKey: "lonebesked",
      },
      {
        title: "AGI",
        titleEnkel: "Arbetsgivarinfo",
        url: "/dashboard/payroll?tab=agi",
        featureKey: "agi",
      },
      {
        title: "Utdelning",
        titleEnkel: "Utdelning",
        url: "/dashboard/payroll?tab=utdelning",
        featureKey: "utdelning",
      },
      {
        title: "Egenavgifter",
        titleEnkel: "Mina avgifter",
        url: "/dashboard/payroll?tab=egenavgifter",
        featureKey: "egenavgifter",
      },
      {
        title: "Delägaruttag",
        titleEnkel: "Ägaruttag",
        url: "/dashboard/payroll?tab=delagaruttag",
        featureKey: "delagaruttag",
      },
    ],
  },
  {
    title: "Ägare & Styrning",
    titleEnkel: "Ägarinfo",
    url: "/dashboard/agare",
    icon: Landmark,
    items: [
      {
        title: "Aktiebok",
        titleEnkel: "Aktiebok",
        url: "/dashboard/agare?tab=aktiebok",
        featureKey: "aktiebok",
      },
      {
        title: "Delägare",
        titleEnkel: "Ägare",
        url: "/dashboard/agare?tab=delagare",
        featureKey: "delagare",
      },
      {
        title: "Medlemsregister",
        titleEnkel: "Medlemmar",
        url: "/dashboard/agare?tab=medlemsregister",
        featureKey: "medlemsregister",
      },
      {
        title: "Styrelseprotokoll",
        titleEnkel: "Styrelseanteckningar",
        url: "/dashboard/agare?tab=styrelseprotokoll",
        featureKey: "styrelseprotokoll",
      },
      {
        title: "Bolagsstämma",
        titleEnkel: "Årsmöte (AB)",
        url: "/dashboard/agare?tab=bolagsstamma",
        featureKey: "bolagsstamma",
      },
      {
        title: "Årsmöte",
        titleEnkel: "Årsmöte",
        url: "/dashboard/agare?tab=arsmote",
        featureKey: "arsmote",
      },
    ],
  },
]

// ============================================
// Settings Navigation
// ============================================

export const navSettings: NavItem[] = [
  {
    title: "Inställningar",
    titleEnkel: "Inställningar",
    url: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Företagsstatistik",
    titleEnkel: "Statistik",
    url: "/dashboard/company-statistics",
    icon: Captions,
  },
]
