<script lang="ts">
  import { pipelinesStore, integrationStore } from '$lib/stores/integrations.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import {
    Workflow,
    GitBranch,
    Plus,
    RefreshCw,
    Play,
    XCircle,
    ArrowRight,
    Clock
  } from 'lucide-svelte';

  let showRunModal = $state(false);
  let selectedTemplate = $state('');
  let pipelineParams = $state<Record<string, string>>({});
  let running = $state(false);

  let localLoading = $state(false);

  async function loadAllData() {
    localLoading = true;
    try {
      await Promise.all([
        pipelinesStore.loadTemplates(),
        integrationStore.loadRoutingRules()
      ]);
    } finally {
      localLoading = false;
    }
  }

  $effect(() => {
    loadAllData();
  });

  async function handleRunPipeline() {
    if (!selectedTemplate) return;
    
    running = true;
    try {
      // Parse JSON params if provided
      let parsedParams: Record<string, unknown> = {};
      const jsonStr = pipelineParams['json']?.trim();
      if (jsonStr) {
        try {
          parsedParams = JSON.parse(jsonStr);
        } catch {
          pipelinesStore.error = 'Parâmetros JSON inválidos';
          return;
        }
      }
      
      const result = await pipelinesStore.runPipeline(selectedTemplate, parsedParams);
      if (result) {
        showRunModal = false;
        selectedTemplate = '';
        pipelineParams = {};
      }
    } finally {
      running = false;
    }
  }

  async function handleCancelPipeline(sessionId: string) {
    await pipelinesStore.cancelPipeline(sessionId);
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'secondary',
      running: 'primary',
      completed: 'success',
      failed: 'danger',
      cancelled: 'warning'
    };
    return (colors[status] ?? 'secondary') as 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  };
</script>

