// Contract generation API
import { fetchApi, api } from './client';
import type { ApiError } from '$lib/types/api';
import type {
  GeneratedContract,
  GenerateRequest,
  GenerationStats,
  Template
} from '$lib/types/generation';
import type { Result } from '$lib/utils/result';

export const generationApi = {
  generate: (
    contractId: number,
    req?: GenerateRequest
  ): Promise<Result<GeneratedContract, ApiError>> =>
    fetchApi(`api/v1/contracts/${contractId}/generate`, {
      method: 'POST',
      json: req ?? {}
    }),

  listGenerated: (contractId: number): Promise<Result<GeneratedContract[], ApiError>> =>
    fetchApi(`api/v1/contracts/${contractId}/generated`),

  getLatest: (contractId: number): Promise<Result<GeneratedContract, ApiError>> =>
    fetchApi(`api/v1/contracts/${contractId}/generated/latest`),

  getContent: (contractId: number, genId: number): Promise<Result<GeneratedContract, ApiError>> =>
    fetchApi(`api/v1/contracts/${contractId}/generated/${genId}`),

  logDownload: (contractId: number, genId: number): Promise<Result<void, ApiError>> =>
    fetchApi(`api/v1/contracts/${contractId}/generated/${genId}/log/download`, {
      method: 'POST'
    }),

  logPrint: (contractId: number, genId: number): Promise<Result<void, ApiError>> =>
    fetchApi(`api/v1/contracts/${contractId}/generated/${genId}/log/print`, {
      method: 'POST'
    }),

  verify: (
    contractId: number,
    genId: number
  ): Promise<Result<{ valid: boolean; message: string }, ApiError>> =>
    fetchApi(`api/v1/contracts/${contractId}/generated/${genId}/verify`),

  getStats: (): Promise<Result<GenerationStats, ApiError>> =>
    fetchApi('api/v1/contracts/generation/stats'),

  listTemplates: (): Promise<Result<Template[], ApiError>> =>
    fetchApi('api/v1/contracts/templates'),

  // Binary download (returns blob)
  downloadPdf: async (contractId: number, genId: number): Promise<Result<Blob, ApiError>> => {
    // Log download is best-effort; fire-and-forget with error swallowing
    generationApi.logDownload(contractId, genId).catch((err) => {
      console.warn('Failed to log download:', err);
    });
    try {
      const blob = await api(`api/v1/contracts/${contractId}/generated/${genId}`, {
        headers: { Accept: 'application/pdf' }
      }).blob();
      return { ok: true, value: blob };
    } catch (error) {
      // Normalize caught error to ApiError
      const normalizedError: ApiError = 
        error && typeof error === 'object' && 'code' in error && 'message' in error
          ? (error as ApiError)
          : {
              code: 'DOWNLOAD_ERROR',
              message: error instanceof Error ? error.message : String(error)
            };
      return { ok: false, error: normalizedError };
    }
  }
} as const;
