// Integration API functions for ETL, Pipelines, Integration Messages, and Channels
import { fetchIntegrationApi, fetchIntegrationApiSnake, buildSearchParams } from './client';
import type { Result } from '$lib/utils/result';
import type { ApiError } from '$lib/types/api';
import type {
  ETLSession,
  ValidationResult,
  Channel,
  Aggregation,
  DeadLetterMessage,
  RoutingRule,
  PipelineTemplate,
  PipelineStatus,
  IntegrationMessage
} from '$lib/types/integration';

// Type alias for search parameter values
type SearchParamValue = string | number | boolean | undefined;

// ============================================
// ETL Sessions API - /api/v1/etl/sessions
// ============================================

export interface ListSessionsParams {
  [key: string]: SearchParamValue;
  status?: string;
  limit?: number;
  page?: number;
}

export interface CreateSessionData {
  tenantId?: string;
  sourceSystem?: string;
  metadata?: Record<string, unknown>;
}

export interface LoadDataPayload {
  data: Record<string, unknown>[];
  config?: Record<string, unknown>;
}

export const etlApi = {
  // GET /api/v1/etl/sessions - List all ETL sessions
  listSessions: (params?: ListSessionsParams): Promise<Result<ETLSession[], ApiError>> =>
    fetchIntegrationApi<ETLSession[]>(`v1/etl/sessions${buildSearchParams(params ?? {})}`),

  // POST /api/v1/etl/sessions - Create new staging session
  createSession: (data?: CreateSessionData): Promise<Result<ETLSession, ApiError>> =>
    fetchIntegrationApiSnake<ETLSession>('v1/etl/sessions', {
      method: 'POST',
      ...(data && { json: data })
    }),

  // GET /api/v1/etl/sessions/:id - Get session status
  getSession: (id: string): Promise<Result<ETLSession, ApiError>> =>
    fetchIntegrationApi<ETLSession>(`v1/etl/sessions/${encodeURIComponent(id)}`),

  // DELETE /api/v1/etl/sessions/:id - Rollback/cancel session
  deleteSession: (id: string): Promise<Result<void, ApiError>> =>
    fetchIntegrationApi<void>(`v1/etl/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // POST /api/v1/etl/sessions/:id/load - Load data to staging
  loadData: (sessionId: string, payload: LoadDataPayload): Promise<Result<{ recordsLoaded: number }, ApiError>> =>
    fetchIntegrationApiSnake<{ recordsLoaded: number }>(`v1/etl/sessions/${encodeURIComponent(sessionId)}/load`, {
      method: 'POST',
      json: payload
    }),

  // POST /api/v1/etl/sessions/:id/transform - Transform staging data
  transformSession: (sessionId: string): Promise<Result<{ transformedCount: number }, ApiError>> =>
    fetchIntegrationApi<{ transformedCount: number }>(`v1/etl/sessions/${encodeURIComponent(sessionId)}/transform`, { method: 'POST' }),

  // POST /api/v1/etl/sessions/:id/validate - Validate staging data
  validateSession: (sessionId: string): Promise<Result<ValidationResult[], ApiError>> =>
    fetchIntegrationApi<ValidationResult[]>(`v1/etl/sessions/${encodeURIComponent(sessionId)}/validate`, { method: 'POST' }),

  // POST /api/v1/etl/sessions/:id/promote - Promote to production
  promoteSession: (sessionId: string): Promise<Result<{ promotedCount: number }, ApiError>> =>
    fetchIntegrationApi<{ promotedCount: number }>(`v1/etl/sessions/${encodeURIComponent(sessionId)}/promote`, { method: 'POST' }),

  // POST /api/v1/etl/cleanup - Cleanup old sessions
  cleanup: (params?: { olderThanDays?: number }): Promise<Result<{ cleanedCount: number }, ApiError>> =>
    fetchIntegrationApiSnake<{ cleanedCount: number }>('v1/etl/cleanup', {
      method: 'POST',
      json: params ?? {}
    })
};

// ============================================
// Pipelines API - /api/v1/pipelines
// ============================================

export const pipelinesApi = {
  // GET /api/v1/pipelines/templates - List available pipelines
  listTemplates: (): Promise<Result<PipelineTemplate[], ApiError>> =>
    fetchIntegrationApi<PipelineTemplate[]>('v1/pipelines/templates'),

  // POST /api/v1/pipelines/:name/run - Run a pipeline
  runPipeline: (name: string, params?: Record<string, unknown>): Promise<Result<{ sessionId: string }, ApiError>> =>
    fetchIntegrationApiSnake<{ sessionId: string }>(`v1/pipelines/${encodeURIComponent(name)}/run`, {
      method: 'POST',
      json: params ?? {}
    }),

  // GET /api/v1/pipelines/status/:session_id - Get pipeline status
  getStatus: (sessionId: string): Promise<Result<PipelineStatus, ApiError>> =>
    fetchIntegrationApi<PipelineStatus>(`v1/pipelines/status/${encodeURIComponent(sessionId)}`),

  // DELETE /api/v1/pipelines/:session_id - Cancel running pipeline
  cancelPipeline: (sessionId: string): Promise<Result<void, ApiError>> =>
    fetchIntegrationApi<void>(`v1/pipelines/${encodeURIComponent(sessionId)}`, { method: 'DELETE' })
};

// ============================================
// Integration Messages API - /api/v1/integration
// ============================================

export interface CreateMessageData {
  type: string;
  payload: Record<string, unknown>;
  correlationId?: string;
  headers?: Record<string, string>;
}

export interface TransformMessageData {
  message: Record<string, unknown>;
  format: string;
  options?: Record<string, unknown>;
}

export const integrationApi = {
  // POST /api/v1/integration/messages - Submit integration message
  createMessage: (data: CreateMessageData): Promise<Result<IntegrationMessage, ApiError>> =>
    fetchIntegrationApiSnake<IntegrationMessage>('v1/integration/messages', {
      method: 'POST',
      json: data
    }),

  // POST /api/v1/integration/messages/transform - Transform message format
  transformMessage: (data: TransformMessageData): Promise<Result<{ transformed: Record<string, unknown> }, ApiError>> =>
    fetchIntegrationApiSnake<{ transformed: Record<string, unknown> }>('v1/integration/messages/transform', {
      method: 'POST',
      json: data
    }),

  // POST /api/v1/integration/messages/check-duplicate - Check for duplicates
  checkDuplicate: (messageId: string, correlationId?: string): Promise<Result<{ isDuplicate: boolean; existingId?: string }, ApiError>> =>
    fetchIntegrationApiSnake<{ isDuplicate: boolean; existingId?: string }>('v1/integration/messages/check-duplicate', {
      method: 'POST',
      json: { messageId, correlationId }
    }),

  // POST /api/v1/integration/messages/:id/processed - Mark as processed
  markProcessed: (id: string): Promise<Result<void, ApiError>> =>
    fetchIntegrationApi<void>(`v1/integration/messages/${encodeURIComponent(id)}/processed`, { method: 'POST' }),

  // POST /api/v1/integration/messages/:id/retry - Retry failed message
  retryMessage: (id: string): Promise<Result<IntegrationMessage, ApiError>> =>
    fetchIntegrationApi<IntegrationMessage>(`v1/integration/messages/${encodeURIComponent(id)}/retry`, { method: 'POST' }),

  // POST /api/v1/integration/messages/:id/dead-letter - Move to DLQ
  moveToDeadLetter: (id: string, reason?: string): Promise<Result<DeadLetterMessage, ApiError>> =>
    fetchIntegrationApiSnake<DeadLetterMessage>(`v1/integration/messages/${encodeURIComponent(id)}/dead-letter`, {
      method: 'POST',
      json: { reason }
    }),

  // GET /api/v1/integration/routing-rules - Get routing rules
  getRoutingRules: (): Promise<Result<RoutingRule[], ApiError>> =>
    fetchIntegrationApi<RoutingRule[]>('v1/integration/routing-rules'),

  // POST /api/v1/integration/aggregations - Start aggregation
  startAggregation: (correlationId: string, expectedCount: number, timeoutMs?: number): Promise<Result<Aggregation, ApiError>> =>
    fetchIntegrationApiSnake<Aggregation>('v1/integration/aggregations', {
      method: 'POST',
      json: { correlationId, expectedCount, timeoutMs }
    }),

  // POST /api/v1/integration/aggregations/:id/messages - Add to aggregation
  addToAggregation: (aggregationId: string, message: Record<string, unknown>): Promise<Result<Aggregation, ApiError>> =>
    fetchIntegrationApiSnake<Aggregation>(`v1/integration/aggregations/${encodeURIComponent(aggregationId)}/messages`, {
      method: 'POST',
      json: { message }
    }),

  // POST /api/v1/integration/aggregations/:id/complete - Complete aggregation
  completeAggregation: (aggregationId: string): Promise<Result<Aggregation, ApiError>> =>
    fetchIntegrationApi<Aggregation>(`v1/integration/aggregations/${encodeURIComponent(aggregationId)}/complete`, { method: 'POST' })
};

// ============================================
// Channels API - /api/v1/channels
// ============================================

export interface ListChannelsParams {
  [key: string]: SearchParamValue;
  limit?: number;
  page?: number;
}

export interface CreateChannelData {
  name: string;
  metadata?: Record<string, unknown>;
}

export const channelsApi = {
  // GET /api/v1/channels - List active channels
  listChannels: (params?: ListChannelsParams): Promise<Result<Channel[], ApiError>> =>
    fetchIntegrationApi<Channel[]>(`v1/channels${buildSearchParams(params ?? {})}`),

  // POST /api/v1/channels - Create/get channel
  createChannel: (data: CreateChannelData): Promise<Result<Channel, ApiError>> =>
    fetchIntegrationApiSnake<Channel>('v1/channels', {
      method: 'POST',
      json: data
    }),

  // GET /api/v1/channels/:name - Get channel stats
  getChannel: (name: string): Promise<Result<Channel, ApiError>> =>
    fetchIntegrationApi<Channel>(`v1/channels/${encodeURIComponent(name)}`),

  // POST /api/v1/channels/:name/drain - Drain messages (debug)
  drainChannel: (name: string): Promise<Result<{ drainedCount: number }, ApiError>> =>
    fetchIntegrationApi<{ drainedCount: number }>(`v1/channels/${encodeURIComponent(name)}/drain`, { method: 'POST' })
};
