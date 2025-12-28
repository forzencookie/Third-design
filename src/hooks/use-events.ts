// ============================================
// useEvents Hook
// React hook for accessing event timeline
// ============================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { HändelseEvent, EventFilters, EventSource, CreateEventInput } from '@/types/events'
import {
    getEvents,
    getEventCountsBySource,
    emitEvent,
    emitAIEvent,
    emitUserEvent,
    emitSystemEvent,
    emitAuthorityEvent,
} from '@/services/event-service'

export interface UseEventsReturn {
    /** All events matching current filters */
    events: HändelseEvent[]
    /** Event counts by source type */
    countsBySource: Record<EventSource, number>
    /** Total event count */
    totalCount: number
    /** Current filters */
    filters: EventFilters
    /** Update filters */
    setFilters: (filters: EventFilters) => void
    /** Refresh events from storage */
    refresh: () => void
    /** Emit a new event */
    emit: (input: CreateEventInput) => HändelseEvent
    /** Convenience: emit AI event */
    emitAI: typeof emitAIEvent
    /** Convenience: emit user event */
    emitUser: typeof emitUserEvent
    /** Convenience: emit system event */
    emitSystem: typeof emitSystemEvent
    /** Convenience: emit authority event */
    emitAuthority: typeof emitAuthorityEvent
}

/**
 * Hook for accessing and managing events
 */
export function useEvents(initialFilters?: EventFilters): UseEventsReturn {
    const [events, setEvents] = useState<HändelseEvent[]>([])
    const [countsBySource, setCountsBySource] = useState<Record<EventSource, number>>({
        ai: 0, user: 0, system: 0, document: 0, authority: 0,
    })
    const [filters, setFilters] = useState<EventFilters>(initialFilters || {})

    // Load events
    const refresh = useCallback(() => {
        const allEvents = getEvents(filters)
        setEvents(allEvents)
        setCountsBySource(getEventCountsBySource())
    }, [filters])

    // Initial load and when filters change
    useEffect(() => {
        refresh()
    }, [refresh])

    // Listen for new events
    useEffect(() => {
        const handleNewEvent = () => {
            refresh()
        }

        window.addEventListener('händelse', handleNewEvent)
        return () => window.removeEventListener('händelse', handleNewEvent)
    }, [refresh])

    // Emit wrapper that also refreshes
    const emit = useCallback((input: CreateEventInput) => {
        const event = emitEvent(input)
        // The custom event listener will trigger refresh
        return event
    }, [])

    return {
        events,
        countsBySource,
        totalCount: events.length,
        filters,
        setFilters,
        refresh,
        emit,
        emitAI: emitAIEvent,
        emitUser: emitUserEvent,
        emitSystem: emitSystemEvent,
        emitAuthority: emitAuthorityEvent,
    }
}

/**
 * Get a single event by ID
 */
export function useEvent(id: string): HändelseEvent | null {
    const [event, setEvent] = useState<HändelseEvent | null>(null)

    useEffect(() => {
        const events = getEvents()
        const found = events.find(e => e.id === id)
        setEvent(found || null)
    }, [id])

    return event
}

// Re-export types for convenience
export type { CreateEventInput } from '@/types/events'

