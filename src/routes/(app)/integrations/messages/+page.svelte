<script lang="ts">
  import { goto } from '$app/navigation';
  import { messagesStore } from '$lib/stores/integrations.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import {
    MessageSquare,
    RefreshCw,
    ArrowRight,
    AlertTriangle,
    Layers
  } from 'lucide-svelte';

  $effect(() => {
    messagesStore.loadChannels();
    messagesStore.loadAggregations();
    messagesStore.loadDeadLetterMessages({ limit: 5 });
  });
</script>

<svelte:head>
  <title>Mensagens | Integrações | Pressly</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-[#f0f0f0] flex items-center gap-3">
        <MessageSquare class="h-7 w-7 text-[#39ff14]" />
        Mensagens
      </h1>
      <p class="text-[#787878] mt-1">
        Canais, agregações e monitoramento de mensagens
      </p>
    </div>
    <Button variant="ghost" onclick={() => { 
      messagesStore.loadChannels(); 
      messagesStore.loadAggregations(); 
      messagesStore.loadDeadLetterMessages({ limit: 5 }); 
    }} disabled={messagesStore.loading}>
      <RefreshCw class="h-4 w-4 {messagesStore.loading ? 'animate-spin' : ''}" />
    </Button>
  </div>

  {#if messagesStore.loading}
    <div class="flex justify-center py-12">
      <Spinner size="lg" />
    </div>
  {:else}
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card class="!bg-[#0a0a0a] border-[#39ff14]/20 cursor-pointer hover:border-[#39ff14]/40 transition-colors"
            onclick={() => goto('/integrations/messages/channels')}>
        <div class="flex items-center justify-between">
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
                {messagesStore.totalQueueSize} mensagens na fila
              </p>
            </div>
          </div>
          <ArrowRight class="h-5 w-5 text-[#5a5a5a]" />
        </div>
      </Card>

      <Card class="!bg-[#0a0a0a] border-[#8000ff]/20 cursor-pointer hover:border-[#8000ff]/40 transition-colors"
            onclick={() => goto('/integrations/messages/aggregations')}>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-lg bg-[#8000ff]/10">
              <Layers class="h-6 w-6 text-[#8000ff]" />
            </div>
            <div>
              <p class="text-sm text-[#787878]">Agregações</p>
              <p class="text-2xl font-bold text-[#f0f0f0]">
                {messagesStore.aggregations.length}
              </p>
              <p class="text-xs text-[#8000ff]">
                {messagesStore.pendingAggregations.length} pendentes
              </p>
            </div>
          </div>
          <ArrowRight class="h-5 w-5 text-[#5a5a5a]" />
        </div>
      </Card>

      <Card class="!bg-[#0a0a0a] border-[#ff0080]/20 cursor-pointer hover:border-[#ff0080]/40 transition-colors"
            onclick={() => goto('/integrations/messages/dead-letter')}>
        <div class="flex items-center justify-between">
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
                requerem atenção
              </p>
            </div>
          </div>
          <ArrowRight class="h-5 w-5 text-[#5a5a5a]" />
        </div>
      </Card>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Channels Overview -->
      <Card class="!bg-[#0a0a0a]">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-[#f0f0f0]">Canais Ativos</h2>
          <Button variant="ghost" size="sm" onclick={() => goto('/integrations/messages/channels')}>
            Ver todos <ArrowRight class="h-4 w-4 ml-1" />
          </Button>
        </div>

        {#if messagesStore.channels.length > 0}
          <div class="space-y-3">
            {#each messagesStore.channels.slice(0, 5) as channel}
              <div class="p-3 rounded-lg bg-[#111111] border border-[#2a2a2a]">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-[#c4c4c4]">{channel.name}</span>
                  <Badge variant={channel.queueSize > 0 ? 'warning' : 'success'}>
                    {channel.queueSize}
                  </Badge>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-6 text-[#5a5a5a]">
            Nenhum canal ativo
          </div>
        {/if}
      </Card>

      <!-- Pending Aggregations -->
      <Card class="!bg-[#0a0a0a]">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-[#f0f0f0]">Agregações Pendentes</h2>
          <Button variant="ghost" size="sm" onclick={() => goto('/integrations/messages/aggregations')}>
            Ver todas <ArrowRight class="h-4 w-4 ml-1" />
          </Button>
        </div>

        {#if messagesStore.pendingAggregations.length > 0}
          <div class="space-y-3">
            {#each messagesStore.pendingAggregations.slice(0, 5) as agg}
              <div class="p-3 rounded-lg bg-[#111111] border border-[#2a2a2a]">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-sm text-[#c4c4c4]">
                    {agg.correlationId.slice(0, 12)}...
                  </span>
                  <Badge variant="warning">
                    {agg.currentCount}/{agg.expectedCount ?? '?'}
                  </Badge>
                </div>
                <p class="text-xs text-[#5a5a5a] mt-1">{agg.aggregationKey}</p>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-6 text-[#5a5a5a]">
            Nenhuma agregação pendente
          </div>
        {/if}
      </Card>
    </div>
  {/if}
</div>
