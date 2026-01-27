# gprint Frontend Development Specification

> **Contract Printing Management System**  
> Svelte 5 • Bun • TypeScript • Functional Programming

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Core Principles](#core-principles)
6. [API Integration](#api-integration)
7. [State Management](#state-management)
8. [Component Patterns](#component-patterns)
9. [Type System](#type-system)
10. [Styling](#styling)
11. [Development Setup](#development-setup)
12. [Scripts & Commands](#scripts--commands)
13. [Testing Strategy](#testing-strategy)
14. [Error Handling](#error-handling)
15. [Security Considerations](#security-considerations)

---

## Overview

Frontend application for the **gprint** contract printing management system. Consumes a Go/Oracle REST API for multi-tenant contract lifecycle management including:

- Customer management
- Service catalog
- Contract creation, signing, and generation
- Print job processing and audit logging

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Runtime** | Bun | 1.1+ | Package manager, bundler, test runner |
| **Framework** | Svelte | 5.x | Reactive UI with runes |
| **Language** | TypeScript | 5.x | Type safety, FP support |
| **Routing** | SvelteKit | 2.x | File-based routing, SSR/SPA |
| **HTTP** | ky | 1.x | Lightweight fetch wrapper |
| **Validation** | zod | 3.x | Runtime schema validation |
| **State** | Svelte Stores | - | Reactive state primitives |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **Icons** | Lucide Svelte | - | Consistent iconography |
| **Date/Time** | date-fns | 3.x | Immutable date utilities |
| **Decimal** | decimal.js-light | - | Precise currency math |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         SvelteKit App                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Routes    │  │  Layouts    │  │       Components        │  │
│  │  /customers │  │  +layout    │  │  ├── ui/ (primitives)   │  │
│  │  /services  │  │  +error     │  │  ├── domain/ (business) │  │
│  │  /contracts │  │             │  │  └── composed/          │  │
│  └──────┬──────┘  └─────────────┘  └───────────┬─────────────┘  │
│         │                                       │                │
│  ┌──────▼───────────────────────────────────────▼──────────────┐│
│  │                     State Layer (Stores)                    ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  ││
│  │  │ customer │ │ service  │ │ contract │ │ contractGen    │  ││
│  │  │  Store   │ │  Store   │ │  Store   │ │    Store       │  ││
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  ││
│  └──────────────────────────┬──────────────────────────────────┘│
│                             │                                    │
│  ┌──────────────────────────▼──────────────────────────────────┐│
│  │                    API Client Layer                         ││
│  │  ┌─────────────────────────────────────────────────────┐    ││
│  │  │  api/                                               │    ││
│  │  │  ├── client.ts      (ky instance, interceptors)     │    ││
│  │  │  ├── customers.ts   (customer endpoints)            │    ││
│  │  │  ├── services.ts    (service endpoints)             │    ││
│  │  │  ├── contracts.ts   (contract endpoints)            │    ││
│  │  │  └── generation.ts  (contract generation endpoints) │    ││
│  │  └─────────────────────────────────────────────────────┘    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │   gprint Go API     │
                   │   (REST + JWT)      │
                   └─────────────────────┘
```

---

## Project Structure

```
gprint-ui/
├── bun.lockb
├── package.json
├── svelte.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
│
├── src/
│   ├── app.html
│   ├── app.css                    # Tailwind imports
│   ├── app.d.ts                   # SvelteKit type augmentation
│   │
│   ├── lib/
│   │   ├── api/                   # API client layer
│   │   │   ├── client.ts          # ky instance + auth interceptor
│   │   │   ├── customers.ts
│   │   │   ├── services.ts
│   │   │   ├── contracts.ts
│   │   │   ├── generation.ts
│   │   │   └── print-jobs.ts
│   │   │
│   │   ├── stores/                # Svelte stores (state)
│   │   │   ├── auth.svelte.ts     # Auth state with runes
│   │   │   ├── customers.svelte.ts
│   │   │   ├── services.svelte.ts
│   │   │   ├── contracts.svelte.ts
│   │   │   └── toast.svelte.ts    # Notifications
│   │   │
│   │   ├── types/                 # TypeScript types
│   │   │   ├── api.ts             # API response shapes
│   │   │   ├── customer.ts
│   │   │   ├── service.ts
│   │   │   ├── contract.ts
│   │   │   ├── generation.ts
│   │   │   └── common.ts          # Shared types
│   │   │
│   │   ├── schemas/               # Zod validation schemas
│   │   │   ├── customer.ts
│   │   │   ├── service.ts
│   │   │   └── contract.ts
│   │   │
│   │   ├── utils/                 # Pure utility functions
│   │   │   ├── result.ts          # Result<T, E> monad
│   │   │   ├── option.ts          # Option<T> monad
│   │   │   ├── pipe.ts            # Function composition
│   │   │   ├── format.ts          # Formatters (currency, date)
│   │   │   ├── predicates.ts      # Type guards & predicates
│   │   │   └── validators.ts      # Validation helpers
│   │   │
│   │   └── components/
│   │       ├── ui/                # Primitive/headless components
│   │       │   ├── Button.svelte
│   │       │   ├── Input.svelte
│   │       │   ├── Select.svelte
│   │       │   ├── Modal.svelte
│   │       │   ├── Table.svelte
│   │       │   ├── Pagination.svelte
│   │       │   └── Toast.svelte
│   │       │
│   │       ├── domain/            # Business domain components
│   │       │   ├── CustomerCard.svelte
│   │       │   ├── CustomerForm.svelte
│   │       │   ├── ServiceRow.svelte
│   │       │   ├── ContractList.svelte
│   │       │   ├── ContractForm.svelte
│   │       │   ├── ContractItemEditor.svelte
│   │       │   └── GeneratedContractViewer.svelte
│   │       │
│   │       └── composed/          # Page-level compositions
│   │           ├── CustomerManager.svelte
│   │           ├── ContractWorkspace.svelte
│   │           └── PrintQueue.svelte
│   │
│   └── routes/
│       ├── +layout.svelte         # Root layout (nav, auth gate)
│       ├── +layout.ts             # Load auth state
│       ├── +page.svelte           # Dashboard
│       ├── +error.svelte          # Error boundary
│       │
│       ├── login/
│       │   └── +page.svelte
│       │
│       ├── customers/
│       │   ├── +page.svelte       # List
│       │   ├── +page.ts           # Load customers
│       │   ├── [id]/
│       │   │   ├── +page.svelte   # Detail/Edit
│       │   │   └── +page.ts
│       │   └── new/
│       │       └── +page.svelte   # Create
│       │
│       ├── services/
│       │   ├── +page.svelte
│       │   ├── [id]/+page.svelte
│       │   └── new/+page.svelte
│       │
│       ├── contracts/
│       │   ├── +page.svelte
│       │   ├── [id]/
│       │   │   ├── +page.svelte   # Contract detail
│       │   │   ├── +page.ts
│       │   │   ├── items/+page.svelte
│       │   │   ├── generate/+page.svelte
│       │   │   ├── generated/
│       │   │   │   ├── +page.svelte
│       │   │   │   └── [genId]/+page.svelte
│       │   │   └── print/+page.svelte
│       │   └── new/+page.svelte
│       │
│       └── print-jobs/
│           ├── +page.svelte
│           └── [id]/+page.svelte
│
├── static/
│   └── favicon.png
│
└── tests/
    ├── unit/
    │   ├── utils/
    │   └── stores/
    └── integration/
```

---

## Core Principles

### 1. Functional Programming First

```typescript
// ✅ Pure functions, immutable data
const updateCustomer = (customer: Customer, patch: Partial<Customer>): Customer =>
  ({ ...customer, ...patch });

// ✅ Function composition with pipe
const formatContractValue = pipe(
  (c: Contract) => c.totalValue,
  toDecimal,
  formatCurrency('BRL')
);

// ✅ Result monad for error handling
const parseContract = (data: unknown): Result<Contract, ValidationError> =>
  pipe(
    contractSchema.safeParse(data),
    mapResult(validated => validated.data),
    mapError(err => new ValidationError(err.issues))
  );

// ❌ Avoid: mutation, side effects in pure functions
```

### 2. Result & Option Monads

```typescript
// src/lib/utils/result.ts
export type Result<T, E> = 
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const map = <T, U, E>(fn: (t: T) => U) => 
  (result: Result<T, E>): Result<U, E> =>
    result.ok ? Ok(fn(result.value)) : result;

export const flatMap = <T, U, E>(fn: (t: T) => Result<U, E>) => 
  (result: Result<T, E>): Result<U, E> =>
    result.ok ? fn(result.value) : result;

export const unwrapOr = <T, E>(defaultValue: T) => 
  (result: Result<T, E>): T =>
    result.ok ? result.value : defaultValue;
```

```typescript
// src/lib/utils/option.ts
export type Option<T> = 
  | { readonly some: true; readonly value: T }
  | { readonly some: false };

export const Some = <T>(value: T): Option<T> => ({ some: true, value });
export const None: Option<never> = { some: false };

export const fromNullable = <T>(value: T | null | undefined): Option<T> =>
  value != null ? Some(value) : None;

export const map = <T, U>(fn: (t: T) => U) => 
  (opt: Option<T>): Option<U> =>
    opt.some ? Some(fn(opt.value)) : None;
```

### 3. Pipe Utility

```typescript
// src/lib/utils/pipe.ts
export function pipe<A>(a: A): A;
export function pipe<A, B>(a: A, ab: (a: A) => B): B;
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C;
export function pipe<A, B, C, D>(
  a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D
): D;
// ... up to ~10 overloads
export function pipe(initial: unknown, ...fns: Array<(x: unknown) => unknown>): unknown {
  return fns.reduce((acc, fn) => fn(acc), initial);
}
```

### 4. Svelte 5 Runes

```svelte
<!-- Use $state, $derived, $effect instead of stores where local -->
<script lang="ts">
  import type { Customer } from '$lib/types/customer';
  
  interface Props {
    customer: Customer;
    onSave: (c: Customer) => Promise<void>;
  }
  
  let { customer, onSave }: Props = $props();
  
  // Local reactive state
  let editing = $state(false);
  let draft = $state({ ...customer });
  
  // Derived values (computed)
  let isDirty = $derived(
    draft.name !== customer.name || 
    draft.email !== customer.email
  );
  
  // Effects for side effects
  $effect(() => {
    if (!editing) {
      draft = { ...customer };
    }
  });
  
  const handleSave = async () => {
    await onSave(draft);
    editing = false;
  };
</script>
```

---

## API Integration

### Client Configuration

```typescript
// src/lib/api/client.ts
import ky, { type KyInstance } from 'ky';
import { authStore } from '$lib/stores/auth.svelte';
import { Err, Ok, type Result } from '$lib/utils/result';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export const api: KyInstance = ky.create({
  prefixUrl: API_BASE,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = authStore.token;
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      }
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          authStore.logout();
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
    
    return Err(response.error ?? { code: 'UNKNOWN', message: 'Unknown error' });
  } catch (error) {
    if (error instanceof ky.HTTPError) {
      const body = await error.response.json().catch(() => ({}));
      return Err({
        code: body?.error?.code ?? 'HTTP_ERROR',
        message: body?.error?.message ?? error.message
      });
    }
    return Err({ code: 'NETWORK_ERROR', message: String(error) });
  }
};
```

### Domain API Modules

```typescript
// src/lib/api/customers.ts
import { fetchApi, type PaginatedResponse } from './client';
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '$lib/types/customer';
import type { Result } from '$lib/utils/result';
import type { ApiError } from './client';

export interface ListCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  active?: boolean;
}

export const customersApi = {
  list: (params: ListCustomersParams = {}): Promise<Result<PaginatedResponse<Customer>, ApiError>> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.pageSize) searchParams.set('page_size', String(params.pageSize));
    if (params.search) searchParams.set('search', params.search);
    if (params.active !== undefined) searchParams.set('active', String(params.active));
    
    return fetchApi(`api/v1/customers?${searchParams}`);
  },
  
  get: (id: number): Promise<Result<Customer, ApiError>> =>
    fetchApi(`api/v1/customers/${id}`),
  
  create: (data: CreateCustomerRequest): Promise<Result<Customer, ApiError>> =>
    fetchApi('api/v1/customers', {
      method: 'POST',
      json: data
    }),
  
  update: (id: number, data: UpdateCustomerRequest): Promise<Result<Customer, ApiError>> =>
    fetchApi(`api/v1/customers/${id}`, {
      method: 'PUT',
      json: data
    }),
  
  delete: (id: number): Promise<Result<void, ApiError>> =>
    fetchApi(`api/v1/customers/${id}`, { method: 'DELETE' })
} as const;
```

```typescript
// src/lib/api/contracts.ts
import { fetchApi, type PaginatedResponse } from './client';
import type { 
  Contract, 
  CreateContractRequest, 
  UpdateContractRequest,
  ContractItem,
  AddContractItemRequest,
  ContractHistory
} from '$lib/types/contract';

export const contractsApi = {
  list: (params = {}) => fetchApi<PaginatedResponse<Contract>>(`api/v1/contracts?${new URLSearchParams(params)}`),
  get: (id: number) => fetchApi<Contract>(`api/v1/contracts/${id}`),
  create: (data: CreateContractRequest) => fetchApi<Contract>('api/v1/contracts', { method: 'POST', json: data }),
  update: (id: number, data: UpdateContractRequest) => fetchApi<Contract>(`api/v1/contracts/${id}`, { method: 'PUT', json: data }),
  updateStatus: (id: number, status: string) => fetchApi<Contract>(`api/v1/contracts/${id}/status`, { method: 'PATCH', json: { status } }),
  sign: (id: number, signedBy: string) => fetchApi<Contract>(`api/v1/contracts/${id}/sign`, { method: 'POST', json: { signed_by: signedBy } }),
  getHistory: (id: number) => fetchApi<ContractHistory[]>(`api/v1/contracts/${id}/history`),
  addItem: (id: number, item: AddContractItemRequest) => fetchApi<ContractItem>(`api/v1/contracts/${id}/items`, { method: 'POST', json: item }),
  deleteItem: (contractId: number, itemId: number) => fetchApi<void>(`api/v1/contracts/${contractId}/items/${itemId}`, { method: 'DELETE' })
} as const;
```

```typescript
// src/lib/api/generation.ts
import { fetchApi, api } from './client';
import type { 
  GeneratedContract, 
  GenerateRequest, 
  GenerationStats,
  Template 
} from '$lib/types/generation';

export const generationApi = {
  generate: (contractId: number, req?: GenerateRequest) => 
    fetchApi<GeneratedContract>(`api/v1/contracts/${contractId}/generate`, { 
      method: 'POST', 
      json: req ?? {} 
    }),
  
  listGenerated: (contractId: number) => 
    fetchApi<GeneratedContract[]>(`api/v1/contracts/${contractId}/generated`),
  
  getLatest: (contractId: number) => 
    fetchApi<GeneratedContract>(`api/v1/contracts/${contractId}/generated/latest`),
  
  getContent: (contractId: number, genId: number) => 
    fetchApi<GeneratedContract>(`api/v1/contracts/${contractId}/generated/${genId}`),
  
  logDownload: (contractId: number, genId: number) => 
    fetchApi<void>(`api/v1/contracts/${contractId}/generated/${genId}/log/download`, { method: 'POST' }),
  
  logPrint: (contractId: number, genId: number) => 
    fetchApi<void>(`api/v1/contracts/${contractId}/generated/${genId}/log/print`, { method: 'POST' }),
  
  verify: (contractId: number, genId: number) => 
    fetchApi<{ valid: boolean; message: string }>(`api/v1/contracts/${contractId}/generated/${genId}/verify`),
  
  getStats: () => fetchApi<GenerationStats>('api/v1/contracts/generation/stats'),
  
  listTemplates: () => fetchApi<Template[]>('api/v1/contracts/templates'),
  
  // Binary download (returns blob)
  downloadPdf: async (contractId: number, genId: number): Promise<Blob> => {
    await generationApi.logDownload(contractId, genId);
    return api(`api/v1/contracts/${contractId}/generated/${genId}`, {
      headers: { Accept: 'application/pdf' }
    }).blob();
  }
} as const;
```

---

## State Management

### Store Pattern with Svelte 5 Runes

```typescript
// src/lib/stores/customers.svelte.ts
import { customersApi, type ListCustomersParams } from '$lib/api/customers';
import type { Customer } from '$lib/types/customer';
import type { PaginatedResponse } from '$lib/api/client';

interface CustomerState {
  items: Customer[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

const createCustomerStore = () => {
  let state = $state<CustomerState>({
    items: [],
    loading: false,
    error: null,
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  });
  
  const load = async (params: ListCustomersParams = {}) => {
    state.loading = true;
    state.error = null;
    
    const result = await customersApi.list({
      page: params.page ?? state.page,
      pageSize: params.pageSize ?? state.pageSize,
      ...params
    });
    
    if (result.ok) {
      const data = result.value;
      state.items = data.data;
      state.page = data.page;
      state.pageSize = data.page_size;
      state.totalCount = data.total_count;
      state.totalPages = data.total_pages;
    } else {
      state.error = result.error.message;
    }
    
    state.loading = false;
  const create = async (data: Parameters<typeof customersApi.create>[0]) => {
    const result = await customersApi.create(data);
    if (result.ok) {
      state.items = [result.value, ...state.items];
      state.totalCount += 1;
      state.totalPages = Math.ceil(state.totalCount / state.pageSize);
    }
    return result;
  };
    return result;
  };
  
  const update = async (id: number, data: Parameters<typeof customersApi.update>[1]) => {
    const result = await customersApi.update(id, data);
    if (result.ok) {
      state.items = state.items.map(c => c.id === id ? result.value : c);
    }
    return result;
  const remove = async (id: number) => {
    const result = await customersApi.delete(id);
    if (result.ok) {
      state.items = state.items.filter(c => c.id !== id);
      state.totalCount -= 1;
      state.totalPages = Math.ceil(state.totalCount / state.pageSize);
    }
    return result;
  };
    return result;
  };
  
  return {
    get items() { return state.items; },
    get loading() { return state.loading; },
    get error() { return state.error; },
    get page() { return state.page; },
    get pageSize() { return state.pageSize; },
    get totalCount() { return state.totalCount; },
    get totalPages() { return state.totalPages; },
    load,
    create,
    update,
    remove
  };
};

export const customerStore = createCustomerStore();
```

### Auth Store

```typescript
// src/lib/stores/auth.svelte.ts
interface AuthState {
  token: string | null;
  user: { id: string; tenantId: string } | null;
}

const TOKEN_KEY = 'gprint_token';

const createAuthStore = () => {
  let state = $state<AuthState>({
    token: typeof window !== 'undefined' && typeof localStorage !== 'undefined'
      ? localStorage.getItem(TOKEN_KEY) 
      : null,
    user: null
  });
  
  // Parse JWT payload (without verification - server validates)
  const parseToken = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.user, tenantId: payload.tenant_id };
    } catch {
      return null;
    }
  };
  
  $effect(() => {
    if (state.token) {
      localStorage.setItem(TOKEN_KEY, state.token);
      state.user = parseToken(state.token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      state.user = null;
    }
  });
  
  return {
    get token() { return state.token; },
    get user() { return state.user; },
    get isAuthenticated() { return state.token !== null; },
    
    login: (token: string) => {
      state.token = token;
    },
    
    logout: () => {
      state.token = null;
    }
  };
};

export const authStore = createAuthStore();
```

---

## Component Patterns

### UI Primitives (Headless)

```svelte
<!-- src/lib/components/ui/Button.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  
  type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
  type Size = 'sm' | 'md' | 'lg';
  
  interface Props extends HTMLButtonAttributes {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    children: Snippet;
  }
  
  let { 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    disabled = false,
    children,
    ...rest 
  }: Props = $props();
  
  const variants: Record<Variant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent hover:bg-gray-100'
  };
  
  const sizes: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
</script>

<button
  class="inline-flex items-center justify-center rounded-md font-medium 
         transition-colors disabled:opacity-50 disabled:pointer-events-none
         {variants[variant]} {sizes[size]}"
  disabled={disabled || loading}
  {...rest}
>
  {#if loading}
    <svg class="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  {/if}
  {@render children()}
</button>
```

### Domain Components

```svelte
<!-- src/lib/components/domain/ContractCard.svelte -->
<script lang="ts">
  import type { Contract } from '$lib/types/contract';
  import { formatCurrency, formatDate } from '$lib/utils/format';
  import { pipe } from '$lib/utils/pipe';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  
  interface Props {
    contract: Contract;
    onView: (id: number) => void;
    onGenerate: (id: number) => void;
  }
  
  let { contract, onView, onGenerate }: Props = $props();
  
  const statusColors: Record<string, string> = {
    DRAFT: 'gray',
    PENDING: 'yellow',
    ACTIVE: 'green',
    SUSPENDED: 'orange',
    CANCELLED: 'red',
    COMPLETED: 'blue'
  };
  
  const formattedValue = $derived(
    pipe(contract.totalValue, formatCurrency('BRL'))
  );
</script>

<article class="border rounded-lg p-4 hover:shadow-md transition-shadow">
  <header class="flex justify-between items-start mb-3">
    <div>
      <h3 class="font-semibold text-lg">{contract.contractNumber}</h3>
      <p class="text-gray-600 text-sm">{contract.customer?.name}</p>
    </div>
    <Badge color={statusColors[contract.status]}>{contract.status}</Badge>
  </header>
  
  <dl class="grid grid-cols-2 gap-2 text-sm mb-4">
    <div>
      <dt class="text-gray-500">Value</dt>
      <dd class="font-medium">{formattedValue}</dd>
    </div>
    <div>
      <dt class="text-gray-500">Start Date</dt>
      <dd>{formatDate(contract.startDate)}</dd>
    </div>
    <div>
      <dt class="text-gray-500">Type</dt>
      <dd>{contract.contractType}</dd>
    </div>
    <div>
      <dt class="text-gray-500">Billing</dt>
      <dd>{contract.billingCycle}</dd>
    </div>
  </dl>
  
  <footer class="flex gap-2">
    <Button variant="secondary" size="sm" onclick={() => onView(contract.id)}>
      View
    </Button>
    {#if contract.status === 'ACTIVE'}
      <Button variant="primary" size="sm" onclick={() => onGenerate(contract.id)}>
        Generate PDF
      </Button>
    {/if}
  </footer>
</article>
```

---

## Type System

### Domain Types

```typescript
// src/lib/types/customer.ts
export type CustomerType = 'INDIVIDUAL' | 'COMPANY';

export interface Address {
  readonly street?: string;
  readonly number?: string;
  readonly comp?: string;
  readonly district?: string;
  readonly city?: string;
  readonly state?: string;
  readonly zip?: string;
  readonly country?: string;
}

export interface Customer {
  readonly id: number;
  readonly customerCode: string;
  readonly customerType: CustomerType;
  readonly name: string;
  readonly tradeName?: string;
  readonly taxId?: string;
  readonly stateReg?: string;
  readonly municipalReg?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly mobile?: string;
  readonly address?: Address;
  readonly active: boolean;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateCustomerRequest {
  readonly customerCode: string;
  readonly customerType: CustomerType;
  readonly name: string;
  readonly tradeName?: string;
  readonly taxId?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly address?: Address;
}

export interface UpdateCustomerRequest extends Partial<Omit<CreateCustomerRequest, 'customerCode'>> {
  readonly active?: boolean;
}
```

```typescript
// src/lib/types/contract.ts
export type ContractType = 'SERVICE' | 'RECURRING' | 'PROJECT';
export type ContractStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'COMPLETED';
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONCE';
export type ContractItemStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ContractItem {
  readonly id: number;
  readonly contractId: number;
  readonly serviceId: number;
  readonly service?: Service;
  readonly quantity: string; // decimal as string
  readonly unitPrice: string;
  readonly discountPct: string;
  readonly lineTotal: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly description?: string;
  readonly status: ContractItemStatus;
}

export interface Contract {
  readonly id: number;
  readonly contractNumber: string;
  readonly contractType: ContractType;
  readonly customerId: number;
  readonly customer?: Customer;
  readonly startDate: string;
  readonly endDate?: string;
  readonly durationMonths?: number;
  readonly autoRenew: boolean;
  readonly totalValue: string;
  readonly paymentTerms?: string;
  readonly billingCycle: BillingCycle;
  readonly status: ContractStatus;
  readonly signedAt?: string;
  readonly signedBy?: string;
  readonly items?: ContractItem[];
  readonly createdAt: string;
  readonly updatedAt: string;
}
```

---

## Styling

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1'
        }
      }
    }
  },
  plugins: []
} satisfies Config;
```

---

## Development Setup

### Prerequisites

- **Bun** ≥ 1.1
- **Node.js** ≥ 20 (for some tooling compatibility)

### Installation

```bash
# Create project
bunx sv create gprint-ui
# Select: SvelteKit minimal, TypeScript, Tailwind, ESLint, Prettier

cd gprint-ui

# Install dependencies
bun add ky zod decimal.js-light date-fns lucide-svelte
bun add -D @types/bun

# Environment setup
cp .env.example .env.local
```

### Environment Variables

```bash
# .env.local
VITE_API_URL=http://localhost:8080
```

---

## Scripts & Commands

```json
{
  "scripts": {
    "dev": "bun --bun vite dev",
    "build": "bun --bun vite build",
    "preview": "bun --bun vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "eslint . && prettier --check .",
    "format": "prettier --write .",
    "test": "bun test",
    "test:unit": "bun test tests/unit",
    "test:watch": "bun test --watch"
  }
}
```

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server with HMR |
| `bun build` | Production build |
| `bun preview` | Preview production build |
| `bun check` | Type-check with svelte-check |
| `bun lint` | Run ESLint + Prettier check |
| `bun test` | Run all tests with Bun test runner |

---

## Testing Strategy

### Unit Tests (Pure Functions)

```typescript
// tests/unit/utils/result.test.ts
import { describe, expect, test } from 'bun:test';
import { Ok, Err, map, flatMap, unwrapOr } from '$lib/utils/result';

describe('Result', () => {
  test('map transforms Ok value', () => {
    const result = Ok(5);
    const mapped = map((x: number) => x * 2)(result);
    
    expect(mapped).toEqual({ ok: true, value: 10 });
  });
  
  test('map passes through Err', () => {
    const result = Err('failed');
    const mapped = map((x: number) => x * 2)(result);
    
    expect(mapped).toEqual({ ok: false, error: 'failed' });
  });
  
  test('unwrapOr returns default on Err', () => {
    const result = Err('failed');
    const value = unwrapOr(42)(result);
    
    expect(value).toBe(42);
  });
});
```

### Component Tests

```typescript
// tests/unit/components/Button.test.ts
import { describe, expect, test } from 'bun:test';
import { render } from '@testing-library/svelte';
import Button from '$lib/components/ui/Button.svelte';

describe('Button', () => {
  test('renders with children', () => {
    const { getByRole } = render(Button, {
      props: { children: () => 'Click me' }
    });
    
    expect(getByRole('button')).toHaveTextContent('Click me');
  });
  
  test('disables when loading', () => {
    const { getByRole } = render(Button, {
      props: { loading: true, children: () => 'Submit' }
    });
    
    expect(getByRole('button')).toBeDisabled();
  });
});
```

---

## Error Handling

### Centralized Error Boundary

```svelte
<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import Button from '$lib/components/ui/Button.svelte';
</script>

<div class="min-h-screen flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-6xl font-bold text-gray-300 mb-4">
      {$page.status}
    </h1>
    <p class="text-xl text-gray-600 mb-8">
      {$page.error?.message ?? 'Something went wrong'}
    </p>
    <Button onclick={() => window.location.href = '/'}>
      Return Home
    </Button>
  </div>
</div>
```

### Toast Notifications

```typescript
// src/lib/stores/toast.svelte.ts
export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

const createToastStore = () => {
  let toasts = $state<Toast[]>([]);
  
  const add = (type: ToastType, message: string, duration = 5000) => {
    const id = crypto.randomUUID();
    toasts = [...toasts, { id, type, message, duration }];
    
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, duration);
  };
  
  return {
    get toasts() { return toasts; },
    success: (msg: string) => add('success', msg),
    error: (msg: string) => add('error', msg),
    warning: (msg: string) => add('warning', msg),
    info: (msg: string) => add('info', msg),
    dismiss: (id: string) => { toasts = toasts.filter(t => t.id !== id); }
  };
};

export const toastStore = createToastStore();
```

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| **XSS** | Svelte auto-escapes by default; use `{@html}` sparingly |
| **CSRF** | JWT in `Authorization` header (not cookies) |
| **Token Storage** | LocalStorage for simplicity; consider `httpOnly` cookies for production |
| **Input Validation** | Zod schemas validate all user input before API calls |
| **Sensitive Data** | Never log tokens; mask sensitive fields in dev tools |

---

## Next Steps

1. [ ] Initialize SvelteKit project with Bun
2. [ ] Configure Tailwind CSS 4
3. [ ] Implement `Result`/`Option` utilities
4. [ ] Create API client with auth interceptor
5. [ ] Build UI primitives (Button, Input, Modal, Table)
6. [ ] Implement auth flow (login page, store, guards)
7. [ ] Build customer management feature
8. [ ] Build service catalog feature
9. [ ] Build contract management with generation
10. [ ] Add print job queue UI

---

*Generated for gprint backend v1.0*
