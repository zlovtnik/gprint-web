<script lang="ts">
  import { messagesStore } from '$lib/stores/integrations.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import {
    Layers,
    RefreshCw,
    Clock,
    CheckCircle,
    AlertTriangle
  } from 'lucide-svelte';

  $effect(() => {
    messagesStore.loadAggregations();
  });

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('pt-BR');
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
      pending: 'warning',
      complete: 'success',
      timeout: 'danger'
    };
    return colors[status] ?? 'secondary';
  };
</script>

<svelte:head>
  <title>Agregações | Mensagens | Pressly</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-[#f0f0f0] flex items-center gap-3">
        <Layers class="h-7 w-7 text-[#8000ff]" />
        Agregações
      </h1>
      <p class="text-[#787878] mt-1">
        Monitoramento de agregação de mensagens correlacionadas
      </p>
    </div>
    <Button variant="ghost" onclick={() => messagesStore.loadAggregations()} disabled={messagesStore.loading}>
      <RefreshCw class="h-4 w-4 {messagesStore.loading ? 'animate-spin' : ''}" />
    </Button>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card class="!bg-[#0a0a0a] border-[#2a2a2a]">
      <div class="flex items-center gap-4">
        <div class="p-3 rounded-lg bg-[#8000ff]/10">
          <Layers class="h-6 w-6 text-[#8000ff]" />
        </div>
        <div>
          <p class="text-sm text-[#787878]">Total</p>
          <p class="text-2xl font-bold text-[#f0f0f0]">
            {messagesStore.aggregations.length}
          </p>
        </div>
      </div>
    </Card>
    <Card class="!bg-[#0a0a0a] border-[#ffaa00]/20">
      <div class="flex items-center gap-4">
        <div class="p-3 rounded-lg bg-[#ffaa00]/10">
          <Clock class="h-6 w-6 text-[#ffaa00]" />
        </div>
        <div>
          <p class="text-sm text-[#787878]">Pendentes</p>
          <p class="text-2xl font-bold text-[#ffaa00]">
            {messagesStore.pendingAggregations.length}
          </p>
        </div>
      </div>
    </Card>
    <Card class="!bg-[#0a0a0a] border-[#39ff14]/20">
      <div class="flex items-center gap-4">
        <div class="p-3 rounded-lg bg-[#39ff14]/10">
          <CheckCircle class="h-6 w-6 text-[#39ff14]" />
        </div>
        <div>
          <p class="text-sm text-[#787878]">Completas</p>
          <p class="text-2xl font-bold text-[#39ff14]">
            {messagesStore.aggregations.filter(a => a.status === 'complete').length}
          </p>
        </div>
      </div>
    </Card>
  </div>

  <!-- Aggregations List -->
  <Card class="!bg-[#0a0a0a]">
    {#if messagesStore.loading && messagesStore.aggregations.length === 0}
      <div class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    {:else if messagesStore.aggregations.length === 0}
      <div class="text-center py-12">
        <Layers class="h-16 w-16 mx-auto mb-4 text-[#2a2a2a]" />
        <h3 class="text-lg font-medium text-[#787878]">Nenhuma agregação encontrada</h3>
        <p class="text-sm text-[#5a5a5a] mt-1">
          As agregações aparecerão aqui quando houver mensagens correlacionadas.
        </p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-[#2a2a2a]">
              <th class="px-4 py-3 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">
                Correlation ID
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">
                Chave
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">
                Progresso
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">
                Status
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">
                Iniciada
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">
                Timeout
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#1a1a1a]">
            {#each messagesStore.aggregations as agg}
              <tr class="hover:bg-[#111111] transition-colors">
                <td class="px-4 py-3">
                  <span class="font-mono text-sm text-[#c4c4c4]">
                    {agg.correlationId.slice(0, 12)}...
                  </span>
                </td>
                <td class="px-4 py-3 text-[#c4c4c4]">
                  {agg.aggregationKey}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span class="text-[#c4c4c4]">
                      {agg.currentCount}/{agg.expectedCount ?? '?'}
                    </span>
                    {#if agg.expectedCount}
                      <div class="w-16 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div 
                          class="h-full bg-[#8000ff] transition-all duration-300"
                          style="width: {Math.min(100, (agg.currentCount / agg.expectedCount) * 100)}%"
                        ></div>
                      </div>
                    {/if}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <Badge variant={getStatusColor(agg.status)}>
                    {agg.status}
                  </Badge>
                </td>
                <td class="px-4 py-3 text-sm text-[#5a5a5a]">
                  {formatDate(agg.startedAt)}
                </td>
                <td class="px-4 py-3 text-sm text-[#5a5a5a]">
                  {formatDate(agg.timeoutAt)}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </Card>
</div>
