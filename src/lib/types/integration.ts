// Integration module types for GprintEx ETL, Routing, and Messaging

// ============================================
// ETL Types
// ============================================

export type SessionStatus =
  | 'created'
  | 'loading'
  | 'transforming'
  | 'validating'
  | 'promoting'
  | 'completed'
  | 'failed'
  | 'rolled_back';

export interface ETLSession {
  sessionId: string;
  tenantId: string;
  sourceSystem: string;
  status: SessionStatus;
  totalRecords: number;
  validRecords: number;
  errorRecords: number;
  promotedRecords: number;
  createdAt: string;
  completedAt: string | null;
}

export interface StagingRecord {
  seqNum: number;
  sessionId: string;
  tenantId: string;
  entityType: 'CONTRACT' | 'CUSTOMER';
  entityId: string;
  rawData: Record<string, unknown>;
  transformedData: Record<string, unknown> | null;
  validationStatus: 'pending' | 'valid' | 'invalid';
  errorMessage: string | null;
  createdAt: string;
}

export interface ValidationResult {
  recordId: number;
  issueType: 'VALID' | 'MISSING_FIELD' | 'PARSE_ERROR' | 'CONSTRAINT';
  message: string;
  context: string | null;
}

export interface ImportConfig {
  file: File;
  format: 'csv' | 'json' | 'jsonl' | 'xml';
  entityType: 'CONTRACT' | 'CUSTOMER';
  sourceSystem: string;
  encoding: 'utf8' | 'latin1' | 'utf16';
  fieldMapping: Record<string, string>;
}

// ============================================
// Routing Types
// ============================================

export type PatternType = 'exact' | 'glob' | 'regex' | 'function';

export interface RoutePattern {
  type: PatternType;
  value: string;
}

export interface RouteEntry {
  id: string;
  pattern: RoutePattern;
  destination: string;
  priority: number;
  active: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface RouteStats {
  totalRoutes: number;
  activeRoutes: number;
  routedCount: number;
  unroutedCount: number;
  routeHits: Record<string, number>;
}

// ============================================
// Message Types
// ============================================

export type MessagePriority = 'low' | 'normal' | 'high' | 'critical';

export interface Message {
  id: string;
  messageType: string;
  payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
  priority: MessagePriority;
  timestamp: string;
  correlationId: string | null;
}

export interface Channel {
  name: string;
  queueSize: number;
  subscriberCount: number;
  stats: {
    published: number;
    delivered: number;
    dropped: number;
  };
}

export interface Aggregation {
  id: number;
  correlationId: string;
  aggregationKey: string;
  expectedCount: number | null;
  currentCount: number;
  status: 'pending' | 'complete' | 'timeout';
  startedAt: string;
  timeoutAt: string;
}

export interface DeadLetterMessage {
  id: number;
  originalMessageId: string;
  messagePayload: string;
  failureReason: string;
  retryCount: number;
  movedAt: string;
}
