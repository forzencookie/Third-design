/**
 * Ownership Processor Service
 * 
 * Takes NAKED ownership data and "clothes" them:
 * - Shareholders (Aktiebok)
 * - Partners (Delägare HB/KB)
 * - Members (Medlemsregister)
 * - Board meetings (Styrelseprotokoll)
 * - General meetings (Bolagsstämma/Årsmöte)
 */

import type { 
  StockTransactionType, 
  MembershipStatus, 
  MembershipChangeType,
  MeetingStatus,
} from "@/lib/status-types"

// ============================================================================
// Shareholder Types (Aktiebok - AB)
// ============================================================================

export interface NakedShareholder {
  id: string
  name: string
  personalNumber?: string
  orgNumber?: string
  type: 'person' | 'company'
  shares: number
  shareClass: 'A' | 'B' | 'stamaktier'
  acquisitionDate: string
  acquisitionPrice: number
  votesPerShare?: number
}

export interface NakedShareTransaction {
  id: string
  date: string
  type: 'nyemission' | 'köp' | 'försäljning' | 'gåva' | 'arv' | 'split'
  fromShareholder?: string
  toShareholder: string
  shares: number
  pricePerShare: number
  shareClass: 'A' | 'B' | 'stamaktier'
  notes?: string
}

export interface ProcessedShareholder {
  id: string
  name: string
  personalNumber?: string
  orgNumber?: string
  type: 'person' | 'company'
  shares: number
  shareClass: 'A' | 'B' | 'stamaktier'
  ownershipPercentage: number
  acquisitionDate: string
  acquisitionPrice: number
  votes: number
  votesPercentage: number
}

export interface ProcessedShareTransaction {
  id: string
  date: string
  type: StockTransactionType
  fromShareholder?: string
  toShareholder: string
  shares: number
  pricePerShare: number
  totalPrice: number
  shareClass: 'A' | 'B' | 'stamaktier'
  notes?: string
}

// ============================================================================
// Partner Types (Delägare - HB/KB)
// ============================================================================

export interface NakedPartner {
  id: string
  name: string
  personalNumber: string
  type: 'komplementär' | 'kommanditdelägare'
  ownershipPercentage: number
  profitSharePercentage: number
  capitalContribution: number
  currentCapitalBalance: number
  joinDate: string
}

export interface NakedPartnerWithdrawal {
  id: string
  partnerId: string
  partnerName: string
  date: string
  amount: number
  type: 'uttag' | 'insättning' | 'lön'
  description: string
  approved: boolean
}

export interface ProcessedPartner {
  id: string
  name: string
  personalNumber: string
  type: 'komplementär' | 'kommanditdelägare'
  typeLabel: 'Komplementär' | 'Kommanditdelägare'
  ownershipPercentage: number
  profitSharePercentage: number
  capitalContribution: number
  currentCapitalBalance: number
  joinDate: string
  isLimitedLiability: boolean
}

export interface ProcessedPartnerWithdrawal {
  id: string
  partnerId: string
  partnerName: string
  date: string
  amount: number
  type: 'uttag' | 'insättning' | 'lön'
  typeLabel: 'Uttag' | 'Insättning' | 'Lön'
  description: string
  approved: boolean
  statusLabel: 'Godkänd' | 'Väntar'
}

// ============================================================================
// Member Types (Medlemsregister - Förening)
// ============================================================================

export interface NakedMember {
  id: string
  name: string
  email: string
  phone?: string
  memberNumber: string
  joinDate: string
  membershipType: 'ordinarie' | 'stödmedlem' | 'hedersmedlem'
  status: 'aktiv' | 'vilande' | 'avslutad'
  currentYearFeePaid: boolean
  roles: string[]
}

export interface NakedMembershipChange {
  id: string
  memberId: string
  memberName: string
  date: string
  changeType: 'gått med' | 'lämnat' | 'statusändring' | 'rollbyte'
  details: string
}

export interface ProcessedMember {
  id: string
  name: string
  email: string
  phone?: string
  memberNumber: string
  joinDate: string
  membershipType: 'ordinarie' | 'stödmedlem' | 'hedersmedlem'
  membershipTypeLabel: 'Ordinarie' | 'Stödmedlem' | 'Hedersmedlem'
  status: MembershipStatus
  currentYearFeePaid: boolean
  roles: string[]
}

