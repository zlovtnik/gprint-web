// API client with ky
import ky, { type KyInstance, HTTPError } from 'ky';
import { Ok, Err, type Result } from '$lib/utils/result';
import type { ApiError, ApiResponse, PaginatedResponse } from '$lib/types/api';

const API_BASE ='http://localhost:8081';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

// Global logout callback - will be set by auth store
let onUnauthorized: (() => void) | null = null;
let isLoggingOut = false;

export const setOnUnauthorized = (callback: () => void) => {
  onUnauthorized = callback;
};

export const resetLogoutGuard = () => {
  isLoggingOut = false;
};

export const api: KyInstance = ky.create({
  prefixUrl: API_BASE,
  timeout: 30000,
  hooks: {
    beforeRequest: [
      (request) => {
        if (authToken) {
          request.headers.set('Authorization', `Bearer ${authToken}`);
        }
        request.headers.set('Content-Type', 'application/json');
      }
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401 && onUnauthorized && !isLoggingOut) {
          isLoggingOut = true;
          onUnauthorized();
          // NOTE: resetLogoutGuard() must be called by the login flow after successful re-authentication
          // to clear isLoggingOut and allow future 401 handling
        }
      }
    ]
  }
});

// Type-safe API wrapper returning Result
export const fetchApi = async <T>(
  endpoint: string,
  options?: Parameters<typeof api>[1]
): Promise<Result<T, ApiError>> => {
  try {
    const response = await api(endpoint, options).json<ApiResponse<T>>();

    if (response.success && response.data !== undefined) {
      return Ok(response.data);
    }

    // At this point, response must be the error case
    return Err((response as { success: false; error: ApiError }).error ?? { code: 'UNKNOWN', message: 'Unknown error occurred' });
  } catch (error) {
    if (error instanceof HTTPError) {
      try {
        const body = (await error.response.clone().json()) as ApiResponse<never>;
        return Err({
          code: (body as { success: false; error: ApiError }).error?.code ?? 'HTTP_ERROR',
          message: (body as { success: false; error: ApiError }).error?.message ?? error.message,
          details: (body as { success: false; error: ApiError }).error?.details
        });
      } catch {
        // JSON parsing failed, try to get raw text
        try {
          const rawBody = await error.response.text();
          return Err({
            code: 'HTTP_ERROR',
            message: rawBody || `HTTP ${error.response.status}: ${error.message}`,
            details: { rawBody }
          });
        } catch {
          return Err({
            code: 'HTTP_ERROR',
            message: `HTTP ${error.response.status}: ${error.message}`
          });
        }
      }
    }

    if (error instanceof Error) {
      return Err({ code: 'NETWORK_ERROR', message: error.message });
    }

    return Err({ code: 'UNKNOWN_ERROR', message: String(error) });
  }
};

// Fetch paginated data
export const fetchPaginated = async <T>(
  endpoint: string,
  options?: Parameters<typeof api>[1]
): Promise<Result<PaginatedResponse<T>, ApiError>> => {
  return fetchApi<PaginatedResponse<T>>(endpoint, options);
};

// Build URL search params
export const buildSearchParams = <T extends Record<string, string | number | boolean | undefined>>(
  params: T
): string => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      // Convert camelCase to snake_case for API compatibility
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      searchParams.set(snakeKey, String(value));
    }
  }

  const str = searchParams.toString();
  return str ? `?${str}` : '';
};
