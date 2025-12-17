// ============================================
// Transactions Service (In-Memory - Development Only)
// ============================================
//
// ⚠️ WARNING: This service uses in-memory state which is NOT suitable for production!
// Data is lost on every server restart and is not shared across serverless instances.
//
// For production, use the Supabase-backed service:
// import { getTransactions, ... } from '@/services/transactions-supabase'
//
// The Supabase service provides:
// - Persistent storage across restarts
// - Shared state across serverless functions
// - Proper user isolation with userId parameter
// ============================================

import type {
  TransactionFilters,
  ApiResponse,
  PaginatedResponse,
  SortConfig,
} from "@/types"
import type { TransactionStatus } from "@/lib/status-types"
import { TRANSACTION_STATUS_LABELS } from "@/lib/localization"
import {
  mockTransactions,
  mockAISuggestions,
  mockTransactionsWithAI,
  type Transaction,
  type TransactionWithAI,
  type AISuggestion,
} from "@/data/transactions"
import { delay } from "@/lib/utils"
import { compareValuesWithDirection } from "@/lib/compare"

// ============================================
// Configuration
// ============================================

/** Simulated network delay for development (ms). Set to 0 for no delay. */
const MOCK_DELAY = 0

// ============================================
// State Management (Development Only)
// ============================================

/**
 * @deprecated Use transactions-supabase.ts for production
 * 
 * ⚠️ CRITICAL: In-memory state - NOT suitable for production!
 * 
 * Problems with this approach:
 * - State is lost on server restart (every deployment)
 * - Not shared across serverless function instances
 * - Not thread-safe in multi-instance deployments
 * - No user isolation (all users share the same state)
 * 
 * For production, migrate to:
 * import { getTransactions, updateTransaction, ... } from '@/services/transactions-supabase'
 */
let transactionState = [...mockTransactionsWithAI]

/**
 * Create a successful API response
 */
function successResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    success: true,
    timestamp: new Date(),
  }
}

/**
 * Create an error API response with null data
 * Use this for "not found" scenarios where returning empty object is unsafe
 */
function errorResponseNull(error: string): ApiResponse<null> {
  return {
    data: null,
    success: false,
    error,
    timestamp: new Date(),
  }
}

/**
 * Create an error API response with specific data
 */
function errorResponse<T>(error: string, data: T): ApiResponse<T> {
  return {
    data,
    success: false,
    error,
    timestamp: new Date(),
  }
}

/**
 * Find transaction by ID, returns index and transaction or null
 */
function findTransaction(id: string): { index: number; transaction: TransactionWithAI } | null {
  const index = transactionState.findIndex(t => t.id === id)
  if (index === -1) return null
  return { index, transaction: transactionState[index] }
}

// ============================================
// Transaction Fetching Service
// ============================================

// ============================================
// Transaction Fetching Service (API-backed)
// ============================================

export async function getTransactions(_userId?: string): Promise<ApiResponse<Transaction[]>> {
  // Delegate to the main AI-enriched fetcher
  const response = await getTransactionsWithAI(_userId);
  if (response.success) {
    return { ...response, data: response.data };
  }
  return { ...response, data: [] };
}

export async function getTransactionsWithAI(_userId?: string): Promise<ApiResponse<TransactionWithAI[]>> {
  try {
    // In production/simulator mode, fetch from our API which acts as the Ledger
    const res = await fetch('/api/transactions', { cache: 'no-store' });
    const json = await res.json();

    if (!res.ok) throw new Error(json.error || 'Failed to fetch');

    return successResponse(json.data);
  } catch (err) {
    console.error('Fetch transactions failed:', err);
    // Fallback to empty or mock if API is unreachable (optional)
    return errorResponse('Failed to load transactions', []);
  }
}