export interface ProcessedMembershipChange {
  id: string
  memberId: string
  memberName: string
  date: string
  changeType: MembershipChangeType
  details: string
}

// ============================================================================
// Meeting Types (Styrelseprotokoll/Bolagsstämma/Årsmöte)
// ============================================================================

export interface NakedMeeting {
  id: string
  date: string
  meetingNumber?: number
  location: string
  chairperson: string
  secretary?: string
  attendees: string[]
  status: 'planerad' | 'kallad' | 'genomförd' | 'protokoll signerat'
  decisions: NakedMeetingDecision[]
}

export interface NakedMeetingDecision {
  id: string
  title: string
  description?: string
  decision: string
  votingResult?: {
    for: number
    against: number
    abstained: number
  }
}

export interface ProcessedMeeting {
  id: string
  date: string
  meetingNumber?: number
  location: string
  chairperson: string
  secretary?: string
  attendees: string[]
  status: MeetingStatus
  decisions: ProcessedMeetingDecision[]
}

export interface ProcessedMeetingDecision {
  id: string
  title: string
  description?: string
  decision: string
  votingResult?: {
    for: number
    against: number
    abstained: number
  }
}

// ============================================================================
// Status Mappings
// ============================================================================

const STOCK_TRANSACTION_TYPE_MAP: Record<NakedShareTransaction['type'], StockTransactionType> = {
  nyemission: 'Nyemission',
  köp: 'Köp',
  försäljning: 'Försäljning',
  gåva: 'Gåva',
  arv: 'Arv',
  split: 'Split',
}

const PARTNER_TYPE_MAP: Record<NakedPartner['type'], ProcessedPartner['typeLabel']> = {
  komplementär: 'Komplementär',
  kommanditdelägare: 'Kommanditdelägare',
}

const WITHDRAWAL_TYPE_MAP: Record<NakedPartnerWithdrawal['type'], ProcessedPartnerWithdrawal['typeLabel']> = {
  uttag: 'Uttag',
  insättning: 'Insättning',
  lön: 'Lön',
}

const MEMBERSHIP_TYPE_MAP: Record<NakedMember['membershipType'], ProcessedMember['membershipTypeLabel']> = {
  ordinarie: 'Ordinarie',
  stödmedlem: 'Stödmedlem',
  hedersmedlem: 'Hedersmedlem',
}

const MEMBERSHIP_STATUS_MAP: Record<NakedMember['status'], MembershipStatus> = {
  aktiv: 'Aktiv',
  vilande: 'Vilande',
  avslutad: 'Avslutad',
}

const MEMBERSHIP_CHANGE_TYPE_MAP: Record<NakedMembershipChange['changeType'], MembershipChangeType> = {
  'gått med': 'Gått med',
  'lämnat': 'Lämnat',
  'statusändring': 'Statusändring',
  'rollbyte': 'Rollbyte',
}

const MEETING_STATUS_MAP: Record<NakedMeeting['status'], MeetingStatus> = {
  planerad: 'Planerad',
  kallad: 'Kallad',
  genomförd: 'Genomförd',
  'protokoll signerat': 'Signerat',
}

// ============================================================================
// Processors
// ============================================================================

export function processShareholder(naked: NakedShareholder, totalShares: number, totalVotes: number): ProcessedShareholder {
  const votesPerShare = naked.shareClass === 'A' ? 10 : 1
  const votes = naked.shares * (naked.votesPerShare || votesPerShare)
  
  return {
    id: naked.id,
    name: naked.name,
    personalNumber: naked.personalNumber,
    orgNumber: naked.orgNumber,
    type: naked.type,
    shares: naked.shares,
    shareClass: naked.shareClass,
    ownershipPercentage: totalShares > 0 ? (naked.shares / totalShares) * 100 : 0,
    acquisitionDate: naked.acquisitionDate,
    acquisitionPrice: naked.acquisitionPrice,
    votes,
    votesPercentage: totalVotes > 0 ? (votes / totalVotes) * 100 : 0,
  }
}

