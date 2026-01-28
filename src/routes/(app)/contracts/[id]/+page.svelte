<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { contractStore } from '$lib/stores/contracts.svelte';
  import { toastStore } from '$lib/stores/toast.svelte';
  import type { Contract, CreateContractRequest, UpdateContractRequest, ContractStatus } from '$lib/types/contract';
  import { Card, Spinner, ErrorMessage, Button, Badge, Modal, Input } from '$lib/components/ui';
  import type { Color } from '$lib/components/ui/Badge.svelte';
  import { ContractForm } from '$lib/components/domain';
  import { formatCurrency, formatDate } from '$lib/utils/format';
  import { ArrowLeft, Edit, X, FileDown, CheckCircle, History, Package } from 'lucide-svelte';

  let contract = $state<Contract | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let editing = $state(false);
  let submitting = $state(false);

  // Sign modal
  let signModalOpen = $state(false);
  let signedBy = $state('');
  let signing = $state(false);

  const contractId = $derived(Number($page.params.id));
  const isValidId = $derived(!isNaN(contractId) && contractId > 0);

  const statusColors: Record<ContractStatus, Color> = {
    DRAFT: 'gray',
    PENDING: 'yellow',
    ACTIVE: 'green',
    SUSPENDED: 'orange',
    CANCELLED: 'red',
    COMPLETED: 'blue'
  };

  const statusLabels: Record<ContractStatus, string> = {
    DRAFT: 'Rascunho',
    PENDING: 'Pendente',
    ACTIVE: 'Ativo',
    SUSPENDED: 'Suspenso',
    CANCELLED: 'Cancelado',
    COMPLETED: 'Concluído'
  };

  const typeLabels: Record<string, string> = {
    SERVICE: 'Serviço',
    RECURRING: 'Recorrente',
    PROJECT: 'Projeto'
  };

  const billingLabels: Record<string, string> = {
    MONTHLY: 'Mensal',
    QUARTERLY: 'Trimestral',
    YEARLY: 'Anual',
    ONCE: 'Único'
  };

  // Load contract on mount
  $effect(() => {
    loadContract();
  });

  const loadContract = async () => {
    if (!isValidId) {
      error = 'ID de contrato inválido';
      loading = false;
      return;
    }

    loading = true;
    error = null;

    const result = await contractStore.getById(contractId);

    if (result.ok) {
      contract = result.value;
    } else {
      error = result.error.message;
    }

    loading = false;
  };

  const handleSubmit = async (data: CreateContractRequest | UpdateContractRequest) => {
    submitting = true;
    const result = await contractStore.update(contractId, data as UpdateContractRequest);
    submitting = false;

    if (result.ok) {
      contract = result.value;
      editing = false;
      toastStore.success('Contrato atualizado com sucesso!');
    } else {
      toastStore.error(result.error.message);
    }
  };

  const handleSign = async () => {
    if (!signedBy.trim()) {
      toastStore.error('Informe o nome do responsável');
      return;
    }

    signing = true;
    const result = await contractStore.sign(contractId, signedBy);
    signing = false;

    if (result.ok) {
      contract = result.value;
      signModalOpen = false;
      signedBy = '';
      toastStore.success('Contrato assinado com sucesso!');
    } else {
      toastStore.error(result.error.message);
    }
  };

  let activating = $state(false);

  const handleActivate = async () => {
    if (activating) return;

    activating = true;
    try {
      const result = await contractStore.updateStatus(contractId, 'ACTIVE');
      if (result.ok) {
        contract = result.value;
        toastStore.success('Contrato ativado com sucesso!');
      } else {
        toastStore.error(result.error.message);
      }
    } finally {
      activating = false;
    }
  };
</script>