export async function getTransactionsPaginated(
  _userId?: string,
  page: number = 1,
  pageSize: number = 20,
  filters?: TransactionFilters,
  sort?: SortConfig<Transaction>
): Promise<PaginatedResponse<TransactionWithAI>> {
  // Fetch ALL then paginate client/server side
  // Ideally, the API should handle pagination. For Phase 1, we pull all and slice.
  const response = await getTransactionsWithAI(_userId);
  let filtered = response.data || [];

  // Apply filters
  if (filters) {
    if (filters.status?.length) {
      filtered = filtered.filter(t => filters.status!.includes(t.status))
    }
    if (filters.category?.length) {
      filtered = filtered.filter(t => filters.category!.includes(t.category))
    }
    if (filters.account?.length) {
      filtered = filtered.filter(t => filters.account!.includes(t.account))
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      )
    }
    if (filters.dateRange) {
      filtered = filtered.filter(t =>
        t.timestamp >= filters.dateRange!.start &&
        t.timestamp <= filters.dateRange!.end
      )
    }
    if (filters.amountRange) {
      filtered = filtered.filter(t =>
        t.amountValue >= filters.amountRange!.min &&
        t.amountValue <= filters.amountRange!.max
      )
    }
  }

  // Apply sorting
  if (sort) {
    const direction = sort.direction === "asc" ? 1 : -1
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sort.field]
      const bVal = b[sort.field]
      return compareValuesWithDirection(aVal, bVal, direction)
    })
  }

  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedItems = filtered.slice(start, end)

  return {
    data: paginatedItems,
    total: filtered.length,
    page,
    pageSize,
    hasMore: end < filtered.length,
  }
}

export async function getTransaction(id: string, _userId?: string): Promise<ApiResponse<TransactionWithAI | null>> {
  // Efficiency: Fetch all and find (since we don't have get-one endpoint yet)
  const response = await getTransactionsWithAI(_userId);
  const found = response.data?.find(t => t.id === id) || null;

  if (!found) return errorResponse("Transaction not found", null);
  return successResponse(found);
}

// ============================================
// Transaction Status Service
// ============================================

export async function getTransactionsByStatus(
  _userId: string,
  status: TransactionStatus
): Promise<ApiResponse<TransactionWithAI[]>> {
  const response = await getTransactionsWithAI(_userId);
  const filtered = (response.data || []).filter(t => t.status === status);
  return successResponse(filtered);
}

export async function updateTransactionStatus(
  id: string,
  _userId: string,
  status: TransactionStatus
): Promise<ApiResponse<TransactionWithAI | null>> {
  try {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const json = await res.json();

    if (!res.ok) throw new Error(json.error);

    // We might want to return the full updated object. 
    // Current API returns just metadata. Let's re-fetch or reconstruct.
    // Re-fetch is safest.
    return getTransaction(id, _userId);

  } catch (err) {
    console.error('Update status failed:', err);
    return errorResponseNull('Failed to update status');
  }
}

// ============================================
// AI Suggestion Service
// ============================================

export async function getAISuggestion(transactionId: string): Promise<ApiResponse<AISuggestion | null>> {
  await delay(MOCK_DELAY)

  // TODO: Replace with actual API call
  // const response = await fetch(`/api/transactions/${transactionId}/ai-suggestion`)
  // return response.json()

  const suggestion = mockAISuggestions[transactionId] ?? null

  return successResponse(suggestion)
}

export async function approveAISuggestion(transactionId: string): Promise<ApiResponse<TransactionWithAI | null>> {
  await delay(MOCK_DELAY)

  // TODO: Replace with actual API call
  // const response = await fetch(`/api/transactions/${transactionId}/ai-suggestion/approve`, {
  //   method: 'POST',
  // })
  // return response.json()

  const found = findTransaction(transactionId)
  if (!found) {
    return errorResponseNull("Transaction not found")
  }

  const suggestion = found.transaction.aiSuggestion
  if (suggestion) {
    transactionState[found.index] = {
      ...transactionState[found.index],
      category: suggestion.category,
      isAIApproved: true,
      status: TRANSACTION_STATUS_LABELS.RECORDED,
    }
  }

  return successResponse(transactionState[found.index])
}

