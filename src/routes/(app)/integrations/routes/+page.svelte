<script lang="ts">
  import { goto } from '$app/navigation';
  import { routesStore } from '$lib/stores/integrations.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import {
    GitBranch,
    Plus,
    RefreshCw,
    Edit,
    Trash2,
    ToggleLeft,
    ToggleRight,
    ArrowRight
  } from 'lucide-svelte';

  let showCreateModal = $state(false);
  let newRoute = $state({
    patternType: 'exact',
    patternValue: '',
    destination: '',
    priority: 10
  });
  let creating = $state(false);
  let deletingId = $state<string | null>(null);

  const patternTypeOptions = [
    { value: 'exact', label: 'Exato' },
    { value: 'glob', label: 'Glob Pattern' },
    { value: 'regex', label: 'Expressão Regular' },
    { value: 'function', label: 'Função' }
  ];

  let localLoading = $state(false);

  async function loadAllRoutesData() {
    localLoading = true;
    try {
      await Promise.all([routesStore.loadRoutes(), routesStore.loadStats()]);
    } finally {
      localLoading = false;
    }
  }

  $effect(() => {
    loadAllRoutesData();
  });

  async function handleCreateRoute() {
    if (!newRoute.patternValue || !newRoute.destination) return;
    
    creating = true;
    const result = await routesStore.createRoute({
      pattern: { type: newRoute.patternType, value: newRoute.patternValue },
      destination: newRoute.destination,
      priority: newRoute.priority,
      active: true
    });
    creating = false;
    
    if (result) {
      showCreateModal = false;
      newRoute = { patternType: 'exact', patternValue: '', destination: '', priority: 10 };
    }
  }

  async function handleToggleRoute(id: string) {
    await routesStore.toggleRoute(id);
  }

  async function handleDeleteRoute(id: string) {
    deletingId = id;
    try {
      const success = await routesStore.deleteRoute(id);
      if (!success && routesStore.error) {
        console.error('Failed to delete route:', routesStore.error);
        // Error is already set in routesStore.error for UI display
      }
    } catch (e) {
      console.error('Failed to delete route:', e);
    } finally {
      deletingId = null;
    }
  }
</script>

