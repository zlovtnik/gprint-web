<script lang="ts">
  import { page } from '$app/stores';
  import { contractsApi } from '$lib/api/contracts';
  import type { Contract } from '$lib/types/contract';
  import { Card, Spinner, ErrorMessage, Badge } from '$lib/components/ui';
  import { formatDateTime } from '$lib/utils/format';
  import { ArrowLeft, History, User, Edit, FileText, CheckCircle } from 'lucide-svelte';

  interface HistoryEntry {
    id: number;
    action: string;
    field?: string;
    oldValue?: string;
    newValue?: string;
    userId?: number;
    userName?: string;
    createdAt: string;
  }

  let contract = $state<Contract | null>(null);
  let history = $state<HistoryEntry[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  const contractId = $derived(Number($page.params.id));

  const actionIcons: Record<string, typeof History> = {
    CREATED: FileText,
    UPDATED: Edit,
    SIGNED: CheckCircle,
    STATUS_CHANGED: History
  };

  const actionLabels: Record<string, string> = {
    CREATED: 'Criado',
    UPDATED: 'Atualizado',
    SIGNED: 'Assinado',
    STATUS_CHANGED: 'Status alterado',
    ITEM_ADDED: 'Item adicionado',
    ITEM_UPDATED: 'Item atualizado',
    ITEM_DELETED: 'Item removido'
  };

  // Load data on mount
  $effect(() => {
    loadData();
  });

  const loadData = async () => {
    loading = true;
    error = null;

    try {
      const [contractResult, historyResult] = await Promise.all([
        contractsApi.get(contractId),
        contractsApi.getHistory(contractId)
      ]);

      if (contractResult.ok) {
        contract = contractResult.value;
      } else {
        error = contractResult.error.message;
      }

      if (historyResult.ok) {
        history = historyResult.value;
      } else {
        error = error ?? historyResult.error.message;
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Erro de conexão. Tente novamente.';
    } finally {
      loading = false;
    }
  };
</script>

<svelte:head>
  <title>Histórico do Contrato - gprint</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <a
      href="/contracts/{contractId}"
      class="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
    >
      <ArrowLeft class="h-4 w-4" />
      Voltar para o Contrato
    </a>
    <h1 class="text-2xl font-bold text-gray-900">Histórico do Contrato</h1>
    <p class="text-gray-600">{contract?.contractNumber ?? ''}</p>
  </div>

  <!-- Content -->
  {#if loading}
    <Card class="p-8">
      <Spinner />
    </Card>
  {:else if error}
    <Card class="p-8">
      <ErrorMessage message={error} onRetry={loadData} />
    </Card>
  {:else if history.length === 0}
    <Card class="p-8 text-center">
      <History class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500">Nenhum histórico disponível</p>
    </Card>
  {:else}
    <Card class="p-6">
      <div class="relative">
        <!-- Timeline line -->
        <div class="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>

        <!-- Timeline entries -->
        <div class="space-y-6">
          {#each history as entry (entry.id)}
            {@const Icon = actionIcons[entry.action] ?? History}
            <div class="relative flex gap-4 pl-10">
              <!-- Icon -->
              <div
                class="absolute left-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center"
              >
                <Icon class="h-4 w-4 text-gray-500" />
              </div>

              <!-- Content -->
              <div class="flex-1 bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-medium text-gray-900">
                    {actionLabels[entry.action] ?? entry.action}
                  </span>
                  <span class="text-sm text-gray-500">{formatDateTime(entry.createdAt)}</span>
                </div>

                {#if entry.field}
                  <p class="text-sm text-gray-600">
                    Campo: <span class="font-medium">{entry.field}</span>
                  </p>
                {/if}

                {#if entry.oldValue || entry.newValue}
                  <div class="text-sm mt-2 space-y-1">
                    {#if entry.oldValue}
                      <p class="text-gray-500">
                        De: <span class="line-through">{entry.oldValue}</span>
                      </p>
                    {/if}
                    {#if entry.newValue}
                      <p class="text-gray-700">
                        Para: <span class="font-medium">{entry.newValue}</span>
                      </p>
                    {/if}
                  </div>
                {/if}

                {#if entry.userName}
                  <div class="flex items-center gap-1 mt-2 text-sm text-gray-400">
                    <User class="h-3 w-3" />
                    {entry.userName}
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </Card>
  {/if}
</div>
