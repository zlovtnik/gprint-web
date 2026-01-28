// Integration types for ETL, Pipelines, Integration Messages, and Channels

// ============================================
// ETL Types
// ============================================

export type ETLSessionStatus =
  | 'created'
  | 'loading'
  | 'loaded'
  | 'transforming'
  | 'transformed'
  | 'validating'
  | 'validated'
  | 'promoting'
  | 'completed'
  | 'failed'
  | 'rolled_back';

export interface ETLSession {
  id: string;
  sessionId: string;  // UUID identifier
  tenantId?: string;
  sourceSystem?: string;
  status: ETLSessionStatus;
  recordCount: number;
  totalRecords: number;
  errorCount: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export type StagingRecordStatus = 'pending' | 'transformed' | 'validated' | 'promoted' | 'failed';

export interface StagingRecord {
  id: string;
  sessionId: string;
  sourceData: Record<string, unknown>;
  transformedData?: Record<string, unknown>;
  status: StagingRecordStatus;
  errors?: string[];
  createdAt: string;
  updatedAt: string;
}

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationResult {
  recordId: string;
  field?: string;
  severity: ValidationSeverity;
  code: string;
  message: string;
}

// ============================================
// Pipeline Types
// ============================================

export interface PipelineTemplate {
  name: string;
  description?: string;
  steps: string[];
  parameters?: Record<string, { type: string; required?: boolean; default?: unknown }>;
  createdAt: string;
  updatedAt: string;
}

export type PipelineStatusState = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface PipelineStatus {
  sessionId: string;
  pipelineName: string;
  state: PipelineStatusState;
  currentStep?: string;
  progress?: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  results?: Record<string, unknown>;
}

// ============================================
// Routing Types
// ============================================

export type RoutePatternType = 'exact' | 'prefix' | 'regex' | 'glob';

export interface RoutePattern {
  type: RoutePatternType;
  value: string;
}

export interface RoutingRule {
  id: string;
  name: string;
  pattern: RoutePattern;
  destination: string;
  priority: number;
  active?: boolean;
  conditions?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Integration Message Types
// ============================================

export type IntegrationMessageStatus = 'pending' | 'processing' | 'processed' | 'failed' | 'dead_letter';

export interface IntegrationMessage {
  id: string;
  type: string;
  correlationId?: string;
  status: IntegrationMessageStatus;
  payload: Record<string, unknown>;
  headers?: Record<string, string>;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  error?: string;
}

// ============================================
// Channel Types
// ============================================

export type ChannelStatus = 'active' | 'paused' | 'draining';

export interface Channel {
  name: string;
  status: ChannelStatus;
  queueSize: number;
  consumerCount: number;
  messageRate: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// Aggregation Types
// ============================================

export type AggregationStatus = 'pending' | 'complete' | 'timeout';

export interface Aggregation {
  id: string;
  correlationId: string;
  status: AggregationStatus;
  expectedCount: number;
  currentCount: number;
  receivedCount?: number;
  messages: Array<{
    id: string;
    receivedAt: string;
    payload: Record<string, unknown>;
  }>;
  timeoutAt?: string;
  completedAt?: string;
  createdAt: string;
}

// ============================================
// Dead Letter Types
// ============================================

export interface DeadLetterMessage {
  id: number;
  originalQueue: string;
  errorMessage: string;
  errorCode?: string;
  retryCount: number;
  payload: Record<string, unknown>;
  headers?: Record<string, string>;
  failedAt: string;
  createdAt: string;
}