export function processShareTransaction(naked: NakedShareTransaction): ProcessedShareTransaction {
  return {
    id: naked.id,
    date: naked.date,
    type: STOCK_TRANSACTION_TYPE_MAP[naked.type],
    fromShareholder: naked.fromShareholder,
    toShareholder: naked.toShareholder,
    shares: naked.shares,
    pricePerShare: naked.pricePerShare,
    totalPrice: naked.shares * naked.pricePerShare,
    shareClass: naked.shareClass,
    notes: naked.notes,
  }
}

export function processPartner(naked: NakedPartner): ProcessedPartner {
  return {
    id: naked.id,
    name: naked.name,
    personalNumber: naked.personalNumber,
    type: naked.type,
    typeLabel: PARTNER_TYPE_MAP[naked.type],
    ownershipPercentage: naked.ownershipPercentage,
    profitSharePercentage: naked.profitSharePercentage,
    capitalContribution: naked.capitalContribution,
    currentCapitalBalance: naked.currentCapitalBalance,
    joinDate: naked.joinDate,
    isLimitedLiability: naked.type === 'kommanditdelägare',
  }
}

export function processPartnerWithdrawal(naked: NakedPartnerWithdrawal): ProcessedPartnerWithdrawal {
  return {
    id: naked.id,
    partnerId: naked.partnerId,
    partnerName: naked.partnerName,
    date: naked.date,
    amount: naked.amount,
    type: naked.type,
    typeLabel: WITHDRAWAL_TYPE_MAP[naked.type],
    description: naked.description,
    approved: naked.approved,
    statusLabel: naked.approved ? 'Godkänd' : 'Väntar',
  }
}

export function processMember(naked: NakedMember): ProcessedMember {
  return {
    id: naked.id,
    name: naked.name,
    email: naked.email,
    phone: naked.phone,
    memberNumber: naked.memberNumber,
    joinDate: naked.joinDate,
    membershipType: naked.membershipType,
    membershipTypeLabel: MEMBERSHIP_TYPE_MAP[naked.membershipType],
    status: MEMBERSHIP_STATUS_MAP[naked.status],
    currentYearFeePaid: naked.currentYearFeePaid,
    roles: naked.roles,
  }
}

export function processMembershipChange(naked: NakedMembershipChange): ProcessedMembershipChange {
  return {
    id: naked.id,
    memberId: naked.memberId,
    memberName: naked.memberName,
    date: naked.date,
    changeType: MEMBERSHIP_CHANGE_TYPE_MAP[naked.changeType],
    details: naked.details,
  }
}

export function processMeeting(naked: NakedMeeting): ProcessedMeeting {
  return {
    id: naked.id,
    date: naked.date,
    meetingNumber: naked.meetingNumber,
    location: naked.location,
    chairperson: naked.chairperson,
    secretary: naked.secretary,
    attendees: naked.attendees,
    status: MEETING_STATUS_MAP[naked.status],
    decisions: naked.decisions.map(d => ({
      id: d.id,
      title: d.title,
      description: d.description,
      decision: d.decision,
      votingResult: d.votingResult,
    })),
  }
}

// Batch processors
export function processShareholders(naked: NakedShareholder[]): ProcessedShareholder[] {
  const totalShares = naked.reduce((sum, s) => sum + s.shares, 0)
  const totalVotes = naked.reduce((sum, s) => {
    const votesPerShare = s.shareClass === 'A' ? 10 : 1
    return sum + s.shares * (s.votesPerShare || votesPerShare)
  }, 0)
  
  return naked.map(s => processShareholder(s, totalShares, totalVotes))
}

export function processShareTransactions(naked: NakedShareTransaction[]): ProcessedShareTransaction[] {
  return naked.map(processShareTransaction)
}

export function processPartners(naked: NakedPartner[]): ProcessedPartner[] {
  return naked.map(processPartner)
}

export function processPartnerWithdrawals(naked: NakedPartnerWithdrawal[]): ProcessedPartnerWithdrawal[] {
  return naked.map(processPartnerWithdrawal)
}

export function processMembers(naked: NakedMember[]): ProcessedMember[] {
  return naked.map(processMember)
}

export function processMembershipChanges(naked: NakedMembershipChange[]): ProcessedMembershipChange[] {
  return naked.map(processMembershipChange)
}

export function processMeetings(naked: NakedMeeting[]): ProcessedMeeting[] {
  return naked.map(processMeeting)
}
