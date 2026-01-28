// Integration API functions for ETL, Routing, and Messaging
import { fetchApi, fetchApiSnake, buildSearchParams } from './client';
import type { Result } from '$lib/utils/result';
import type { ApiError, PaginatedResponse } from '$lib/types/api';
import type {
  ETLSession,
  StagingRecord,
  ValidationResult,
  RouteEntry,
  RouteStats,
  Channel,
  Aggregation,
  DeadLetterMessage
} from '$lib/types/integration';

// Integration backend base - can be different from main API
const INTEGRATION_API_BASE = import.meta.env.VITE_INTEGRATION_API_URL || 'http://localhost:4000/api';

// Helper to prefix integration API base URL to endpoint paths
const prefixIntegrationUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${INTEGRATION_API_BASE}/${cleanPath}`;
};

// ============================================
// ETL API
// ============================================

export interface ListSessionsParams {
  status?: string;
  limit?: number;
  page?: number;
}

export interface CreateSessionData {
  tenantId: string;
  sourceSystem: string;
}

export const etlApi = {
  // Sessions
  listSessions: (params?: ListSessionsParams): Promise<Result<ETLSession[], ApiError>> =>
    fetchApi<ETLSession[]>(prefixIntegrationUrl(`etl/sessions${buildSearchParams(params ?? {})}`)),

  getSession: (id: string): Promise<Result<ETLSession, ApiError>> =>
    fetchApi<ETLSession>(prefixIntegrationUrl(`etl/sessions/${encodeURIComponent(id)}`)),

  createSession: (data: CreateSessionData): Promise<Result<{ sessionId: string }, ApiError>> =>
    fetchApiSnake<{ sessionId: string }>(prefixIntegrationUrl('etl/sessions'), {
      method: 'POST',
      json: data
    }),

  // Staging
  getStagingRecords: (
    sessionId: string,
    params?: { status?: string; page?: number }
  ): Promise<Result<PaginatedResponse<StagingRecord>, ApiError>> =>
    fetchApi<PaginatedResponse<StagingRecord>>(
      prefixIntegrationUrl(`etl/sessions/${encodeURIComponent(sessionId)}/staging${buildSearchParams(params ?? {})}`)
    ),

  // Transformation
  transformSession: (sessionId: string): Promise<Result<void, ApiError>> =>
    fetchApi<void>(prefixIntegrationUrl(`etl/sessions/${encodeURIComponent(sessionId)}/transform`), { method: 'POST' }),

  // Validation
  validateSession: (sessionId: string): Promise<Result<ValidationResult[], ApiError>> =>
    fetchApi<ValidationResult[]>(prefixIntegrationUrl(`etl/sessions/${encodeURIComponent(sessionId)}/validate`), { method: 'POST' }),

  // Promotion
  promoteSession: (sessionId: string): Promise<Result<{ promotedCount: number }, ApiError>> =>
    fetchApi<{ promotedCount: number }>(prefixIntegrationUrl(`etl/sessions/${encodeURIComponent(sessionId)}/promote`), { method: 'POST' }),

  // Rollback
  rollbackSession: (sessionId: string): Promise<Result<void, ApiError>> =>
    fetchApi<void>(prefixIntegrationUrl(`etl/sessions/${encodeURIComponent(sessionId)}/rollback`), { method: 'POST' }),

  // File upload
  uploadFile: async (
    sessionId: string,
    file: File,
    config: Record<string, unknown>
  ): Promise<Result<{ recordsLoaded: number }, ApiError>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('config', JSON.stringify(config));

    return fetchApi<{ recordsLoaded: number }>(prefixIntegrationUrl(`etl/sessions/${encodeURIComponent(sessionId)}/upload`), {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set content-type for FormData
    });
  }
};

// ============================================
// Routing API
// ============================================

export interface ListRoutesParams {
  active?: boolean;
  limit?: number;
  page?: number;
}

export interface CreateRouteData {
  pattern: { type: string; value: string };
  destination: string;
  priority?: number;
  active?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateRouteData extends Partial<CreateRouteData> {}

export const routesApi = {
  // Routes
  listRoutes: (params?: ListRoutesParams): Promise<Result<RouteEntry[], ApiError>> =>
    fetchApi<RouteEntry[]>(prefixIntegrationUrl(`routes${buildSearchParams(params ?? {})}`)),

  getRoute: (id: string): Promise<Result<RouteEntry, ApiError>> =>
    fetchApi<RouteEntry>(prefixIntegrationUrl(`routes/${id}`)),

  createRoute: (data: CreateRouteData): Promise<Result<RouteEntry, ApiError>> =>
    fetchApiSnake<RouteEntry>(prefixIntegrationUrl('routes'), {
      method: 'POST',
      json: data
    }),

  updateRoute: (id: string, data: UpdateRouteData): Promise<Result<RouteEntry, ApiError>> =>
    fetchApiSnake<RouteEntry>(prefixIntegrationUrl(`routes/${id}`), {
      method: 'PUT',
      json: data
    }),

  deleteRoute: (id: string): Promise<Result<void, ApiError>> =>
    fetchApi<void>(prefixIntegrationUrl(`routes/${id}`), { method: 'DELETE' }),

  toggleRoute: (id: string): Promise<Result<RouteEntry, ApiError>> =>
    fetchApi<RouteEntry>(prefixIntegrationUrl(`routes/${id}/toggle`), { method: 'POST' }),

  // Stats
  getRouteStats: (): Promise<Result<RouteStats, ApiError>> =>
    fetchApi<RouteStats>(prefixIntegrationUrl('routes/stats'))
};

// ============================================
// Messaging API
// ============================================

export interface ListChannelsParams {
  limit?: number;
  page?: number;
}

export interface ListAggregationsParams {
  status?: 'pending' | 'complete' | 'timeout';
  limit?: number;
  page?: number;
}

export interface ListDeadLetterParams {
  limit?: number;
  page?: number;
}

export const messagesApi = {
  // Channels
  listChannels: (params?: ListChannelsParams): Promise<Result<Channel[], ApiError>> =>
    fetchApi<Channel[]>(prefixIntegrationUrl(`messages/channels${buildSearchParams(params ?? {})}`)),

  getChannel: (name: string): Promise<Result<Channel, ApiError>> =>
    fetchApi<Channel>(prefixIntegrationUrl(`messages/channels/${encodeURIComponent(name)}`)),

  // Aggregations
  listAggregations: (params?: ListAggregationsParams): Promise<Result<Aggregation[], ApiError>> =>
    fetchApi<Aggregation[]>(prefixIntegrationUrl(`messages/aggregations${buildSearchParams(params ?? {})}`)),

  // Dead Letter Queue
  listDeadLetterMessages: (
    params?: ListDeadLetterParams
  ): Promise<Result<DeadLetterMessage[], ApiError>> =>
    fetchApi<DeadLetterMessage[]>(prefixIntegrationUrl(`messages/dead-letter${buildSearchParams(params ?? {})}`)),

  retryDeadLetterMessage: (id: number): Promise<Result<void, ApiError>> =>
    fetchApi<void>(prefixIntegrationUrl(`messages/dead-letter/${id}/retry`), { method: 'POST' }),

  deleteDeadLetterMessage: (id: number): Promise<Result<void, ApiError>> =>
    fetchApi<void>(prefixIntegrationUrl(`messages/dead-letter/${id}`), { method: 'DELETE' })
};