<svelte:head>
  <title>Rotas | Integrações | Pressly</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-[#f0f0f0] flex items-center gap-3">
        <GitBranch class="h-7 w-7 text-[#8000ff]" />
        Rotas de Mensagens
      </h1>
      <p class="text-[#787878] mt-1">
        Configuração de roteamento dinâmico de mensagens
      </p>
    </div>
    <div class="flex items-center gap-3">
      <Button variant="ghost" onclick={() => loadAllRoutesData()} disabled={localLoading}>
        <RefreshCw class="h-4 w-4 {localLoading ? 'animate-spin' : ''}" />
      </Button>
      <Button variant="primary" onclick={() => (showCreateModal = true)}>
        <Plus class="h-4 w-4 mr-2" />
        Nova Rota
      </Button>
    </div>
  </div>

  <!-- Stats Cards -->
  {#if routesStore.stats}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card class="!bg-[#0a0a0a] border-[#2a2a2a]">
        <div class="text-center">
          <p class="text-3xl font-bold text-[#f0f0f0]">{routesStore.stats.totalRoutes}</p>
          <p class="text-sm text-[#787878]">Total</p>
        </div>
      </Card>
      <Card class="!bg-[#0a0a0a] border-[#8000ff]/20">
        <div class="text-center">
          <p class="text-3xl font-bold text-[#8000ff]">{routesStore.stats.activeRoutes}</p>
          <p class="text-sm text-[#787878]">Ativas</p>
        </div>
      </Card>
      <Card class="!bg-[#0a0a0a] border-[#39ff14]/20">
        <div class="text-center">
          <p class="text-3xl font-bold text-[#39ff14]">{routesStore.stats.routedCount}</p>
          <p class="text-sm text-[#787878]">Roteadas</p>
        </div>
      </Card>
      <Card class="!bg-[#0a0a0a] border-[#ff0080]/20">
        <div class="text-center">
          <p class="text-3xl font-bold text-[#ff0080]">{routesStore.stats.unroutedCount}</p>
          <p class="text-sm text-[#787878]">Sem Rota</p>
        </div>
      </Card>
    </div>
  {/if}

  <!-- Routes List -->
  <Card class="!bg-[#0a0a0a]">
    {#if routesStore.loading && routesStore.routes.length === 0}
      <div class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    {:else if routesStore.routes.length === 0}
      <div class="text-center py-12">
        <GitBranch class="h-16 w-16 mx-auto mb-4 text-[#2a2a2a]" />
        <h3 class="text-lg font-medium text-[#787878]">Nenhuma rota configurada</h3>
        <p class="text-sm text-[#5a5a5a] mt-1">
          Crie rotas para direcionar mensagens para destinos específicos.
        </p>
        <Button variant="primary" class="mt-4" onclick={() => (showCreateModal = true)}>
          <Plus class="h-4 w-4 mr-2" />
          Criar Rota
        </Button>
      </div>
    {:else}
      <div class="space-y-3 p-4">
        {#each routesStore.routes as route}
          <div 
            class="p-4 rounded-lg bg-[#111111] border border-[#2a2a2a] 
                   hover:border-[#8000ff]/30 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 flex-1 min-w-0">
                <button
                  class="p-1 rounded hover:bg-[#2a2a2a] transition-colors"
                  onclick={() => handleToggleRoute(route.id)}
                >
                  {#if route.active}
                    <ToggleRight class="h-6 w-6 text-[#39ff14]" />
                  {:else}
                    <ToggleLeft class="h-6 w-6 text-[#5a5a5a]" />
                  {/if}
                </button>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <Badge variant={route.active ? 'success' : 'secondary'}>
                      {route.pattern.type}
                    </Badge>
                    <span class="font-mono text-sm text-[#c4c4c4] truncate">
                      {route.pattern.value}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 mt-1 text-sm text-[#5a5a5a]">
                    <ArrowRight class="h-3 w-3" />
                    <span class="truncate">{route.destination}</span>
                    <span class="text-[#787878]">• Prioridade: {route.priority}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onclick={() => goto(`/integrations/routes/${route.id}`)}
                >
                  <Edit class="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={deletingId === route.id}
                  onclick={() => handleDeleteRoute(route.id)}
                >
                  {#if deletingId === route.id}
                    <Spinner size="sm" />
                  {:else}
                    <Trash2 class="h-4 w-4 text-[#ff0080]" />
                  {/if}
                </Button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </Card>
</div>

<!-- Create Route Modal -->
<Modal bind:open={showCreateModal} title="Nova Rota">
  <form onsubmit={(e) => { e.preventDefault(); handleCreateRoute(); }} class="space-y-4">
    <Select
      label="Tipo de Padrão"
      bind:value={newRoute.patternType}
      options={patternTypeOptions}
    />

    <Input
      label="Padrão"
      bind:value={newRoute.patternValue}
      placeholder={newRoute.patternType === 'regex' ? '^contract\\..*' : 'contract.*'}
      required
    />

    <Input
      label="Destino"
      bind:value={newRoute.destination}
      placeholder="queue://contracts"
      required
    />

    <Input
      label="Prioridade"
      type="number"
      bind:value={newRoute.priority}
      min={1}
      max={100}
    />

    <div class="flex justify-end gap-3 pt-4">
      <Button variant="ghost" onclick={() => (showCreateModal = false)}>
        Cancelar
      </Button>
      <Button 
        variant="primary" 
        type="submit"
        disabled={creating || !newRoute.patternValue || !newRoute.destination}
      >
        {#if creating}
          <Spinner size="sm" class="mr-2" />
        {/if}
        Criar Rota
      </Button>
    </div>
  </form>
</Modal>
