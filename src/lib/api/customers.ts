// Customers API
import { fetchApi, fetchApiSnake, buildSearchParams } from './client';
import type { PaginatedResponse, ApiError } from '$lib/types/api';
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '$lib/types/customer';
import type { Result } from '$lib/utils/result';

export interface ListCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  active?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export const customersApi = {
  list: (params: ListCustomersParams = {}): Promise<Result<PaginatedResponse<Customer>, ApiError>> =>
    fetchApi(`api/v1/customers${buildSearchParams(params)}`),

  get: (id: number): Promise<Result<Customer, ApiError>> =>
    fetchApi(`api/v1/customers/${id}`),

  create: (data: CreateCustomerRequest): Promise<Result<Customer, ApiError>> =>
    fetchApiSnake('api/v1/customers', {
      method: 'POST',
      json: data
    }),

  update: (id: number, data: UpdateCustomerRequest): Promise<Result<Customer, ApiError>> =>
    fetchApiSnake(`api/v1/customers/${id}`, {
      method: 'PUT',
      json: data
    }),

  delete: (id: number): Promise<Result<void, ApiError>> =>
    fetchApi(`api/v1/customers/${id}`, { method: 'DELETE' }),

  activate: (id: number): Promise<Result<Customer, ApiError>> =>
    fetchApiSnake(`api/v1/customers/${id}`, {
      method: 'PUT',
      json: { active: true }
    }),

  deactivate: (id: number): Promise<Result<Customer, ApiError>> =>
    fetchApiSnake(`api/v1/customers/${id}`, {
      method: 'PUT',
      json: { active: false }
    })
} as const;
