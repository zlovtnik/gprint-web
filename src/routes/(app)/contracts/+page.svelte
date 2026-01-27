<script lang="ts">
  import { goto } from '$app/navigation';
  import { contractStore } from '$lib/stores/contracts.svelte';
  import { toastStore } from '$lib/stores/toast.svelte';
  import type { Contract, ContractStatus } from '$lib/types/contract';
  import {
    Button,
    Input,
    Select,
    Card,
    Pagination,
    Modal,
    Spinner,
    EmptyState,
    ErrorMessage
  } from '$lib/components/ui';
  import { ContractCard } from '$lib/components/domain';
  import { Plus, Search, Filter } from 'lucide-svelte';

  let searchQuery = $state('');
  let statusFilter = $state('');
  let deleteModalOpen = $state(false);
  let contractToDelete = $state<Contract | null>(null);
  let deleting = $state(false);

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'DRAFT', label: 'Rascunho' },
    { value: 'PENDING', label: 'Pendente' },
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'SUSPENDED', label: 'Suspenso' },
    { value: 'CANCELLED', label: 'Cancelado' },
    { value: 'COMPLETED', label: 'Concluído' }
  ];

  // Load contracts on mount
  $effect(() => {
    contractStore.load();
  });

  const handleSearch = () => {
    contractStore.setSearch(searchQuery);
  };

  const handleSearchKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStatusChange = () => {
    contractStore.setStatusFilter(statusFilter as ContractStatus | null || null);
  };

  const handleEdit = (contract: Contract) => {
    goto(`/contracts/${contract.id}`);
  };

  const handleDelete = (contract: Contract) => {
    contractToDelete = contract;
    deleteModalOpen = true;
  };

  const handleGenerate = (contract: Contract) => {
    goto(`/contracts/${contract.id}/generate`);
  };

  const confirmDelete = async () => {
    if (!contractToDelete) return;

    deleting = true;
    const result = await contractStore.remove(contractToDelete.id);
    deleting = false;

    if (result.ok) {
      toastStore.success('Contrato excluído com sucesso');
      deleteModalOpen = false;
      contractToDelete = null;
    } else {
      toastStore.error(result.error.message);
    }
  };

  const handleClick = (contract: Contract) => {
    goto(`/contracts/${contract.id}`);
  };
</script>

<svelte:head>
  <title>Contratos - gprint</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Contratos</h1>
      <p class="text-gray-600">Gerencie os contratos de impressão</p>
    </div>

    <Button onclick={() => goto('/contracts/new')}>
      {#snippet icon()}<Plus class="h-4 w-4" />{/snippet}
      {#snippet children()}Novo Contrato{/snippet}
    </Button>
  </div>

  <!-- Filters -->
  <Card class="p-4">
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <Input
          placeholder="Buscar por número ou cliente..."
          bind:value={searchQuery}
          onkeydown={handleSearchKeydown}
        />
      </div>
      <div class="w-full sm:w-48">
        <Select
          bind:value={statusFilter}
          options={statusOptions}
          onchange={handleStatusChange}
        />
      </div>
      <Button variant="secondary" onclick={handleSearch}>
        {#snippet icon()}<Search class="h-4 w-4" />{/snippet}
        {#snippet children()}Buscar{/snippet}
      </Button>
    </div>
  </Card>

  <!-- Content -->
  {#if contractStore.loading}
    <Spinner />
  {:else if contractStore.error}
    <ErrorMessage message={contractStore.error} onRetry={() => contractStore.load()} />
  {:else if contractStore.items.length === 0}
    <Card class="p-8">
      <EmptyState
        title="Nenhum contrato encontrado"
        message={contractStore.search || contractStore.statusFilter
          ? 'Nenhum contrato corresponde aos filtros'
          : 'Comece criando seu primeiro contrato'}
      >
        {#snippet action()}
          {#if !contractStore.search && !contractStore.statusFilter}
            <Button onclick={() => goto('/contracts/new')}>
              {#snippet icon()}<Plus class="h-4 w-4" />{/snippet}
              {#snippet children()}Novo Contrato{/snippet}
            </Button>
          {/if}
        {/snippet}
      </EmptyState>
    </Card>
  {:else}
    <!-- Contract grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each contractStore.items as contract (contract.id)}
        <ContractCard
          {contract}
          onClick={handleClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onGenerate={handleGenerate}
        />
      {/each}
    </div>

    <!-- Pagination -->
    <Card>
      <Pagination
        page={contractStore.page}
        pageSize={contractStore.pageSize}
        totalCount={contractStore.totalCount}
        totalPages={contractStore.totalPages}
        onPageChange={contractStore.setPage}
        onPageSizeChange={contractStore.setPageSize}
      />
    </Card>
  {/if}
</div>

<!-- Delete confirmation modal -->
<Modal
  bind:open={deleteModalOpen}
  title="Excluir Contrato"
  size="sm"
  onClose={() => (deleteModalOpen = false)}
>
  <p class="text-gray-600">
    Tem certeza que deseja excluir o contrato <strong>{contractToDelete?.contractNumber}</strong>?
    Esta ação não pode ser desfeita.
  </p>

  {#snippet footer()}
    <div class="flex justify-end gap-3">
      <Button variant="outline" onclick={() => (deleteModalOpen = false)}>
        {#snippet children()}Cancelar{/snippet}
      </Button>
      <Button variant="danger" loading={deleting} onclick={confirmDelete}>
        {#snippet children()}Excluir{/snippet}
      </Button>
    </div>
  {/snippet}
</Modal>
