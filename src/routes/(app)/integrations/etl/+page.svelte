<script lang="ts">
  import { goto } from '$app/navigation';
  import { etlStore } from '$lib/stores/integrations.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Table from '$lib/components/ui/Table.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import {
    Database,
    Plus,
    RefreshCw,
    Eye,
    Play,
    CheckCircle,
    XCircle,
    RotateCcw
  } from 'lucide-svelte';

  let showCreateModal = $state(false);
  let newSession = $state({
    tenantId: '',
    sourceSystem: ''
  });
  let creating = $state(false);
  let createError = $state<string | null>(null);

  const sourceSystemOptions = [
    { value: 'CLM', label: 'CLM - Contract Lifecycle Management' },
    { value: 'CRM', label: 'CRM - Customer Relations' },
    { value: 'ERP', label: 'ERP - Enterprise Resource Planning' },
    { value: 'LEGACY', label: 'Sistema Legado' }
  ];

  $effect(() => {
    etlStore.loadSessions();
  });

  async function handleCreateSession() {
    if (!newSession.tenantId || !newSession.sourceSystem) return;
    
    creating = true;
    createError = null;
    try {
      const sessionId = await etlStore.createSession(newSession.tenantId, newSession.sourceSystem);
      
      if (sessionId) {
        showCreateModal = false;
        newSession = { tenantId: '', sourceSystem: '' };
        createError = null;
        goto(`/integrations/etl/sessions/${sessionId}`);
      } else if (etlStore.error) {
        createError = etlStore.error;
      }
    } catch (e) {
      createError = e instanceof Error ? e.message : 'Falha ao criar sessão';
      console.error('Failed to create session:', e);
    } finally {
      creating = false;
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
      created: 'secondary',
      loading: 'primary',
      transforming: 'primary',
      validating: 'warning',
      promoting: 'primary',
      completed: 'success',
      failed: 'danger',
      rolled_back: 'warning'
    };
    return colors[status] ?? 'secondary';
  };

  const columns = [
    { key: 'sessionId', label: 'ID da Sessão' },
    { key: 'sourceSystem', label: 'Sistema Origem' },
    { key: 'status', label: 'Status' },
    { key: 'totalRecords', label: 'Registros' },
    { key: 'progress', label: 'Progresso' },
    { key: 'actions', label: 'Ações' }
  ];
</script>

