// Print job domain types

import type { GeneratedContract } from './generation';
import type { Contract } from './contract';

export type PrintJobStatus = 'QUEUED' | 'PRINTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface PrinterInfo {
  readonly id: string;
  readonly name: string;
  readonly location?: string;
  readonly model?: string;
  readonly status: 'online' | 'offline' | 'busy';
  readonly paperSize?: string;
}

export interface GeneratedContractWithContract extends GeneratedContract {
  readonly contract?: Contract;
}

export interface PrintJob {
  readonly id: number;
  readonly generatedContractId: number;
  readonly generatedContract?: GeneratedContractWithContract;
  readonly copies: number;
  readonly status: PrintJobStatus;
  readonly printerId?: string;
  readonly printer?: PrinterInfo;
  readonly createdAt: string;
  readonly startedAt?: string;
  readonly printedAt?: string;
  readonly errorMessage?: string;
  readonly createdBy?: string;
}

export interface CreatePrintJobRequest {
  readonly generatedContractId: number;
  readonly copies?: number;
  readonly printerId?: string;
}
