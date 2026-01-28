// Integration types for ETL, Routing, and Messaging

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
  tenantId: string;
  sourceSystem: string;
  status: ETLSessionStatus;
  recordCount: number;
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
// Routing Types
// ============================================

export type RoutePatternType = 'exact' | 'prefix' | 'regex' | 'glob';

export interface RoutePattern {
  type: RoutePatternType;
  value: string;
}

export interface RouteEntry {
  id: string;
  pattern: RoutePattern;
  destination: string;
  priority: number;
  active: boolean;
  metadata?: Record<string, unknown>;
  matchCount: number;
  lastMatchedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RouteStats {
  totalRoutes: number;
  activeRoutes: number;
  totalMatches: number;
  topRoutes: Array<{
    id: string;
    pattern: string;
    matchCount: number;
  }>;
}

// ============================================
// Messaging Types
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

export type AggregationStatus = 'pending' | 'complete' | 'timeout';

export interface Aggregation {
  id: string;
  correlationId: string;
  status: AggregationStatus;
  expectedCount: number;
  receivedCount: number;
  messages: Array<{
    id: string;
    receivedAt: string;
    payload: Record<string, unknown>;
  }>;
  timeoutAt?: string;
  completedAt?: string;
  createdAt: string;
}

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
