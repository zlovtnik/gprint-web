// Common shared types

export interface Pagination {
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
}

export interface TimestampFields {
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SoftDeleteFields extends TimestampFields {
  readonly deletedAt?: string;
}

// Status types used across domains
export type ActiveStatus = 'active' | 'inactive';

// Audit trail
export interface AuditInfo extends TimestampFields {
  readonly createdBy?: string;
  readonly updatedBy?: string;
}
