<script lang="ts">
  import { integrationStore } from '$lib/stores/integrations.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import {
    Layers,
    RefreshCw,
    Clock,
    Plus
  } from 'lucide-svelte';

  let showCreateModal = $state(false);
  let newAggregation = $state({
    correlationId: '',
    expectedCount: 1,
    timeoutMs: 30000
  });
  let creating = $state(false);

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

  async function handleCreateAggregation() {
    if (!newAggregation.correlationId.trim()) return;
    creating = true;
    try {
      const result = await integrationStore.startAggregation(
        newAggregation.correlationId.trim(),
        newAggregation.expectedCount,
        newAggregation.timeoutMs
      );
      if (result) {
        showCreateModal = false;
        newAggregation = { correlationId: '', expectedCount: 1, timeoutMs: 30000 };
      }
    } finally {
      creating = false;
    }
  }
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
        Gerenciamento de agregação de mensagens correlacionadas
      </p>
    </div>
    <div class="flex items-center gap-3">
      <Button variant="primary" onclick={() => (showCreateModal = true)}>
        <Plus class="h-4 w-4 mr-2" />
        Nova Agregação
      </Button>
    </div>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Card class="!bg-[#0a0a0a] border-[#8000ff]/20">
      <div class="flex items-center gap-4">
        <div class="p-3 rounded-lg bg-[#8000ff]/10">
          <Layers class="h-6 w-6 text-[#8000ff]" />
        </div>
        <div>
          <p class="text-sm text-[#787878]">Total de Agregações</p>
          <p class="text-2xl font-bold text-[#f0f0f0]">
            {integrationStore.aggregations.length}
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
            {integrationStore.pendingAggregations.length}
          </p>
        </div>
      </div>
    </Card>
  </div>

  <!-- Aggregations List -->
  <Card class="!bg-[#0a0a0a]">
    {#if integrationStore.loading && integrationStore.aggregations.length === 0}
      <div class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    {:else if integrationStore.aggregations.length === 0}
      <div class="text-center py-12">
        <Layers class="h-16 w-16 mx-auto mb-4 text-[#2a2a2a]" />
        <h3 class="text-lg font-medium text-[#787878]">Nenhuma agregação ativa</h3>
        <p class="text-sm text-[#5a5a5a] mt-1">
          Use a API para criar agregações de mensagens correlacionadas.
        </p>
        <Button variant="primary" class="mt-4" onclick={() => (showCreateModal = true)}>
          <Plus class="h-4 w-4 mr-2" />
          Criar Agregação
        </Button>
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
                Progresso
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">
                Status
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#1a1a1a]">
            {#each integrationStore.aggregations as agg}
              <tr class="hover:bg-[#111111] transition-colors">
                <td class="px-4 py-3">
                  <span class="font-mono text-sm text-[#c4c4c4]">
                    {agg.correlationId.slice(0, 12)}...
                  </span>
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
                <td class="px-4 py-3">
                  {#if agg.status === 'pending'}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onclick={() => integrationStore.completeAggregation(agg.id)}
                    >
                      Completar
                    </Button>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </Card>
</div>

<!-- Create Aggregation Modal -->
<Modal bind:open={showCreateModal} title="Nova Agregação">
  <form onsubmit={(e) => { e.preventDefault(); handleCreateAggregation(); }} class="space-y-4">
    <Input
      label="Correlation ID"
      bind:value={newAggregation.correlationId}
      placeholder="correlation-id-123"
      required
    />

    <Input
      label="Contagem Esperada"
      type="number"
      bind:value={newAggregation.expectedCount}
      min={1}
      required
    />

    <Input
      label="Timeout (ms)"
      type="number"
      bind:value={newAggregation.timeoutMs}
      min={1000}
    />

    <div class="flex justify-end gap-3 pt-4">
      <Button variant="ghost" onclick={() => (showCreateModal = false)}>
        Cancelar
      </Button>
      <Button 
        variant="primary" 
        type="submit"
        disabled={creating || !newAggregation.correlationId.trim()}
      >
        {#if creating}
          <Spinner size="sm" class="mr-2" />
        {/if}
        Criar Agregação
      </Button>
    </div>
  </form>
</Modal>