export async function rejectAISuggestion(transactionId: string): Promise<ApiResponse<TransactionWithAI | null>> {
  await delay(MOCK_DELAY)

  const found = findTransaction(transactionId)
  if (!found) {
    return errorResponseNull("Transaction not found")
  }

  transactionState[found.index] = {
    ...transactionState[found.index],
    aiSuggestion: undefined,
    isAIApproved: false,
  }

  return successResponse(transactionState[found.index])
}

// ============================================
// Transaction Mutation Service
// ============================================

export async function updateTransaction(
  id: string,
  _userId: string,
  updates: Partial<Transaction>
): Promise<ApiResponse<TransactionWithAI | null>> {
  try {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!res.ok) throw new Error('Failed to update');

    return getTransaction(id, _userId);
  } catch (err) {
    console.error('Update transaction failed:', err);
    return errorResponseNull('Failed to update transaction');
  }
}

export async function deleteTransaction(id: string, _userId?: string): Promise<ApiResponse<boolean>> {
  await delay(MOCK_DELAY)

  const found = findTransaction(id)
  if (!found) {
    return errorResponse("Transaction not found", false)
  }

  transactionState = transactionState.filter(t => t.id !== id)

  return successResponse(true)
}

// ============================================
// Bulk Operations Service
// ============================================

export async function bulkUpdateStatus(
  _userId: string,
  ids: string[],
  status: TransactionStatus
): Promise<ApiResponse<TransactionWithAI[]>> {
  await delay(MOCK_DELAY)

  const updated: TransactionWithAI[] = []

  for (const id of ids) {
    const found = findTransaction(id)
    if (found) {
      transactionState[found.index] = { ...transactionState[found.index], status }
      updated.push(transactionState[found.index])
    }
  }

  return successResponse(updated)
}

export async function bulkApproveAISuggestions(ids: string[]): Promise<ApiResponse<TransactionWithAI[]>> {
  await delay(MOCK_DELAY)

  const updated: TransactionWithAI[] = []

  for (const id of ids) {
    const found = findTransaction(id)
    if (found?.transaction.aiSuggestion) {
      const suggestion = found.transaction.aiSuggestion
      transactionState[found.index] = {
        ...transactionState[found.index],
        category: suggestion.category,
        isAIApproved: true,
        status: TRANSACTION_STATUS_LABELS.RECORDED,
      }
      updated.push(transactionState[found.index])
    }
  }

  return successResponse(updated)
}

// ============================================
// Transaction Stats Service
// ============================================

export interface TransactionStats {
  total: number
  pending: number
  booked: number
  missingDocs: number
  ignored: number
}

export async function getTransactionStats(_userId?: string): Promise<ApiResponse<TransactionStats>> {
  await delay(MOCK_DELAY)

  const stats: TransactionStats = {
    total: transactionState.length,
    pending: transactionState.filter(t => t.status === TRANSACTION_STATUS_LABELS.TO_RECORD).length,
    booked: transactionState.filter(t => t.status === TRANSACTION_STATUS_LABELS.RECORDED).length,
    missingDocs: transactionState.filter(t => t.status === TRANSACTION_STATUS_LABELS.MISSING_DOCUMENTATION).length,
    ignored: transactionState.filter(t => t.status === TRANSACTION_STATUS_LABELS.IGNORED).length,
  }

  return successResponse(stats)
}

// ============================================
// Testing Utilities
// ============================================

/**
 * Reset transaction state to initial mock data
 * Only use for testing purposes
 */
export function resetTransactionState(): void {
  transactionState = [...mockTransactionsWithAI]
}

/**
 * Get current transaction state (for testing/debugging)
 */
export function getTransactionState(): TransactionWithAI[] {
  return [...transactionState]
}