<svelte:head>
  <title>ETL Sessions | Integrações | Pressly</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-[#f0f0f0] flex items-center gap-3">
        <Database class="h-7 w-7 text-[#00d4ff]" />
        Sessões ETL
      </h1>
      <p class="text-[#787878] mt-1">
        Gerenciamento de pipelines de importação e transformação
      </p>
    </div>
    <div class="flex items-center gap-3">
      <Button variant="ghost" onclick={() => etlStore.loadSessions()} disabled={etlStore.loading}>
        <RefreshCw class="h-4 w-4 {etlStore.loading ? 'animate-spin' : ''}" />
      </Button>
      <Button variant="primary" onclick={() => (showCreateModal = true)}>
        <Plus class="h-4 w-4 mr-2" />
        Nova Sessão
      </Button>
    </div>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <Card class="!bg-[#0a0a0a] border-[#2a2a2a]">
      <div class="text-center">
        <p class="text-3xl font-bold text-[#f0f0f0]">{etlStore.sessionStats.total}</p>
        <p class="text-sm text-[#787878]">Total</p>
      </div>
    </Card>
    <Card class="!bg-[#0a0a0a] border-[#00d4ff]/20">
      <div class="text-center">
        <p class="text-3xl font-bold text-[#00d4ff]">{etlStore.sessionStats.active}</p>
        <p class="text-sm text-[#787878]">Ativas</p>
      </div>
    </Card>
    <Card class="!bg-[#0a0a0a] border-[#39ff14]/20">
      <div class="text-center">
        <p class="text-3xl font-bold text-[#39ff14]">{etlStore.sessionStats.completed}</p>
        <p class="text-sm text-[#787878]">Concluídas</p>
      </div>
    </Card>
    <Card class="!bg-[#0a0a0a] border-[#ff0080]/20">
      <div class="text-center">
        <p class="text-3xl font-bold text-[#ff0080]">{etlStore.sessionStats.failed}</p>
        <p class="text-sm text-[#787878]">Falhas</p>
      </div>
    </Card>
  </div>

  <!-- Sessions Table -->
  <Card class="!bg-[#0a0a0a]">
    {#if etlStore.loading && etlStore.sessions.length === 0}
      <div class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    {:else if etlStore.sessions.length === 0}
      <div class="text-center py-12">
        <Database class="h-16 w-16 mx-auto mb-4 text-[#2a2a2a]" />
        <h3 class="text-lg font-medium text-[#787878]">Nenhuma sessão encontrada</h3>
        <p class="text-sm text-[#5a5a5a] mt-1">
          Crie uma nova sessão para iniciar um processo de importação.
        </p>
        <Button variant="primary" class="mt-4" onclick={() => (showCreateModal = true)}>
          <Plus class="h-4 w-4 mr-2" />
          Criar Sessão
        </Button>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-[#2a2a2a]">
              {#each columns as col}
                <th class="px-4 py-3 text-left text-xs font-medium text-[#787878] uppercase tracking-wider">
                  {col.label}
                </th>
              {/each}
            </tr>
          </thead>
          <tbody class="divide-y divide-[#1a1a1a]">
            {#each etlStore.sessions as session}
              <tr class="hover:bg-[#111111] transition-colors">
                <td class="px-4 py-3">
                  <span class="font-mono text-sm text-[#c4c4c4]">
                    {session.sessionId.slice(0, 8)}...
                  </span>
                </td>
                <td class="px-4 py-3 text-[#c4c4c4]">
                  {session.sourceSystem}
                </td>
                <td class="px-4 py-3">
                  <Badge variant={getStatusColor(session.status)}>
                    {session.status}
                  </Badge>
                </td>
                <td class="px-4 py-3 text-[#c4c4c4]">
                  {session.totalRecords}
                </td>
                <td class="px-4 py-3">
                  {#if true}
                    {@const progress = session.totalRecords > 0 
                      ? Math.round((session.promotedRecords / session.totalRecords) * 100) 
                      : 0}
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div 
                          class="h-full bg-[#00d4ff] transition-all duration-300"
                          style="width: {progress}%"
                        ></div>
                      </div>
                      <span class="text-xs text-[#5a5a5a] w-12 text-right">
                        {progress}%
                      </span>
                    </div>
                  {/if}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onclick={() => goto(`/integrations/etl/sessions/${session.sessionId}`)}
                    >
                      <Eye class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </Card>
</div>

<!-- Create Session Modal -->
<Modal bind:open={showCreateModal} title="Nova Sessão ETL">
  <form onsubmit={(e) => { e.preventDefault(); handleCreateSession(); }} class="space-y-4">
    {#if createError}
      <div class="p-3 rounded-lg bg-[#ff0080]/10 border border-[#ff0080]/30">
        <p class="text-sm text-[#ff0080]">{createError}</p>
      </div>
    {/if}
    
    <Input
      label="Tenant ID"
      bind:value={newSession.tenantId}
      placeholder="Digite o ID do tenant"
      required
    />
    
    <Select
      label="Sistema de Origem"
      bind:value={newSession.sourceSystem}
      options={sourceSystemOptions}
      placeholder="Selecione o sistema"
      required
    />

    <div class="flex justify-end gap-3 pt-4">
      <Button variant="ghost" onclick={() => (showCreateModal = false)}>
        Cancelar
      </Button>
      <Button 
        variant="primary" 
        type="submit"
        disabled={creating || !newSession.tenantId || !newSession.sourceSystem}
      >
        {#if creating}
          <Spinner size="sm" class="mr-2" />
        {/if}
        Criar Sessão
      </Button>
    </div>
  </form>
</Modal>
