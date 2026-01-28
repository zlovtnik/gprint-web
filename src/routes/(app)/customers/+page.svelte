<script lang="ts">
  import { goto } from '$app/navigation';
  import { customerStore } from '$lib/stores/customers.svelte';
  import { toastStore } from '$lib/stores/toast.svelte';
  import type { Customer } from '$lib/types/customer';
  import {
    Button,
    Input,
    Card,
    Pagination,
    Modal,
    Spinner,
    EmptyState,
    ErrorMessage
  } from '$lib/components/ui';
  import { CustomerCard } from '$lib/components/domain';
  import { Plus, Search, Users } from 'lucide-svelte';

  let searchQuery = $state('');
  let deleteModalOpen = $state(false);
  let customerToDelete = $state<Customer | null>(null);
  let deleting = $state(false);

  // Load customers on mount
  $effect(() => {
    customerStore.load();
  });

  const handleSearch = () => {
    customerStore.setSearch(searchQuery);
  };

  const handleSearchKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleEdit = (customer: Customer) => {
    goto(`/customers/${customer.id}`);
  };

  const handleDelete = (customer: Customer) => {
    customerToDelete = customer;
    deleteModalOpen = true;
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    deleting = true;
    const result = await customerStore.remove(customerToDelete.id);
    deleting = false;

    if (result.ok) {
      toastStore.success('Cliente excluído com sucesso');
      deleteModalOpen = false;
      customerToDelete = null;
    } else {
      toastStore.error(result.error.message);
    }
  };

  const handleClick = (customer: Customer) => {
    goto(`/customers/${customer.id}`);
  };
</script>

<svelte:head>
  <title>Clientes - Pressly</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Clientes</h1>
      <p class="text-gray-600">Gerencie os clientes cadastrados</p>
    </div>

    <Button onclick={() => goto('/customers/new')}>
      {#snippet icon()}<Plus class="h-4 w-4" />{/snippet}
      {#snippet children()}Novo Cliente{/snippet}
    </Button>
  </div>

  <!-- Search -->
  <Card class="p-4">
    <div class="flex gap-2">
      <div class="flex-1">
        <Input
          placeholder="Buscar por nome, código ou documento..."
          bind:value={searchQuery}
          onkeydown={handleSearchKeydown}
        />
      </div>
      <Button variant="secondary" onclick={handleSearch}>
        {#snippet icon()}<Search class="h-4 w-4" />{/snippet}
        {#snippet children()}Buscar{/snippet}
      </Button>
    </div>
  </Card>

  <!-- Content -->
  {#if customerStore.loading}
    <Spinner />
  {:else if customerStore.error}
    <ErrorMessage message={customerStore.error} onRetry={() => customerStore.load()} />
  {:else if customerStore.items.length === 0}
    <Card class="p-8">
      <EmptyState
        title="Nenhum cliente encontrado"
        message={customerStore.search
          ? 'Nenhum cliente corresponde à sua busca'
          : 'Comece cadastrando seu primeiro cliente'}
      >
        {#snippet action()}
          {#if !customerStore.search}
            <Button onclick={() => goto('/customers/new')}>
              {#snippet icon()}<Plus class="h-4 w-4" />{/snippet}
              {#snippet children()}Novo Cliente{/snippet}
            </Button>
          {/if}
        {/snippet}
      </EmptyState>
    </Card>
  {:else}
    <!-- Customer grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each customerStore.items as customer (customer.id)}
        <CustomerCard
          {customer}
          onClick={handleClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      {/each}
    </div>

    <!-- Pagination -->
    <Card>
      <Pagination
        page={customerStore.page}
        pageSize={customerStore.pageSize}
        totalCount={customerStore.totalCount}
        totalPages={customerStore.totalPages}
        onPageChange={customerStore.setPage}
        onPageSizeChange={customerStore.setPageSize}
      />
    </Card>
  {/if}
</div>

<!-- Delete confirmation modal -->
<Modal bind:open={deleteModalOpen} title="Excluir Cliente" size="sm" onClose={() => (deleteModalOpen = false)}>
  <p class="text-gray-600">
    Tem certeza que deseja excluir o cliente <strong>{customerToDelete?.name}</strong>?
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
