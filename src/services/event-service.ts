// ============================================
// Händelser Event Service
// Manages event emission and storage
// ============================================

import type {
    HändelseEvent,
    CreateEventInput,
    EventFilters,
    EventSource,
    EventCategory,
} from '@/types/events'

// Storage key for localStorage
const STORAGE_KEY = 'scope_events'

/**
 * Generate a UUID for events
 */
function generateId(): string {
    return crypto.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Generate a simple hash for event integrity
 */
function generateHash(event: Omit<HändelseEvent, 'hash'>): string {
    const content = JSON.stringify({
        id: event.id,
        timestamp: event.timestamp,
        source: event.source,
        category: event.category,
        action: event.action,
        title: event.title,
        previousHash: event.previousHash,
    })
    // Simple hash for demo - in production use crypto.subtle.digest
    let hash = 0
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
}

/**
 * Get all events from storage
 */
export function getEventsFromStorage(): HändelseEvent[] {
    if (typeof window === 'undefined') return []

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return []

        const events = JSON.parse(stored) as HändelseEvent[]
        // Convert timestamps back to Date objects
        return events.map(e => ({
            ...e,
            timestamp: new Date(e.timestamp),
        }))
    } catch {
        return []
    }
}

/**
 * Save events to storage
 */
function saveEventsToStorage(events: HändelseEvent[]): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
    } catch (error) {
        console.error('Failed to save events:', error)
    }
}

/**
 * Emit a new event to the timeline
 */
export function emitEvent(input: CreateEventInput): HändelseEvent {
    const events = getEventsFromStorage()
    const previousHash = events.length > 0 ? events[0].hash : undefined

    const eventWithoutHash: Omit<HändelseEvent, 'hash'> = {
        id: generateId(),
        timestamp: new Date(),
        ...input,
        previousHash,
    }

    const event: HändelseEvent = {
        ...eventWithoutHash,
        hash: generateHash(eventWithoutHash),
    }

    // Add to beginning (most recent first)
    const updatedEvents = [event, ...events]

    // Keep max 500 events
    if (updatedEvents.length > 500) {
        updatedEvents.length = 500
    }

    saveEventsToStorage(updatedEvents)

    // Dispatch custom event for real-time updates
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('händelse', { detail: event }))
    }

    return event
}

/**
 * Get events with optional filters
 */
export function getEvents(filters?: EventFilters): HändelseEvent[] {
    let events = getEventsFromStorage()

    if (!filters) return events

    // Filter by source
    if (filters.source) {
        const sources = Array.isArray(filters.source) ? filters.source : [filters.source]
        events = events.filter(e => sources.includes(e.source))
    }

    // Filter by category
    if (filters.category) {
        const categories = Array.isArray(filters.category) ? filters.category : [filters.category]
        events = events.filter(e => categories.includes(e.category))
    }

    // Filter by date range
    if (filters.dateFrom) {
        events = events.filter(e => e.timestamp >= filters.dateFrom!)
    }
    if (filters.dateTo) {
        events = events.filter(e => e.timestamp <= filters.dateTo!)
    }

    // Filter by search text
    if (filters.search) {
        const search = filters.search.toLowerCase()
        events = events.filter(e =>
            e.title.toLowerCase().includes(search) ||
            e.description?.toLowerCase().includes(search) ||
            e.action.toLowerCase().includes(search)
        )
    }

    // Filter by related entity
    if (filters.relatedToId) {
        events = events.filter(e =>
            e.relatedTo?.some(r => r.id === filters.relatedToId)
        )
    }

    return events
}

/**
 * Get event counts by source
 */
export function getEventCountsBySource(): Record<EventSource, number> {
    const events = getEventsFromStorage()
    const counts: Record<EventSource, number> = {
        ai: 0,
        user: 0,
        system: 0,
        document: 0,
        authority: 0,
    }

    for (const event of events) {
        counts[event.source]++
    }

    return counts
}

/**
 * Clear all events (for testing)
 */
export function clearEvents(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
}

// ============================================
// Convenience functions for common events
// ============================================

/**
 * Emit an AI action event
 */
export function emitAIEvent(
    action: string,
    title: string,
    category: EventCategory,
    options?: {
        description?: string
        relatedTo?: HändelseEvent['relatedTo']
        metadata?: Record<string, unknown>
    }
): HändelseEvent {
    return emitEvent({
        source: 'ai',
        category,
        action,
        title,
        actor: { type: 'ai', name: 'Scope AI' },
        ...options,
    })
}

/**
 * Emit a user action event
 */
export function emitUserEvent(
    action: string,
    title: string,
    category: EventCategory,
    options?: {
        description?: string
        relatedTo?: HändelseEvent['relatedTo']
        metadata?: Record<string, unknown>
    }
): HändelseEvent {
    return emitEvent({
        source: 'user',
        category,
        action,
        title,
        actor: { type: 'user', name: 'Du' },
        ...options,
    })
}

/**
 * Emit a system event
 */
export function emitSystemEvent(
    action: string,
    title: string,
    category: EventCategory = 'system',
    options?: {
        description?: string
        metadata?: Record<string, unknown>
    }
): HändelseEvent {
    return emitEvent({
        source: 'system',
        category,
        action,
        title,
        actor: { type: 'system', name: 'System' },
        ...options,
    })
}

/**
 * Emit an authority event (Skatteverket, Bolagsverket, etc.)
 */
export function emitAuthorityEvent(
    action: string,
    title: string,
    authority: string,
    category: EventCategory,
    options?: {
        description?: string
        proof?: HändelseEvent['proof']
        relatedTo?: HändelseEvent['relatedTo']
    }
): HändelseEvent {
    return emitEvent({
        source: 'authority',
        category,
        action,
        title,
        actor: { type: 'authority', id: authority, name: authority },
        ...options,
    })
}
