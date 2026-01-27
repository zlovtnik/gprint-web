// Print jobs API
import { fetchApi, buildSearchParams } from './client';
import type { PaginatedResponse, ApiError } from '$lib/types/api';
import type { PrintJob, CreatePrintJobRequest, PrinterInfo, PrintJobStatus } from '$lib/types/print-job';
import type { Result } from '$lib/utils/result';

export interface ListPrintJobsParams {
  page?: number;
  pageSize?: number;
  status?: PrintJobStatus;
  contractId?: number;
  [key: string]: string | number | boolean | undefined;
}

export const printJobsApi = {
  list: (params: ListPrintJobsParams = {}): Promise<Result<PaginatedResponse<PrintJob>, ApiError>> =>
    fetchApi(`api/v1/print-jobs${buildSearchParams(params)}`),

  get: (id: number): Promise<Result<PrintJob, ApiError>> =>
    fetchApi(`api/v1/print-jobs/${id}`),

  create: (data: CreatePrintJobRequest): Promise<Result<PrintJob, ApiError>> =>
    fetchApi('api/v1/print-jobs', {
      method: 'POST',
      json: data
    }),

  cancel: (id: number): Promise<Result<PrintJob, ApiError>> =>
    fetchApi(`api/v1/print-jobs/${id}/cancel`, { method: 'POST' }),

  retry: (id: number): Promise<Result<PrintJob, ApiError>> =>
    fetchApi(`api/v1/print-jobs/${id}/retry`, { method: 'POST' }),

  // Printer info
  listPrinters: (): Promise<Result<PrinterInfo[], ApiError>> =>
    fetchApi('api/v1/printers'),

  getPrinter: (id: string): Promise<Result<PrinterInfo, ApiError>> =>
    fetchApi(`api/v1/printers/${id}`)
} as const;
