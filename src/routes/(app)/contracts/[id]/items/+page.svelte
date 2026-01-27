<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { contractsApi } from '$lib/api/contracts';
  import { servicesApi } from '$lib/api/services';
  import { toastStore } from '$lib/stores/toast.svelte';
  import type { Contract, ContractItem } from '$lib/types/contract';
  import type { Service } from '$lib/types/service';
  import { Card, Spinner, ErrorMessage, Button, Input, Select, Modal } from '$lib/components/ui';
  import { formatCurrency } from '$lib/utils/format';
  import { ArrowLeft, Plus, Edit, Trash2, Package } from 'lucide-svelte';

  let contract = $state<Contract | null>(null);
  let services = $state<Service[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let servicesError = $state<string | null>(null);

  // Item form
  let modalOpen = $state(false);
  let editingItem = $state<ContractItem | null>(null);
  let submitting = $state(false);
  let deleteModalOpen = $state(false);
  let itemToDelete = $state<ContractItem | null>(null);
  let deleting = $state(false);

  let itemForm = $state({
    serviceId: '',
    quantity: 1,
    unitPrice: 0,
    notes: ''
  });

  const contractId = $derived(Number($page.params.id));

  const serviceOptions = $derived(
    services.map((s) => ({
      value: String(s.id),
      label: `${s.serviceCode} - ${s.name}`
    }))
  );

  // Load data on mount
  $effect(() => {
    const id = contractId; // Track contractId changes
    loadData();
  });

  // Update unit price when service changes
  $effect(() => {
    const service = services.find((s) => String(s.id) === itemForm.serviceId);
    if (service && !editingItem) {
      itemForm.unitPrice = parseFloat(service.unitPrice) || 0;
    }
  });

  const loadData = async () => {
    loading = true;
    error = null;
    servicesError = null;

    try {
      const [contractResult, servicesResult] = await Promise.all([
        contractsApi.get(contractId),
        servicesApi.list({ pageSize: 200, active: true })
      ]);

      if (contractResult.ok) {
        contract = contractResult.value;
      } else {
        error = contractResult.error.message;
      }

      if (servicesResult.ok) {
        services = servicesResult.value.data;
      } else {
        servicesError = servicesResult.error.message;
        services = [];
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Erro de conexão. Tente novamente.';
    } finally {
      loading = false;
    }
  };

  const openAddModal = () => {
    editingItem = null;
    itemForm = {
      serviceId: '',
      quantity: 1,
      unitPrice: 0,
      notes: ''
    };
    modalOpen = true;
  };

  const openEditModal = (item: ContractItem) => {
    editingItem = item;
    itemForm = {
      serviceId: String(item.serviceId),
      quantity: parseFloat(item.quantity) || 1,
      unitPrice: parseFloat(item.unitPrice) || 0,
      notes: item.description ?? ''
    };
    modalOpen = true;
  };

  const handleSubmit = async () => {
    if (!itemForm.serviceId) {
      toastStore.error('Selecione um serviço');
      return;
    }

    submitting = true;

    const data = {
      serviceId: Number(itemForm.serviceId),
      quantity: String(itemForm.quantity),
      unitPrice: String(itemForm.unitPrice),
      description: itemForm.notes || undefined
    };

    const result = editingItem
      ? await contractsApi.updateItem(contractId, editingItem.id, data)
      : await contractsApi.addItem(contractId, data);

    submitting = false;

    if (result.ok) {
      toastStore.success(editingItem ? 'Item atualizado' : 'Item adicionado');
      modalOpen = false;
      loadData();
    } else {
      toastStore.error(result.error.message);
    }
  };

  const handleDelete = (item: ContractItem) => {
    itemToDelete = item;
    deleteModalOpen = true;
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    deleting = true;
    const result = await contractsApi.deleteItem(contractId, itemToDelete.id);
    deleting = false;

    if (result.ok) {
      toastStore.success('Item removido');
      deleteModalOpen = false;
      itemToDelete = null;
      loadData();
    } else {
      toastStore.error(result.error.message);
    }
  };

  const lineTotal = $derived(itemForm.quantity * itemForm.unitPrice);
</script>

<svelte:head>
  <title>Itens do Contrato - gprint</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between">
    <div>
      <a
        href="/contracts/{contractId}"
        class="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
      >
        <ArrowLeft class="h-4 w-4" />
        Voltar para o Contrato
      </a>
      <h1 class="text-2xl font-bold text-gray-900">Itens do Contrato</h1>
      <p class="text-gray-600">{contract?.contractNumber ?? ''}</p>
    </div>

    <Button onclick={openAddModal}>
      {#snippet icon()}<Plus class="h-4 w-4" />{/snippet}
      {#snippet children()}Adicionar Item{/snippet}
    </Button>
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
  {:else if contract}
    <Card class="p-6">
      {#if contract.items && contract.items.length > 0}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">
                  Serviço
                </th>
                <th class="text-left text-xs font-medium text-gray-500 uppercase py-3 px-2">
                  Descrição
                </th>
                <th class="text-right text-xs font-medium text-gray-500 uppercase py-3 px-2">
                  Qtd
                </th>
                <th class="text-right text-xs font-medium text-gray-500 uppercase py-3 px-2">
                  Preço Unit.
                </th>
                <th class="text-right text-xs font-medium text-gray-500 uppercase py-3 px-2">
                  Total
                </th>
                <th class="text-right text-xs font-medium text-gray-500 uppercase py-3 px-2">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              {#each contract.items as item}
                <tr class="hover:bg-gray-50">
                  <td class="py-3 px-2">
                    <div class="flex items-center gap-2">
                      <Package class="h-4 w-4 text-gray-400" />
                      <span class="font-medium text-gray-900">
                        {item.service?.serviceCode ?? `#${item.serviceId}`}
                      </span>
                    </div>
                  </td>
                  <td class="py-3 px-2 text-sm text-gray-600">
                    {item.service?.name ?? '—'}
                    {#if item.description}
                      <p class="text-xs text-gray-400 mt-1">{item.description}</p>
                    {/if}
                  </td>
                  <td class="py-3 px-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                  <td class="py-3 px-2 text-sm text-gray-900 text-right">
                    {formatCurrency('BRL')(item.unitPrice)}
                  </td>
                  <td class="py-3 px-2 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency('BRL')(item.lineTotal)}
                  </td>
                  <td class="py-3 px-2 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onclick={() => openEditModal(item)} aria-label="Editar item">
                        {#snippet icon()}<Edit class="h-4 w-4" />{/snippet}
                        {#snippet children()}{/snippet}
                      </Button>
                      <Button variant="ghost" size="sm" onclick={() => handleDelete(item)} aria-label="Remover item">
                        {#snippet icon()}<Trash2 class="h-4 w-4 text-red-500" />{/snippet}
                        {#snippet children()}{/snippet}
                      </Button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
            <tfoot class="border-t-2 border-gray-200">
              <tr>
                <td colspan={4} class="py-3 px-2 text-right font-semibold text-gray-900">
                  Total do Contrato:
                </td>
                <td class="py-3 px-2 text-right text-lg font-bold text-gray-900">
                  {formatCurrency('BRL')(contract.totalValue)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      {:else}
        <div class="text-center py-8">
          <Package class="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500">Nenhum item adicionado</p>
          <Button class="mt-4" onclick={openAddModal}>
            {#snippet icon()}<Plus class="h-4 w-4" />{/snippet}
            {#snippet children()}Adicionar Primeiro Item{/snippet}
          </Button>
        </div>
      {/if}
    </Card>
  {/if}
</div>

<!-- Add/Edit Item Modal -->
<Modal
  bind:open={modalOpen}
  title={editingItem ? 'Editar Item' : 'Adicionar Item'}
  size="md"
  onClose={() => (modalOpen = false)}
>
  <div class="space-y-4">
    <Select
      label="Serviço"
      bind:value={itemForm.serviceId}
      options={serviceOptions}
      placeholder="Selecione um serviço"
      required
    />

    <div class="grid grid-cols-2 gap-4">
      <Input
        label="Quantidade"
        type="number"
        bind:value={itemForm.quantity}
        min={1}
        required
      />
      <Input
        label="Preço Unitário"
        type="number"
        bind:value={itemForm.unitPrice}
        min={0}
        step={0.01}
        required
      />
    </div>

    <div class="p-3 bg-gray-50 rounded-lg">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Total da linha:</span>
        <span class="font-semibold text-gray-900">{formatCurrency('BRL')(lineTotal)}</span>
      </div>
    </div>

    <Input label="Observações" bind:value={itemForm.notes} placeholder="Observações do item..." />
  </div>

  {#snippet footer()}
    <div class="flex justify-end gap-3">
      <Button variant="outline" onclick={() => (modalOpen = false)}>
        {#snippet children()}Cancelar{/snippet}
      </Button>
      <Button loading={submitting} onclick={handleSubmit}>
        {#snippet children()}{editingItem ? 'Salvar' : 'Adicionar'}{/snippet}
      </Button>
    </div>
  {/snippet}
</Modal>

<!-- Delete confirmation modal -->
<Modal
  bind:open={deleteModalOpen}
  title="Remover Item"
  size="sm"
  onClose={() => (deleteModalOpen = false)}
>
  <p class="text-gray-600">
    Tem certeza que deseja remover este item do contrato?
  </p>

  {#snippet footer()}
    <div class="flex justify-end gap-3">
      <Button variant="outline" onclick={() => (deleteModalOpen = false)}>
        {#snippet children()}Cancelar{/snippet}
      </Button>
      <Button variant="danger" loading={deleting} onclick={confirmDelete}>
        {#snippet children()}Remover{/snippet}
      </Button>
    </div>
  {/snippet}
</Modal>
