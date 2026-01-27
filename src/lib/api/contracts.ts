// Contracts API
import { fetchApi, buildSearchParams } from './client';
import type { PaginatedResponse, ApiError } from '$lib/types/api';
import type {
  Contract,
  CreateContractRequest,
  UpdateContractRequest,
  ContractItem,
  AddContractItemRequest,
  ContractHistory,
  ContractStatus
} from '$lib/types/contract';
import type { Result } from '$lib/utils/result';

export interface ListContractsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  customerId?: number;
  status?: ContractStatus;
  contractType?: string;
  [key: string]: string | number | boolean | undefined;
}

export const contractsApi = {
  list: (
    params: ListContractsParams = {}
  ): Promise<Result<PaginatedResponse<Contract>, ApiError>> =>
    fetchApi(`api/v1/contracts${buildSearchParams(params)}`),

  get: (id: number): Promise<Result<Contract, ApiError>> =>
    fetchApi(`api/v1/contracts/${id}`),

  create: (data: CreateContractRequest): Promise<Result<Contract, ApiError>> =>
    fetchApi('api/v1/contracts', {
      method: 'POST',
      json: data
    }),

  update: (id: number, data: UpdateContractRequest): Promise<Result<Contract, ApiError>> =>
    fetchApi(`api/v1/contracts/${id}`, {
      method: 'PUT',
      json: data
    }),

  delete: (id: number): Promise<Result<void, ApiError>> =>
    fetchApi(`api/v1/contracts/${id}`, { method: 'DELETE' }),

  updateStatus: (id: number, status: ContractStatus): Promise<Result<Contract, ApiError>> =>
    fetchApi(`api/v1/contracts/${id}/status`, {
      method: 'PATCH',
      json: { status }
    }),

  sign: (id: number, signedBy: string): Promise<Result<Contract, ApiError>> =>
    fetchApi(`api/v1/contracts/${id}/sign`, {
      method: 'POST',
      json: { signed_by: signedBy }
    }),

  getHistory: (id: number): Promise<Result<ContractHistory[], ApiError>> =>
    fetchApi(`api/v1/contracts/${id}/history`),

  // Contract items
  addItem: (contractId: number, item: AddContractItemRequest): Promise<Result<ContractItem, ApiError>> =>
    fetchApi(`api/v1/contracts/${contractId}/items`, {
      method: 'POST',
      json: item
    }),

  updateItem: (
    contractId: number,
    itemId: number,
    item: Partial<AddContractItemRequest>
  ): Promise<Result<ContractItem, ApiError>> =>
    fetchApi(`api/v1/contracts/${contractId}/items/${itemId}`, {
      method: 'PUT',
      json: item
    }),

  deleteItem: (contractId: number, itemId: number): Promise<Result<void, ApiError>> =>
    fetchApi(`api/v1/contracts/${contractId}/items/${itemId}`, { method: 'DELETE' })
} as const;
