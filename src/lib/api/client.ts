// API client with ky
import ky, { type KyInstance, HTTPError } from 'ky';
import { Ok, Err, type Result } from '$lib/utils/result';
import type { ApiError, ApiResponse, PaginatedResponse } from '$lib/types/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';
const INTEGRATION_API_BASE = import.meta.env.VITE_INTEGRATION_API_URL || 'http://localhost:4000/api';

// Validate URLs have proper protocol
if (typeof window !== 'undefined') {
  if (INTEGRATION_API_BASE && !INTEGRATION_API_BASE.startsWith('http://') && !INTEGRATION_API_BASE.startsWith('https://')) {
    console.error(`[API Client] Invalid VITE_INTEGRATION_API_URL: "${INTEGRATION_API_BASE}" - must start with http:// or https://`);
  }
}

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

// Integration API ky instance (separate backend)
export const integrationApi: KyInstance = ky.create({
  prefixUrl: INTEGRATION_API_BASE,
  timeout: 30000,
  hooks: {
    beforeRequest: [
      (request) => {
        if (authToken) {
          request.headers.set('Authorization', `Bearer ${authToken}`);
        }
        // Don't set Content-Type for FormData - let browser handle it
        if (!(request.body instanceof FormData)) {
          request.headers.set('Content-Type', 'application/json');
        }
      }
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401 && onUnauthorized && !isLoggingOut) {
          isLoggingOut = true;
          onUnauthorized();
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
    const rawResponse = await api(endpoint, options).json<ApiResponse<unknown>>();
    // Convert snake_case keys to camelCase for frontend consumption
    const response = toCamelCaseKeys(rawResponse) as ApiResponse<T>;

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

// Convert camelCase to snake_case
const toSnakeCase = (str: string): string =>
  str.replaceAll(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

// Convert snake_case to camelCase
const toCamelCase = (str: string): string =>
  str.replaceAll(/_([a-z])/g, (_, letter) => letter.toUpperCase());

// Deep convert object keys from camelCase to snake_case
const toSnakeCaseKeys = <T>(obj: T): T => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCaseKeys) as T;
  }
  
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const snakeKey = toSnakeCase(key);
      result[snakeKey] = toSnakeCaseKeys(value);
    }
    return result as T;
  }
  
  return obj;
};

// Deep convert object keys from snake_case to camelCase
const toCamelCaseKeys = <T>(obj: T): T => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(toCamelCaseKeys) as T;
  }
  
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const camelKey = toCamelCase(key);
      result[camelKey] = toCamelCaseKeys(value);
    }
    return result as T;
  }
  
  return obj;
};

// Wrap fetchApi to auto-convert request body keys to snake_case
export const fetchApiSnake = async <T>(
  endpoint: string,
  options?: Parameters<typeof api>[1] & { json?: unknown }
): Promise<Result<T, ApiError>> => {
  const transformedOptions = options ? { ...options } : undefined;
  
  if (transformedOptions?.json) {
    transformedOptions.json = toSnakeCaseKeys(transformedOptions.json);
  }
  
  return fetchApi<T>(endpoint, transformedOptions);
};

// Build URL search params
export const buildSearchParams = <T extends Record<string, string | number | boolean | undefined>>(
  params: T
): string => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      // Convert camelCase to snake_case for API compatibility
      const snakeKey = toSnakeCase(key);
      searchParams.set(snakeKey, String(value));
    }
  }

  const str = searchParams.toString();
  return str ? `?${str}` : '';
};

// ============================================
// Integration API fetch functions
// ============================================

// Type-safe Integration API wrapper returning Result
export const fetchIntegrationApi = async <T>(
  endpoint: string,
  options?: Parameters<typeof integrationApi>[1]
): Promise<Result<T, ApiError>> => {
  try {
    const rawResponse = await integrationApi(endpoint, options).json<ApiResponse<unknown>>();
    const response = toCamelCaseKeys(rawResponse) as ApiResponse<T>;

    if (response.success && response.data !== undefined) {
      return Ok(response.data);
    }

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

// Wrap fetchIntegrationApi to auto-convert request body keys to snake_case
export const fetchIntegrationApiSnake = async <T>(
  endpoint: string,
  options?: Parameters<typeof integrationApi>[1] & { json?: unknown }
): Promise<Result<T, ApiError>> => {
  const transformedOptions = options ? { ...options } : undefined;
  
  if (transformedOptions?.json) {
    transformedOptions.json = toSnakeCaseKeys(transformedOptions.json);
  }
  
  return fetchIntegrationApi<T>(endpoint, transformedOptions);
};
