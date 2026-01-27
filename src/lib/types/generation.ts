// Contract generation domain types

export type GenerationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface GeneratedContract {
  readonly id: number;
  readonly contractId: number;
  readonly version: number;
  readonly templateId?: number;
  readonly status: GenerationStatus;
  readonly content?: string;
  readonly contentHash?: string;
  readonly generatedAt: string;
  readonly generatedBy?: string;
  readonly fileSize?: number;
  readonly downloadCount: number;
  readonly printCount: number;
  readonly createdAt: string;
}

export interface GenerateRequest {
  readonly templateId?: number;
  readonly regenerate?: boolean;
}

export interface GenerationStats {
  readonly totalGenerated: number;
  readonly pendingCount: number;
  readonly completedCount: number;
  readonly failedCount: number;
  readonly averageGenerationTime: number;
}

export interface Template {
  readonly id: number;
  readonly name: string;
  readonly description?: string;
  readonly content: string;
  readonly isDefault: boolean;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}
