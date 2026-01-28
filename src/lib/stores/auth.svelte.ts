// Auth store with JWT management
import { setAuthToken, setOnUnauthorized, resetLogoutGuard } from '$lib/api/client';
import { authApi } from '$lib/api/auth';
import { goto } from '$app/navigation';

const TOKEN_KEY = 'pressly_token';

interface User {
  id: string;
  username?: string;
  tenantId: string;
  role?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
}

// Parse JWT payload (without verification - server validates)
const parseToken = (token: string): User | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replaceAll('-', '+').replaceAll('_', '/');
    const payload = JSON.parse(atob(base64));
    console.log('JWT payload:', payload); // Debug: see what the token contains
    return {
      id: payload.user ?? payload.user_id ?? payload.userId ?? payload.sub ?? '',
      username: payload.username ?? payload.name ?? '',
      tenantId: payload.tenant_id ?? payload.tenantId ?? '',
      role: payload.role ?? ''
    };
  } catch (e) {
    console.error('JWT parse error:', e);
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return true;
    const base64 = parts[1].replaceAll('-', '+').replaceAll('_', '/');
    const payload = JSON.parse(atob(base64));
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

// Safe localStorage access for SSR compatibility
const safeLocalStorage = {
  getItem: (key: string) => {
    if (globalThis.window === undefined || typeof localStorage === 'undefined') {
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (globalThis.window === undefined || typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore errors (e.g., private browsing mode)
    }
  },
  removeItem: (key: string) => {
    if (globalThis.window === undefined || typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  }
};

const createAuthStore = () => {
  // Initialize from localStorage if available
  const storedToken = safeLocalStorage.getItem(TOKEN_KEY);
  const validToken = storedToken && !isTokenExpired(storedToken) ? storedToken : null;

  // IMPORTANT: Sync token to API client on initialization
  if (validToken) {
    setAuthToken(validToken);
  }

  let state = $state<AuthState>({
    token: validToken,
    user: validToken ? parseToken(validToken) : null,
    loading: false
  });

  // Helper function to sync token changes
  const syncToken = (token: string | null) => {
    setAuthToken(token);

    if (token) {
      safeLocalStorage.setItem(TOKEN_KEY, token);
    } else {
      safeLocalStorage.removeItem(TOKEN_KEY);
    }
  };

  // Set up 401 handler
  setOnUnauthorized(() => {
    state.token = null;
    state.user = null;
    syncToken(null);
    goto('/login');
  });

  const login = async (username: string, password: string) => {
    state.loading = true;
    try {
      const result = await authApi.login({ username, password });

      if (result.ok) {
        const parsedUser = parseToken(result.value.accessToken);
        if (parsedUser) {
          state.token = result.value.accessToken;
          state.user = parsedUser;
          syncToken(state.token);
          // Reset the logout guard so 401s can be handled again
          resetLogoutGuard();
        } else {
          // Token parsing failed - clear any existing auth state
          console.error('Failed to parse user from access token');
          state.token = null;
          state.user = null;
          syncToken(null);
        }
      }

      return result;
    } finally {
      state.loading = false;
    }
  };

  const logout = async () => {
    await authApi.logout();
    state.token = null;
    state.user = null;
    syncToken(null);
    goto('/login');
  };

  const checkAuth = () => {
    if (state.token && isTokenExpired(state.token)) {
      state.token = null;
      state.user = null;
      syncToken(null);
      return false;
    }
    return state.token !== null;
  };

  return {
    get token() {
      return state.token;
    },
    get user() {
      return state.user;
    },
    get loading() {
      return state.loading;
    },
    get isAuthenticated() {
      return state.token !== null && !isTokenExpired(state.token);
    },
    login,
    logout,
    checkAuth
  };
};

export const authStore = createAuthStore();