<svelte:head>
  <title>Pipelines | Integrações | Pressly</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-[#f0f0f0] flex items-center gap-3">
        <Workflow class="h-7 w-7 text-[#8000ff]" />
        Pipelines de Integração
      </h1>
      <p class="text-[#787878] mt-1">
        Execute e gerencie pipelines de processamento de dados
      </p>
    </div>
    <div class="flex items-center gap-3">
      <Button variant="ghost" onclick={() => loadAllData()} disabled={localLoading}>
        <RefreshCw class="h-4 w-4 {localLoading ? 'animate-spin' : ''}" />
      </Button>
      <Button variant="primary" onclick={() => (showRunModal = true)}>
        <Play class="h-4 w-4 mr-2" />
        Executar Pipeline
      </Button>
    </div>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
    <Card class="!bg-[#0a0a0a] border-[#2a2a2a]">
      <div class="text-center">
        <p class="text-3xl font-bold text-[#f0f0f0]">{pipelinesStore.templates.length}</p>
        <p class="text-sm text-[#787878]">Templates</p>
      </div>
    </Card>
    <Card class="!bg-[#0a0a0a] border-[#8000ff]/20">
      <div class="text-center">
        <p class="text-3xl font-bold text-[#8000ff]">{integrationStore.routingRules.length}</p>
        <p class="text-sm text-[#787878]">Routing Rules</p>
      </div>
    </Card>
    <Card class="!bg-[#0a0a0a] border-[#39ff14]/20">
      <div class="text-center">
        <p class="text-3xl font-bold text-[#39ff14]">
          {pipelinesStore.currentStatus ? 1 : 0}
        </p>
        <p class="text-sm text-[#787878]">Em Execução</p>
      </div>
    </Card>
  </div>

  <!-- Pipeline Templates List -->
  <Card class="!bg-[#0a0a0a]">
    <div class="p-4 border-b border-[#2a2a2a]">
      <h2 class="text-lg font-semibold text-[#f0f0f0]">Templates Disponíveis</h2>
    </div>
    
    {#if pipelinesStore.loading && pipelinesStore.templates.length === 0}
      <div class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    {:else if pipelinesStore.templates.length === 0}
      <div class="text-center py-12">
        <Workflow class="h-16 w-16 mx-auto mb-4 text-[#2a2a2a]" />
        <h3 class="text-lg font-medium text-[#787878]">Nenhum template configurado</h3>
        <p class="text-sm text-[#5a5a5a] mt-1">
          Templates de pipeline serão listados aqui quando disponíveis.
        </p>
      </div>
    {:else}
      <div class="space-y-3 p-4">
        {#each pipelinesStore.templates as template}
          <div 
            class="p-4 rounded-lg bg-[#111111] border border-[#2a2a2a] 
                   hover:border-[#8000ff]/30 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <Badge variant="primary">{template.name}</Badge>
                  <span class="text-xs text-[#787878]">
                    {template.steps.length} steps
                  </span>
                </div>
                {#if template.description}
                  <p class="mt-2 text-sm text-[#5a5a5a]">
                    {template.description}
                  </p>
                {/if}
                <div class="flex items-center gap-2 mt-2 text-xs text-[#5a5a5a]">
                  {#each template.steps as step, i}
                    <span class="px-2 py-0.5 rounded bg-[#2a2a2a] text-[#c4c4c4]">
                      {step}
                    </span>
                    {#if i < template.steps.length - 1}
                      <ArrowRight class="h-3 w-3 text-[#787878]" />
                    {/if}
                  {/each}
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="sm"
                onclick={() => {
                  selectedTemplate = template.name;
                  showRunModal = true;
                }}
              >
                <Play class="h-4 w-4 text-[#39ff14]" />
              </Button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </Card>

  <!-- Current Pipeline Status -->
  {#if pipelinesStore.currentStatus}
    <Card class="!bg-[#0a0a0a]">
      <div class="p-4 border-b border-[#2a2a2a]">
        <h2 class="text-lg font-semibold text-[#f0f0f0]">Pipeline em Execução</h2>
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Clock class="h-5 w-5 text-[#8000ff] animate-pulse" />
            <span class="font-mono text-sm text-[#c4c4c4]">
              {pipelinesStore.currentStatus.sessionId}
            </span>
            <Badge variant={getStatusColor(pipelinesStore.currentStatus.state)}>
              {pipelinesStore.currentStatus.state}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onclick={() => handleCancelPipeline(pipelinesStore.currentStatus!.sessionId)}
          >
            <XCircle class="h-4 w-4 text-[#ff0080]" />
          </Button>
        </div>
        <div class="mt-3 text-sm text-[#5a5a5a]">
          Step atual: {pipelinesStore.currentStatus.currentStep}
        </div>
        {#if pipelinesStore.currentStatus.progress !== undefined}
          <div class="mt-2">
            <div class="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div 
                class="h-full bg-[#8000ff] transition-all"
                style="width: {pipelinesStore.currentStatus.progress}%"
              ></div>
            </div>
          </div>
        {/if}
      </div>
    </Card>
  {/if}

  <!-- Routing Rules -->
  <Card class="!bg-[#0a0a0a]">
    <div class="p-4 border-b border-[#2a2a2a]">
      <h2 class="text-lg font-semibold text-[#f0f0f0] flex items-center gap-2">
        <GitBranch class="h-5 w-5 text-[#ff0080]" />
        Routing Rules
      </h2>
    </div>
    
    {#if integrationStore.routingRules.length === 0}
      <div class="text-center py-8">
        <GitBranch class="h-12 w-12 mx-auto mb-3 text-[#2a2a2a]" />
        <p class="text-sm text-[#5a5a5a]">Nenhuma regra de roteamento configurada</p>
      </div>
    {:else}
      <div class="space-y-3 p-4">
        {#each integrationStore.routingRules as rule}
          <div 
            class="p-4 rounded-lg bg-[#111111] border border-[#2a2a2a]"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-[#c4c4c4]">{rule.name}</span>
                  <Badge variant="secondary">Prioridade: {rule.priority}</Badge>
                </div>
                <div class="flex items-center gap-2 mt-2 text-sm text-[#5a5a5a]">
                  <span class="font-mono text-xs px-2 py-0.5 rounded bg-[#2a2a2a]">
                    {rule.pattern}
                  </span>
                  <ArrowRight class="h-3 w-3" />
                  <span class="truncate">{rule.destination}</span>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </Card>
</div>

<!-- Run Pipeline Modal -->
<Modal bind:open={showRunModal} title="Executar Pipeline">
  <form onsubmit={(e) => { e.preventDefault(); handleRunPipeline(); }} class="space-y-4">
    <Select
      label="Template"
      bind:value={selectedTemplate}
      options={pipelinesStore.templates.map(t => ({ value: t.name, label: t.name }))}
      required
    />

    <Input
      label="Parâmetros (JSON)"
      bind:value={pipelineParams['json']}
      placeholder={'{"key": "value"}'}
    />

    <div class="flex justify-end gap-3 pt-4">
      <Button variant="ghost" onclick={() => (showRunModal = false)}>
        Cancelar
      </Button>
      <Button 
        variant="primary" 
        type="submit"
        disabled={running || !selectedTemplate}
      >
        {#if running}
          <Spinner size="sm" class="mr-2" />
        {/if}
        Executar
      </Button>
    </div>
  </form>
</Modal>