<svelte:head>
  <title>{contract?.contractNumber ?? 'Contrato'} - Pressly</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between">
    <div>
      <a
        href="/contracts"
        class="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
      >
        <ArrowLeft class="h-4 w-4" />
        Voltar para Contratos
      </a>
      <h1 class="text-2xl font-bold text-gray-900">
        {contract?.contractNumber ?? 'Carregando...'}
      </h1>
      {#if contract}
        {@const status = contract.status}
        <div class="flex items-center gap-2 mt-1">
          <span class="text-gray-600">{contract.customer?.name ?? ''}</span>
          <Badge color={statusColors[status]}>
            {#snippet children()}{statusLabels[status]}{/snippet}
          </Badge>
        </div>
      {/if}
    </div>

    {#if contract && !editing}
      <div class="flex items-center gap-2">
        {#if contract.status === 'DRAFT' || contract.status === 'PENDING'}
          <Button variant="outline" onclick={() => (signModalOpen = true)}>
            {#snippet icon()}<CheckCircle class="h-4 w-4" />{/snippet}
            {#snippet children()}Assinar{/snippet}
          </Button>
        {/if}
        {#if contract.status === 'PENDING' && contract.signedAt}
          <Button variant="outline" onclick={handleActivate}>
            {#snippet children()}Ativar{/snippet}
          </Button>
        {/if}
        {#if contract.status === 'ACTIVE'}
          <Button onclick={() => goto(`/contracts/${contractId}/generate`)}>
            {#snippet icon()}<FileDown class="h-4 w-4" />{/snippet}
            {#snippet children()}Gerar PDF{/snippet}
          </Button>
        {/if}
        <Button variant="outline" onclick={() => (editing = true)}>
          {#snippet icon()}<Edit class="h-4 w-4" />{/snippet}
          {#snippet children()}Editar{/snippet}
        </Button>
      </div>
    {/if}
  </div>

  <!-- Content -->
  {#if loading}
    <Card class="p-8">
      <Spinner />
    </Card>
  {:else if error}
    <Card class="p-8">
      <ErrorMessage message={error} onRetry={loadContract} />
    </Card>
  {:else if contract}
    {#if editing}
      <Card class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold">Editar Contrato</h2>
          <Button variant="ghost" size="sm" onclick={() => (editing = false)}>
            {#snippet icon()}<X class="h-4 w-4" />{/snippet}
            {#snippet children()}Cancelar{/snippet}
          </Button>
        </div>
        <ContractForm
          {contract}
          onSubmit={handleSubmit}
          onCancel={() => (editing = false)}
          {submitting}
        />
      </Card>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main info -->
        <div class="lg:col-span-2 space-y-6">
          <Card class="p-6">
            <h2 class="text-lg font-semibold mb-4">Informações do Contrato</h2>
            <dl class="grid grid-cols-2 gap-4">
              <div>
                <dt class="text-sm text-gray-500">Tipo</dt>
                <dd class="text-gray-900">{typeLabels[contract.contractType] ?? contract.contractType}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Ciclo de Faturamento</dt>
                <dd class="text-gray-900">{billingLabels[contract.billingCycle] ?? contract.billingCycle}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Data de Início</dt>
                <dd class="text-gray-900">{formatDate(contract.startDate)}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Data de Término</dt>
                <dd class="text-gray-900">{formatDate(contract.endDate)}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Duração</dt>
                <dd class="text-gray-900">
                  {contract.durationMonths ? `${contract.durationMonths} meses` : '—'}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Renovação Automática</dt>
                <dd class="text-gray-900">{contract.autoRenew ? 'Sim' : 'Não'}</dd>
              </div>
              <div class="col-span-2">
                <dt class="text-sm text-gray-500">Condições de Pagamento</dt>
                <dd class="text-gray-900">{contract.paymentTerms || '—'}</dd>
              </div>
            </dl>
          </Card>

          <!-- Items -->
          <Card class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold flex items-center gap-2">
                <Package class="h-5 w-5 text-gray-500" />
                Itens do Contrato
              </h2>
              <Button variant="outline" size="sm" onclick={() => goto(`/contracts/${contractId}/items`)}>
                {#snippet children()}Gerenciar Itens{/snippet}
              </Button>
            </div>

            {#if contract.items && contract.items.length > 0}
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th class="text-left text-xs font-medium text-gray-500 uppercase py-2">
                        Serviço
                      </th>
                      <th class="text-right text-xs font-medium text-gray-500 uppercase py-2">
                        Qtd
                      </th>
                      <th class="text-right text-xs font-medium text-gray-500 uppercase py-2">
                        Preço
                      </th>
                      <th class="text-right text-xs font-medium text-gray-500 uppercase py-2">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    {#each contract.items as item}
                      <tr>
                        <td class="py-2 text-sm text-gray-900">
                          {item.service?.name ?? `Serviço #${item.serviceId}`}
                        </td>
                        <td class="py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                        <td class="py-2 text-sm text-gray-900 text-right">
                          {formatCurrency('BRL')(item.unitPrice)}
                        </td>
                        <td class="py-2 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency('BRL')(item.lineTotal)}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {:else}
              <p class="text-gray-500 text-center py-4">Nenhum item adicionado</p>
            {/if}
          </Card>

          {#if contract.notes}
            <Card class="p-6">
              <h2 class="text-lg font-semibold mb-4">Observações</h2>
              <p class="text-gray-900 whitespace-pre-wrap">{contract.notes}</p>
            </Card>
          {/if}
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <Card class="p-6">
            <h3 class="text-lg font-semibold mb-4">Resumo</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-500">Valor Total</span>
                <span class="text-xl font-bold text-gray-900">
                  {formatCurrency('BRL')(contract.totalValue)}
                </span>
              </div>
              {#if contract.signedAt}
                <div class="pt-3 border-t">
                  <p class="text-sm text-gray-500">Assinado em</p>
                  <p class="text-gray-900">{formatDate(contract.signedAt)}</p>
                  {#if contract.signedBy}
                    <p class="text-sm text-gray-600">por {contract.signedBy}</p>
                  {/if}
                </div>
              {/if}
            </div>
          </Card>

          <Card class="p-6">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <History class="h-5 w-5 text-gray-500" />
              Ações
            </h3>
            <div class="space-y-2">
              <Button
                variant="outline"
                class="w-full"
                onclick={() => goto(`/contracts/${contractId}/history`)}
              >
                {#snippet children()}Ver Histórico{/snippet}
              </Button>
              <Button
                variant="outline"
                class="w-full"
                onclick={() => goto(`/contracts/${contractId}/generated`)}
              >
                {#snippet children()}Documentos Gerados{/snippet}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    {/if}
  {/if}
</div>

<!-- Sign Modal -->
<Modal
  bind:open={signModalOpen}
  title="Assinar Contrato"
  size="sm"
  onClose={() => (signModalOpen = false)}
>
  <div class="space-y-4">
    <p class="text-gray-600">
      Informe o nome do responsável pela assinatura do contrato.
    </p>
    <Input
      label="Responsável"
      bind:value={signedBy}
      placeholder="Nome completo"
      required
    />
  </div>

  {#snippet footer()}
    <div class="flex justify-end gap-3">
      <Button variant="outline" onclick={() => (signModalOpen = false)}>
        {#snippet children()}Cancelar{/snippet}
      </Button>
      <Button loading={signing} onclick={handleSign}>
        {#snippet children()}Assinar{/snippet}
      </Button>
    </div>
  {/snippet}
</Modal>
