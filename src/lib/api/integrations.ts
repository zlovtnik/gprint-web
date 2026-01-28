// Integration API functions for ETL, Routing, and Messaging
import { fetchIntegrationApi, fetchIntegrationApiSnake, buildSearchParams } from './client';
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

// Type alias for search parameter values
type SearchParamValue = string | number | boolean | undefined;

// ============================================
// ETL API
// ============================================

export interface ListSessionsParams {
  [key: string]: SearchParamValue;
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
    fetchIntegrationApi<ETLSession[]>(`etl/sessions${buildSearchParams(params ?? {})}`),

  getSession: (id: string): Promise<Result<ETLSession, ApiError>> =>
    fetchIntegrationApi<ETLSession>(`etl/sessions/${encodeURIComponent(id)}`),

  createSession: (data: CreateSessionData): Promise<Result<{ sessionId: string }, ApiError>> =>
    fetchIntegrationApiSnake<{ sessionId: string }>('etl/sessions', {
      method: 'POST',
      json: data
    }),

  // Staging
  getStagingRecords: (
    sessionId: string,
    params?: { status?: string; page?: number }
  ): Promise<Result<PaginatedResponse<StagingRecord>, ApiError>> =>
    fetchIntegrationApi<PaginatedResponse<StagingRecord>>(
      `etl/sessions/${encodeURIComponent(sessionId)}/staging${buildSearchParams(params ?? {})}`
    ),

  // Transformation
  transformSession: (sessionId: string): Promise<Result<void, ApiError>> =>
    fetchIntegrationApi<void>(`etl/sessions/${encodeURIComponent(sessionId)}/transform`, { method: 'POST' }),

  // Validation
  validateSession: (sessionId: string): Promise<Result<ValidationResult[], ApiError>> =>
    fetchIntegrationApi<ValidationResult[]>(`etl/sessions/${encodeURIComponent(sessionId)}/validate`, { method: 'POST' }),

  // Promotion
  promoteSession: (sessionId: string): Promise<Result<{ promotedCount: number }, ApiError>> =>
    fetchIntegrationApi<{ promotedCount: number }>(`etl/sessions/${encodeURIComponent(sessionId)}/promote`, { method: 'POST' }),

  // Rollback
  rollbackSession: (sessionId: string): Promise<Result<void, ApiError>> =>
    fetchIntegrationApi<void>(`etl/sessions/${encodeURIComponent(sessionId)}/rollback`, { method: 'POST' }),

  // File upload
  uploadFile: async (
    sessionId: string,
    file: File,
    config: Record<string, unknown>
  ): Promise<Result<{ recordsLoaded: number }, ApiError>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('config', JSON.stringify(config));

    return fetchIntegrationApi<{ recordsLoaded: number }>(`etl/sessions/${encodeURIComponent(sessionId)}/upload`, {
      method: 'POST',
      body: formData
    });
  }
};

// ============================================
// Routing API
// ============================================

export interface ListRoutesParams {
  [key: string]: SearchParamValue;
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
    fetchIntegrationApi<RouteEntry[]>(`routes${buildSearchParams(params ?? {})}`),

  getRoute: (id: string): Promise<Result<RouteEntry, ApiError>> =>
    fetchIntegrationApi<RouteEntry>(`routes/${encodeURIComponent(id)}`),

  createRoute: (data: CreateRouteData): Promise<Result<RouteEntry, ApiError>> =>
    fetchIntegrationApiSnake<RouteEntry>('routes', {
      method: 'POST',
      json: data
    }),

  updateRoute: (id: string, data: UpdateRouteData): Promise<Result<RouteEntry, ApiError>> =>
    fetchIntegrationApiSnake<RouteEntry>(`routes/${encodeURIComponent(id)}`, {
      method: 'PUT',
      json: data
    }),

  deleteRoute: (id: string): Promise<Result<void, ApiError>> =>
    fetchIntegrationApi<void>(`routes/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  toggleRoute: (id: string): Promise<Result<RouteEntry, ApiError>> =>
    fetchIntegrationApi<RouteEntry>(`routes/${encodeURIComponent(id)}/toggle`, { method: 'POST' }),

  // Stats
  getRouteStats: (): Promise<Result<RouteStats, ApiError>> =>
    fetchIntegrationApi<RouteStats>('routes/stats')
};

// ============================================
// Messaging API
// ============================================

export interface ListChannelsParams {
  [key: string]: SearchParamValue;
  limit?: number;
  page?: number;
}

export interface ListAggregationsParams {
  [key: string]: SearchParamValue;
  status?: 'pending' | 'complete' | 'timeout';
  limit?: number;
  page?: number;
}

export interface ListDeadLetterParams {
  [key: string]: SearchParamValue;
  limit?: number;
  page?: number;
}

export const messagesApi = {
  // Channels
  listChannels: (params?: ListChannelsParams): Promise<Result<Channel[], ApiError>> =>
    fetchIntegrationApi<Channel[]>(`messages/channels${buildSearchParams(params ?? {})}`),

  getChannel: (name: string): Promise<Result<Channel, ApiError>> =>
    fetchIntegrationApi<Channel>(`messages/channels/${encodeURIComponent(name)}`),

  // Aggregations
  listAggregations: (params?: ListAggregationsParams): Promise<Result<Aggregation[], ApiError>> =>
    fetchIntegrationApi<Aggregation[]>(`messages/aggregations${buildSearchParams(params ?? {})}`),

  // Dead Letter Queue
  listDeadLetterMessages: (
    params?: ListDeadLetterParams
  ): Promise<Result<DeadLetterMessage[], ApiError>> =>
    fetchIntegrationApi<DeadLetterMessage[]>(`messages/dead-letter${buildSearchParams(params ?? {})}`),

  retryDeadLetterMessage: (id: number): Promise<Result<void, ApiError>> =>
    fetchIntegrationApi<void>(`messages/dead-letter/${id}/retry`, { method: 'POST' }),

  deleteDeadLetterMessage: (id: number): Promise<Result<void, ApiError>> =>
    fetchIntegrationApi<void>(`messages/dead-letter/${id}`, { method: 'DELETE' })
};
