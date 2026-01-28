// Integration stores for ETL, Routing, and Messaging
import { etlApi, routesApi, messagesApi } from '$lib/api/integrations';
import type {
  ETLSession,
  StagingRecord,
  ValidationResult,
  RouteEntry,
  RouteStats,
  Channel,
  Aggregation,
  DeadLetterMessage
} from '$lib/types/integration';

// ============================================
// ETL Store
// ============================================

class ETLStore {
  sessions = $state<ETLSession[]>([]);
  currentSession = $state<ETLSession | null>(null);
  stagingRecords = $state<StagingRecord[]>([]);
  validationResults = $state<ValidationResult[]>([]);
  loading = $state(false);
  error = $state<string | null>(null);

  // Derived
  activeSessions = $derived(
    this.sessions.filter((s) => !['completed', 'failed', 'rolled_back'].includes(s.status))
  );

  sessionStats = $derived({
    total: this.sessions.length,
    active: this.activeSessions.length,
    completed: this.sessions.filter((s) => s.status === 'completed').length,
    failed: this.sessions.filter((s) => s.status === 'failed').length
  });

  async loadSessions(params?: { status?: string; limit?: number }) {
    this.loading = true;
    this.error = null;
    try {
      const result = await etlApi.listSessions(params);
      if (result.ok) {
        this.sessions = result.value;
      } else {
        this.error = result.error.message;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Failed to load sessions';
    } finally {
      this.loading = false;
    }
  }

  async loadSession(id: string) {
    this.loading = true;
    this.error = null;
    try {
      const result = await etlApi.getSession(id);
      if (result.ok) {
        this.currentSession = result.value;
      } else {
        this.error = result.error.message;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Failed to load session';
    } finally {
      this.loading = false;
    }
  }

  async createSession(tenantId: string, sourceSystem: string) {
    this.loading = true;
    try {
      const result = await etlApi.createSession({ tenantId, sourceSystem });
      if (result.ok) {
        await this.loadSessions();
        return result.value.sessionId;
      }
      this.error = result.error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async validateSession(sessionId: string) {
    this.loading = true;
    try {
      const result = await etlApi.validateSession(sessionId);
      if (result.ok) {
        this.validationResults = result.value;
        await this.loadSession(sessionId);
        return result.value;
      }
      this.error = result.error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async promoteSession(sessionId: string) {
    this.loading = true;
    try {
      const result = await etlApi.promoteSession(sessionId);
      if (result.ok) {
        await this.loadSession(sessionId);
        return result.value;
      }
      this.error = result.error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async rollbackSession(sessionId: string) {
    this.loading = true;
    try {
      const result = await etlApi.rollbackSession(sessionId);
      if (result.ok) {
        await this.loadSession(sessionId);
        return true;
      }
      this.error = result.error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }

  clearError() {
    this.error = null;
  }
}

// ============================================
// Routes Store
// ============================================

class RoutesStore {
  routes = $state<RouteEntry[]>([]);
  currentRoute = $state<RouteEntry | null>(null);
  stats = $state<RouteStats | null>(null);
  loading = $state(false);
  error = $state<string | null>(null);

  // Derived
  activeRoutes = $derived(this.routes.filter((r) => r.active));

  async loadRoutes(params?: { active?: boolean; limit?: number }) {
    this.loading = true;
    this.error = null;
    try {
      const result = await routesApi.listRoutes(params);
      if (result.ok) {
        this.routes = result.value;
      } else {
        this.error = result.error.message;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Failed to load routes';
    } finally {
      this.loading = false;
    }
  }

  async loadRoute(id: string) {
    this.loading = true;
    this.error = null;
    try {
      const result = await routesApi.getRoute(id);
      if (result.ok) {
        this.currentRoute = result.value;
      } else {
        this.error = result.error.message;
      }
    } finally {
      this.loading = false;
    }
  }

  async loadStats() {
    try {
      const result = await routesApi.getRouteStats();
      if (result.ok) {
        this.stats = result.value;
      }
    } catch {
      // Stats loading is non-critical
    }
  }

  async createRoute(data: Parameters<typeof routesApi.createRoute>[0]) {
    this.loading = true;
    try {
      const result = await routesApi.createRoute(data);
      if (result.ok) {
        await this.loadRoutes();
        return result.value;
      }
      this.error = result.error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async updateRoute(id: string, data: Parameters<typeof routesApi.updateRoute>[1]) {
    this.loading = true;
    try {
      const result = await routesApi.updateRoute(id, data);
      if (result.ok) {
        await this.loadRoutes();
        return result.value;
      }
      this.error = result.error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async deleteRoute(id: string) {
    this.loading = true;
    try {
      const result = await routesApi.deleteRoute(id);
      if (result.ok) {
        await this.loadRoutes();
        return true;
      }
      this.error = result.error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }

  async toggleRoute(id: string) {
    try {
      const result = await routesApi.toggleRoute(id);
      if (result.ok) {
        await this.loadRoutes();
        return result.value;
      }
      this.error = result.error.message;
      return null;
    } catch {
      return null;
    }
  }

  clearError() {
    this.error = null;
  }
}

// ============================================
// Messages Store
// ============================================

class MessagesStore {
  channels = $state<Channel[]>([]);
  currentChannel = $state<Channel | null>(null);
  aggregations = $state<Aggregation[]>([]);
  deadLetterMessages = $state<DeadLetterMessage[]>([]);
  loading = $state(false);
  error = $state<string | null>(null);

  // Derived
  totalQueueSize = $derived(this.channels.reduce((sum, ch) => sum + ch.queueSize, 0));

  pendingAggregations = $derived(this.aggregations.filter((a) => a.status === 'pending'));

  async loadChannels(params?: { limit?: number }) {
    this.loading = true;
    this.error = null;
    try {
      const result = await messagesApi.listChannels(params);
      if (result.ok) {
        this.channels = result.value;
      } else {
        this.error = result.error.message;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Failed to load channels';
    } finally {
      this.loading = false;
    }
  }

  async loadChannel(name: string) {
    this.loading = true;
    this.error = null;
    try {
      const result = await messagesApi.getChannel(name);
      if (result.ok) {
        this.currentChannel = result.value;
      } else {
        this.error = result.error.message;
      }
    } finally {
      this.loading = false;
    }
  }

  async loadAggregations(params?: { status?: 'pending' | 'complete' | 'timeout'; limit?: number }) {
    this.loading = true;
    this.error = null;
    try {
      const result = await messagesApi.listAggregations(params);
      if (result.ok) {
        this.aggregations = result.value;
      } else {
        this.error = result.error.message;
      }
    } finally {
      this.loading = false;
    }
  }

  async loadDeadLetterMessages(params?: { limit?: number }) {
    this.loading = true;
    this.error = null;
    try {
      const result = await messagesApi.listDeadLetterMessages(params);
      if (result.ok) {
        this.deadLetterMessages = result.value;
      } else {
        this.error = result.error.message;
      }
    } finally {
      this.loading = false;
    }
  }

  async retryDeadLetter(id: number) {
    try {
      const result = await messagesApi.retryDeadLetterMessage(id);
      if (result.ok) {
        await this.loadDeadLetterMessages();
        return true;
      }
      this.error = result.error.message;
      return false;
    } catch {
      return false;
    }
  }

  async deleteDeadLetter(id: number) {
    try {
      const result = await messagesApi.deleteDeadLetterMessage(id);
      if (result.ok) {
        await this.loadDeadLetterMessages();
        return true;
      }
      this.error = result.error.message;
      return false;
    } catch {
      return false;
    }
  }

  clearError() {
    this.error = null;
  }
}

// Export singleton instances
export const etlStore = new ETLStore();
export const routesStore = new RoutesStore();
export const messagesStore = new MessagesStore();
