<script lang="ts">
  import { messagesStore } from '$lib/stores/integrations.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import {
    MessageSquare,
    RefreshCw,
    Users,
    Inbox,
    Send,
    XCircle
  } from 'lucide-svelte';

  $effect(() => {
    messagesStore.loadChannels();
  });
</script>

<svelte:head>
  <title>Canais | Mensagens | Pressly</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-[#f0f0f0] flex items-center gap-3">
        <MessageSquare class="h-7 w-7 text-[#39ff14]" />
        Canais de Mensagens
      </h1>
      <p class="text-[#787878] mt-1">
        Monitoramento de filas e canais de mensagens
      </p>
    </div>
    <Button variant="ghost" onclick={() => messagesStore.loadChannels()} disabled={messagesStore.loading}>
      <RefreshCw class="h-4 w-4 {messagesStore.loading ? 'animate-spin' : ''}" />
    </Button>
  </div>

  <!-- Channels Grid -->
  {#if messagesStore.loading && messagesStore.channels.length === 0}
    <div class="flex justify-center py-12">
      <Spinner size="lg" />
    </div>
  {:else if messagesStore.channels.length === 0}
    <Card class="!bg-[#0a0a0a]">
      <div class="text-center py-12">
        <MessageSquare class="h-16 w-16 mx-auto mb-4 text-[#2a2a2a]" />
        <h3 class="text-lg font-medium text-[#787878]">Nenhum canal encontrado</h3>
        <p class="text-sm text-[#5a5a5a] mt-1">
          Os canais aparecerão aqui quando houver atividade de mensagens.
        </p>
      </div>
    </Card>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each messagesStore.channels as channel}
        <Card class="!bg-[#0a0a0a] hover:border-[#39ff14]/30 transition-colors">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-semibold text-[#f0f0f0]">{channel.name}</h3>
              <p class="text-sm text-[#5a5a5a] mt-1 flex items-center gap-2">
                <Users class="h-3 w-3" />
                {channel.subscriberCount} subscribers
              </p>
            </div>
            <Badge variant={channel.queueSize > 0 ? 'warning' : 'success'}>
              {channel.queueSize} na fila
            </Badge>
          </div>

          <div class="grid grid-cols-3 gap-3 pt-4 border-t border-[#2a2a2a]">
            <div class="text-center">
              <div class="flex items-center justify-center gap-1 text-[#39ff14]">
                <Send class="h-3 w-3" />
                <span class="text-lg font-bold">{channel.stats.published}</span>
              </div>
              <p class="text-xs text-[#5a5a5a]">Publicadas</p>
            </div>
            <div class="text-center">
              <div class="flex items-center justify-center gap-1 text-[#00d4ff]">
                <Inbox class="h-3 w-3" />
                <span class="text-lg font-bold">{channel.stats.delivered}</span>
              </div>
              <p class="text-xs text-[#5a5a5a]">Entregues</p>
            </div>
            <div class="text-center">
              <div class="flex items-center justify-center gap-1 text-[#ff0080]">
                <XCircle class="h-3 w-3" />
                <span class="text-lg font-bold">{channel.stats.dropped}</span>
              </div>
              <p class="text-xs text-[#5a5a5a]">Descartadas</p>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>
