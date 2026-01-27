// Auth API
import { fetchApi } from './client';
import type { ApiError } from '$lib/types/api';
import type { Result } from '$lib/utils/result';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  tenant_id: string;
  user: string;
}

export interface UserInfo {
  id: string;
  username: string;
  tenantId: string;
  role: string;
}

export const authApi = {
  login: (data: LoginRequest): Promise<Result<LoginResponse, ApiError>> =>
    fetchApi('api/v1/auth/login', {
      method: 'POST',
      json: data
    }),

  logout: (): Promise<Result<void, ApiError>> =>
    fetchApi('api/v1/auth/logout', { method: 'POST' }),

  me: (): Promise<Result<UserInfo, ApiError>> =>
    fetchApi('api/v1/auth/me'),

  refresh: (): Promise<Result<LoginResponse, ApiError>> =>
    fetchApi('api/v1/auth/refresh', { method: 'POST' })
} as const;
