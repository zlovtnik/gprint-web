<script lang="ts">
  import { goto } from '$app/navigation';
  import { etlStore, routesStore, messagesStore } from '$lib/stores/integrations.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import {
    Database,
    GitBranch,
    MessageSquare,
    ArrowRight,
    Activity,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    Clock
  } from 'lucide-svelte';

  let loading = $state(true);

  $effect(() => {
    loadData();
  });

  async function loadData() {
    loading = true;
    await Promise.all([
      etlStore.loadSessions({ limit: 5 }),
      routesStore.loadRoutes({ limit: 5 }),
      routesStore.loadStats(),
      messagesStore.loadChannels({ limit: 5 }),
      messagesStore.loadDeadLetterMessages({ limit: 5 })
    ]);
    loading = false;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: 'secondary',
      loading: 'primary',
      transforming: 'primary',
      validating: 'warning',
      promoting: 'primary',
      completed: 'success',
      failed: 'danger',
      rolled_back: 'warning'
    };
    return (colors[status] ?? 'secondary') as 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  };
</script>

<svelte:head>
  <title>Integrações | Pressly</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-[#f0f0f0]">Integrações</h1>
      <p class="text-[#787878] mt-1">
        Gerenciamento de ETL, rotas e mensagens
      </p>
    </div>
    <Button variant="ghost" onclick={loadData} disabled={loading}>
      <RefreshCw class="h-4 w-4 {loading ? 'animate-spin' : ''}" />
      <span class="ml-2">Atualizar</span>
    </Button>
  </div>

  {#if loading}
    <div class="flex justify-center py-12">
      <Spinner size="lg" />
    </div>
  {:else}
    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card class="!bg-[#0a0a0a] border-[#00d4ff]/20">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-[#00d4ff]/10">
            <Database class="h-6 w-6 text-[#00d4ff]" />
          </div>
          <div>
            <p class="text-sm text-[#787878]">Sessões ETL</p>
            <p class="text-2xl font-bold text-[#f0f0f0]">
              {etlStore.sessionStats.total}
            </p>
            <p class="text-xs text-[#00d4ff]">
              {etlStore.sessionStats.active} ativas
            </p>
          </div>
        </div>
      </Card>

      <Card class="!bg-[#0a0a0a] border-[#8000ff]/20">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-[#8000ff]/10">
            <GitBranch class="h-6 w-6 text-[#8000ff]" />
          </div>
          <div>
            <p class="text-sm text-[#787878]">Rotas</p>
            <p class="text-2xl font-bold text-[#f0f0f0]">
              {routesStore.stats?.totalRoutes ?? 0}
            </p>
            <p class="text-xs text-[#8000ff]">
              {routesStore.stats?.activeRoutes ?? 0} ativas
            </p>
          </div>
        </div>
      </Card>

      <Card class="!bg-[#0a0a0a] border-[#39ff14]/20">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-[#39ff14]/10">
            <MessageSquare class="h-6 w-6 text-[#39ff14]" />
          </div>
          <div>
            <p class="text-sm text-[#787878]">Canais</p>
            <p class="text-2xl font-bold text-[#f0f0f0]">
              {messagesStore.channels.length}
            </p>
            <p class="text-xs text-[#39ff14]">
              {messagesStore.totalQueueSize} na fila
            </p>
          </div>
        </div>
      </Card>

      <Card class="!bg-[#0a0a0a] border-[#ff0080]/20">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-[#ff0080]/10">
            <AlertTriangle class="h-6 w-6 text-[#ff0080]" />
          </div>
          <div>
            <p class="text-sm text-[#787878]">Dead Letters</p>
            <p class="text-2xl font-bold text-[#f0f0f0]">
              {messagesStore.deadLetterMessages.length}
            </p>
            <p class="text-xs text-[#ff0080]">
              pendentes de retry
            </p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Recent Sessions & Routes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent ETL Sessions -->
      <Card class="!bg-[#0a0a0a]">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-[#f0f0f0] flex items-center gap-2">
            <Database class="h-5 w-5 text-[#00d4ff]" />
            Sessões Recentes
          </h2>
          <Button variant="ghost" size="sm" onclick={() => goto('/integrations/etl')}>
            Ver todas
            <ArrowRight class="h-4 w-4 ml-1" />
          </Button>
        </div>

        {#if etlStore.sessions.length > 0}
          <div class="space-y-3">
            {#each etlStore.sessions.slice(0, 5) as session}
              <button
                class="w-full p-3 rounded-lg bg-[#111111] hover:bg-[#1a1a1a] 
                       border border-[#2a2a2a] transition-colors text-left"
                onclick={() => goto(`/integrations/etl/sessions/${session.sessionId}`)}
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <Activity class="h-4 w-4 text-[#787878]" />
                    <span class="font-mono text-sm text-[#c4c4c4]">
                      {session.sessionId.slice(0, 8)}...
                    </span>
                  </div>
                  <Badge variant={getStatusColor(session.status)}>
                    {session.status}
                  </Badge>
                </div>
                <div class="mt-2 flex items-center gap-4 text-xs text-[#5a5a5a]">
                  <span>{session.sourceSystem}</span>
                  <span>•</span>
                  <span>{session.totalRecords} registros</span>
                </div>
              </button>
            {/each}
          </div>
        {:else}
          <div class="text-center py-8 text-[#5a5a5a]">
            <Database class="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma sessão encontrada</p>
          </div>
        {/if}
      </Card>

      <!-- Recent Routes -->
      <Card class="!bg-[#0a0a0a]">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-[#f0f0f0] flex items-center gap-2">
            <GitBranch class="h-5 w-5 text-[#8000ff]" />
            Rotas Configuradas
          </h2>
          <Button variant="ghost" size="sm" onclick={() => goto('/integrations/routes')}>
            Ver todas
            <ArrowRight class="h-4 w-4 ml-1" />
          </Button>
        </div>

        {#if routesStore.routes.length > 0}
          <div class="space-y-3">
            {#each routesStore.routes.slice(0, 5) as route}
              <button
                class="w-full p-3 rounded-lg bg-[#111111] hover:bg-[#1a1a1a] 
                       border border-[#2a2a2a] transition-colors text-left"
                onclick={() => goto(`/integrations/routes/${route.id}`)}
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="px-2 py-0.5 text-xs rounded bg-[#8000ff]/20 text-[#8000ff]">
                      {route.pattern.type}
                    </span>
                    <span class="font-mono text-sm text-[#c4c4c4] truncate max-w-[200px]">
                      {route.pattern.value}
                    </span>
                  </div>
                  {#if route.active}
                    <CheckCircle class="h-4 w-4 text-[#39ff14]" />
                  {:else}
                    <Clock class="h-4 w-4 text-[#5a5a5a]" />
                  {/if}
                </div>
                <div class="mt-2 flex items-center gap-2 text-xs text-[#5a5a5a]">
                  <ArrowRight class="h-3 w-3" />
                  <span class="truncate">{route.destination}</span>
                </div>
              </button>
            {/each}
          </div>
        {:else}
          <div class="text-center py-8 text-[#5a5a5a]">
            <GitBranch class="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma rota configurada</p>
          </div>
        {/if}
      </Card>
    </div>

    <!-- Channels & Dead Letter Queue -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Message Channels -->
      <Card class="!bg-[#0a0a0a]">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-[#f0f0f0] flex items-center gap-2">
            <MessageSquare class="h-5 w-5 text-[#39ff14]" />
            Canais de Mensagens
          </h2>
          <Button variant="ghost" size="sm" onclick={() => goto('/integrations/messages/channels')}>
            Ver todos
            <ArrowRight class="h-4 w-4 ml-1" />
          </Button>
        </div>

        {#if messagesStore.channels.length > 0}
          <div class="space-y-3">
            {#each messagesStore.channels.slice(0, 5) as channel}
              <div class="p-3 rounded-lg bg-[#111111] border border-[#2a2a2a]">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-[#c4c4c4]">{channel.name}</span>
                  <span class="text-sm text-[#39ff14]">{channel.queueSize} msgs</span>
                </div>
                <div class="mt-2 flex items-center gap-4 text-xs text-[#5a5a5a]">
                  <span>{channel.subscriberCount} subscribers</span>
                  <span>•</span>
                  <span>{channel.stats.delivered} entregues</span>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-8 text-[#5a5a5a]">
            <MessageSquare class="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum canal encontrado</p>
          </div>
        {/if}
      </Card>

      <!-- Dead Letter Queue -->
      <Card class="!bg-[#0a0a0a]">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-[#f0f0f0] flex items-center gap-2">
            <AlertTriangle class="h-5 w-5 text-[#ff0080]" />
            Dead Letter Queue
          </h2>
          <Button variant="ghost" size="sm" onclick={() => goto('/integrations/messages/dead-letter')}>
            Ver todos
            <ArrowRight class="h-4 w-4 ml-1" />
          </Button>
        </div>

        {#if messagesStore.deadLetterMessages.length > 0}
          <div class="space-y-3">
            {#each messagesStore.deadLetterMessages.slice(0, 5) as msg}
              <div class="p-3 rounded-lg bg-[#111111] border border-[#ff0080]/20">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-sm text-[#c4c4c4]">
                    {msg.originalMessageId.slice(0, 12)}...
                  </span>
                  <Badge variant="danger">{msg.retryCount} retries</Badge>
                </div>
                <p class="mt-2 text-xs text-[#ff0080] truncate">
                  {msg.failureReason}
                </p>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-8 text-[#5a5a5a]">
            <CheckCircle class="h-12 w-12 mx-auto mb-3 text-[#39ff14] opacity-50" />
            <p>Nenhuma mensagem na DLQ</p>
          </div>
        {/if}
      </Card>
    </div>
  {/if}
</div>
