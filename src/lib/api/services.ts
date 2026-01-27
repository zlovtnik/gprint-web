// Services API
import { fetchApi, fetchApiSnake, buildSearchParams } from './client';
import type { PaginatedResponse, ApiError } from '$lib/types/api';
import type { Service, CreateServiceRequest, UpdateServiceRequest } from '$lib/types/service';
import type { Result } from '$lib/utils/result';

export interface ListServicesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  active?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export const servicesApi = {
  list: (params: ListServicesParams = {}): Promise<Result<PaginatedResponse<Service>, ApiError>> =>
    fetchApi(`api/v1/services${buildSearchParams(params)}`),

  get: (id: number): Promise<Result<Service, ApiError>> =>
    fetchApi(`api/v1/services/${id}`),

  create: (data: CreateServiceRequest): Promise<Result<Service, ApiError>> =>
    fetchApiSnake('api/v1/services', {
      method: 'POST',
      json: data
    }),

  update: (id: number, data: UpdateServiceRequest): Promise<Result<Service, ApiError>> =>
    fetchApiSnake(`api/v1/services/${id}`, {
      method: 'PUT',
      json: data
    }),

  delete: (id: number): Promise<Result<void, ApiError>> =>
    fetchApi(`api/v1/services/${id}`, { method: 'DELETE' })
} as const;
