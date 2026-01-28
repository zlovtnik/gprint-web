// Integration stores for ETL, Pipelines, Integration Messages, and Channels
import { etlApi, pipelinesApi, integrationApi, channelsApi } from '$lib/api/integrations';
import type {
  ETLSession,
  ValidationResult,
  PipelineTemplate,
  PipelineStatus,
  RoutingRule,
  Channel,
  Aggregation
} from '$lib/types/integration';

// ============================================
// ETL Store
// ============================================

class ETLStore {
  sessions = $state<ETLSession[]>([]);
  currentSession = $state<ETLSession | null>(null);
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

  async createSession(data?: { tenantId?: string; sourceSystem?: string }) {
    this.loading = true;
    try {
      const result = await etlApi.createSession(data);
      if (result.ok) {
        await this.loadSessions();
        return result.value;
      }
      this.error = result.error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async deleteSession(sessionId: string) {
    this.loading = true;
    try {
      const result = await etlApi.deleteSession(sessionId);
      if (result.ok) {
        await this.loadSessions();
        return true;
      }
      this.error = result.error.message;
      return false;
    } finally {
      this.loading = false;
    }
  }

  async loadData(sessionId: string, data: Record<string, unknown>[], config?: Record<string, unknown>) {
    this.loading = true;
    try {
      const result = await etlApi.loadData(sessionId, { data, config });
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

  async transformSession(sessionId: string) {
    this.loading = true;
    try {
      const result = await etlApi.transformSession(sessionId);
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

  async cleanup(olderThanDays?: number) {
    this.loading = true;
    try {
      const result = await etlApi.cleanup({ olderThanDays });
      if (result.ok) {
        await this.loadSessions();
        return result.value;
      }
      this.error = result.error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  clearError() {
    this.error = null;
  }
}

// ============================================
// Pipelines Store
// ============================================

class PipelinesStore {
  templates = $state<PipelineTemplate[]>([]);
  currentStatus = $state<PipelineStatus | null>(null);
  loading = $state(false);
  error = $state<string | null>(null);

  async loadTemplates() {
    this.loading = true;
    this.error = null;
    try {
      const result = await pipelinesApi.listTemplates();
      if (result.ok) {
        this.templates = result.value;
      } else {
        this.error = result.error.message;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Failed to load templates';
    } finally {
      this.loading = false;
    }
  }

  async runPipeline(name: string, params?: Record<string, unknown>) {
    this.loading = true;
    try {
      const result = await pipelinesApi.runPipeline(name, params);
      if (result.ok) {
        return result.value;
      }
      this.error = result.error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async loadStatus(sessionId: string) {
    this.loading = true;
    this.error = null;
    try {
      const result = await pipelinesApi.getStatus(sessionId);
      if (result.ok) {
        this.currentStatus = result.value;
      } else {
        this.error = result.error.message;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Failed to load pipeline status';
    } finally {
      this.loading = false;
    }
  }

  async cancelPipeline(sessionId: string) {
    this.loading = true;
    try {
      const result = await pipelinesApi.cancelPipeline(sessionId);
      if (result.ok) {
        this.currentStatus = null;
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
// Integration Messages Store
// ============================================

class IntegrationStore {
  routingRules = $state<RoutingRule[]>([]);
  aggregations = $state<Aggregation[]>([]);
  loading = $state(false);
  error = $state<string | null>(null);

  // Derived
  pendingAggregations = $derived(this.aggregations.filter((a) => a.status === 'pending'));

  async loadRoutingRules() {
    this.loading = true;
    this.error = null;
    try {
      const result = await integrationApi.getRoutingRules();
      if (result.ok) {
        this.routingRules = result.value;
      } else {
        this.error = result.error.message;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Failed to load routing rules';
    } finally {
      this.loading = false;
    }
  }

  async createMessage(data: { type: string; payload: Record<string, unknown>; correlationId?: string }) {
    this.loading = true;
    try {
      const result = await integrationApi.createMessage(data);
      if (result.ok) {
        return result.value;
      }
      this.error = result.error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async transformMessage(message: Record<string, unknown>, format: string, options?: Record<string, unknown>) {
    this.loading = true;
    try {
      const result = await integrationApi.transformMessage({ message, format, options });
      if (result.ok) {
        return result.value.transformed;
      }
      this.error = result.error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async checkDuplicate(messageId: string, correlationId?: string) {
    try {
      const result = await integrationApi.checkDuplicate(messageId, correlationId);
      if (result.ok) {
        return result.value;
      }
      return null;
    } catch {
      return null;
    }
  }

  async markProcessed(id: string) {
    try {
      const result = await integrationApi.markProcessed(id);
      return result.ok;
    } catch {
      return false;
    }
  }

  async retryMessage(id: string) {
    this.loading = true;
    try {
      const result = await integrationApi.retryMessage(id);
      if (result.ok) {
        return result.value;
      }
      this.error = result.error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async moveToDeadLetter(id: string, reason?: string) {
    this.loading = true;
    try {
      const result = await integrationApi.moveToDeadLetter(id, reason);
      if (result.ok) {
        return result.value;
      }
      this.error = result.error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async startAggregation(correlationId: string, expectedCount: number, timeoutMs?: number) {
    this.loading = true;
    try {
      const result = await integrationApi.startAggregation(correlationId, expectedCount, timeoutMs);
      if (result.ok) {
        // Add new aggregation to local state
        this.aggregations = [...this.aggregations, result.value];
        return result.value;
      }
      this.error = result.error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async addToAggregation(aggregationId: string, message: Record<string, unknown>) {
    try {
      const result = await integrationApi.addToAggregation(aggregationId, message);
      if (result.ok) {
        // Update aggregation in local state
        this.aggregations = this.aggregations.map((agg) =>
          agg.id === aggregationId ? result.value : agg
        );
        return result.value;
      }
      this.error = result.error.message;
      return null;
    } catch {
      return null;
    }
  }

  async completeAggregation(aggregationId: string) {
    this.loading = true;
    try {
      const result = await integrationApi.completeAggregation(aggregationId);
      if (result.ok) {
        // Update aggregation status in local state
        this.aggregations = this.aggregations.map((agg) =>
          agg.id === aggregationId ? result.value : agg
        );
        return result.value;
      }
      this.error = result.error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  clearError() {
    this.error = null;
  }
}

// ============================================
// Channels Store
// ============================================

class ChannelsStore {
  channels = $state<Channel[]>([]);
  currentChannel = $state<Channel | null>(null);
  loading = $state(false);
  error = $state<string | null>(null);

  // Derived
  totalQueueSize = $derived(this.channels.reduce((sum, ch) => sum + ch.queueSize, 0));
  activeChannels = $derived(this.channels.filter((ch) => ch.status === 'active'));

  async loadChannels(params?: { limit?: number }) {
    this.loading = true;
    this.error = null;
    try {
      const result = await channelsApi.listChannels(params);
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

  async createChannel(name: string, metadata?: Record<string, unknown>) {
    this.loading = true;
    try {
      const result = await channelsApi.createChannel({ name, metadata });
      if (result.ok) {
        await this.loadChannels();
        return result.value;
      }
      this.error = result.error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  async loadChannel(name: string) {
    this.loading = true;
    this.error = null;
    try {
      const result = await channelsApi.getChannel(name);
      if (result.ok) {
        this.currentChannel = result.value;
      } else {
        this.error = result.error.message;
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Failed to load channel';
    } finally {
      this.loading = false;
    }
  }

  async drainChannel(name: string) {
    this.loading = true;
    try {
      const result = await channelsApi.drainChannel(name);
      if (result.ok) {
        await this.loadChannels();
        return result.value;
      }
      this.error = result.error.message;
      return null;
    } finally {
      this.loading = false;
    }
  }

  clearError() {
    this.error = null;
  }
}

// Export singleton instances
export const etlStore = new ETLStore();
export const pipelinesStore = new PipelinesStore();
export const integrationStore = new IntegrationStore();
export const channelsStore = new ChannelsStore();
