<script lang="ts">
  import { goto } from '$app/navigation';
  import { integrationStore } from '$lib/stores/integrations.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import {
    AlertTriangle,
    ArrowLeft,
    MessageSquare,
    RefreshCw
  } from 'lucide-svelte';

  let retrying = $state(false);

  async function handleRetryMessage(messageId: string) {
    retrying = true;
    const result = await integrationStore.retryMessage(messageId);
    retrying = false;
    return result;
  }
</script>

<svelte:head>
  <title>Dead Letter Queue | Mensagens | Pressly</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-[#f0f0f0] flex items-center gap-3">
        <AlertTriangle class="h-7 w-7 text-[#ff0080]" />
        Dead Letter Queue
      </h1>
      <p class="text-[#787878] mt-1">
        Gerenciamento de mensagens com falha
      </p>
    </div>
    <Button variant="ghost" onclick={() => goto('/integrations/messages')}>
      <ArrowLeft class="h-4 w-4 mr-2" />
      Voltar
    </Button>
  </div>

  <!-- Info Card -->
  <Card class="!bg-[#0a0a0a] border-[#8000ff]/20">
    <div class="flex items-start gap-4 p-4">
      <div class="p-3 rounded-lg bg-[#8000ff]/10">
        <MessageSquare class="h-6 w-6 text-[#8000ff]" />
      </div>
      <div class="flex-1">
        <h3 class="font-semibold text-[#f0f0f0]">Gerenciamento de Mensagens</h3>
        <p class="text-sm text-[#787878] mt-2">
          Use a API de integração para gerenciar mensagens:
        </p>
        <ul class="mt-3 space-y-2 text-sm text-[#5a5a5a]">
          <li class="flex items-center gap-2">
            <RefreshCw class="h-4 w-4 text-[#00d4ff]" />
            <code class="px-2 py-0.5 bg-[#1a1a1a] rounded text-[#c4c4c4]">POST /v1/integration/messages/:id/retry</code>
            - Reprocessar mensagem
          </li>
          <li class="flex items-center gap-2">
            <AlertTriangle class="h-4 w-4 text-[#ff0080]" />
            <code class="px-2 py-0.5 bg-[#1a1a1a] rounded text-[#c4c4c4]">POST /v1/integration/messages/:id/dead-letter</code>
            - Mover para DLQ
          </li>
        </ul>
      </div>
    </div>
  </Card>

  <!-- Routing Rules Card -->
  <Card class="!bg-[#0a0a0a]">
    <div class="p-4 border-b border-[#2a2a2a]">
      <h2 class="text-lg font-semibold text-[#f0f0f0]">Regras de Roteamento</h2>
      <p class="text-sm text-[#787878] mt-1">
        Configure regras para rotear mensagens automaticamente
      </p>
    </div>
    
    {#if integrationStore.routingRules.length === 0}
      <div class="text-center py-8">
        <AlertTriangle class="h-12 w-12 mx-auto mb-3 text-[#2a2a2a]" />
        <p class="text-sm text-[#5a5a5a]">Nenhuma regra configurada</p>
        <Button variant="ghost" class="mt-3" onclick={() => goto('/integrations/routes')}>
          Configurar Regras
        </Button>
      </div>
    {:else}
      <div class="space-y-3 p-4">
        {#each integrationStore.routingRules as rule}
          <div class="p-3 rounded-lg bg-[#111111] border border-[#2a2a2a]">
            <div class="flex items-center justify-between">
              <span class="font-medium text-[#c4c4c4]">{rule.name}</span>
              <span class="text-xs text-[#787878]">Prioridade: {rule.priority}</span>
            </div>
            <div class="mt-1 text-xs text-[#5a5a5a]">
              {rule.pattern} → {rule.destination}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </Card>
</div>
