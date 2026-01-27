<script lang="ts">
  import { goto } from '$app/navigation';
  import { serviceStore } from '$lib/stores/services.svelte';
  import { toastStore } from '$lib/stores/toast.svelte';
  import type { Service } from '$lib/types/service';
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
  import { ServiceCard } from '$lib/components/domain';
  import { Plus, Search } from 'lucide-svelte';

  let searchQuery = $state('');
  let deleteModalOpen = $state(false);
  let serviceToDelete = $state<Service | null>(null);
  let deleting = $state(false);

  // Load services on mount
  $effect(() => {
    serviceStore.load();
  });

  const handleSearch = () => {
    serviceStore.setSearch(searchQuery);
  };

  const handleSearchKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleEdit = (service: Service) => {
    goto(`/services/${service.id}`);
  };

  const handleDelete = (service: Service) => {
    serviceToDelete = service;
    deleteModalOpen = true;
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;

    deleting = true;
    const result = await serviceStore.remove(serviceToDelete.id);
    deleting = false;

    if (result.ok) {
      toastStore.success('Serviço excluído com sucesso');
      deleteModalOpen = false;
      serviceToDelete = null;
    } else {
      toastStore.error(result.error.message);
    }
  };

  const handleClick = (service: Service) => {
    goto(`/services/${service.id}`);
  };
</script>

<svelte:head>
  <title>Serviços - gprint</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Serviços</h1>
      <p class="text-gray-600">Gerencie o catálogo de serviços</p>
    </div>

    <Button onclick={() => goto('/services/new')}>
      {#snippet icon()}<Plus class="h-4 w-4" />{/snippet}
      {#snippet children()}Novo Serviço{/snippet}
    </Button>
  </div>

  <!-- Search -->
  <Card class="p-4">
    <div class="flex gap-2">
      <div class="flex-1">
        <Input
          placeholder="Buscar por nome ou código..."
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
  {#if serviceStore.loading}
    <Spinner />
  {:else if serviceStore.error}
    <ErrorMessage message={serviceStore.error} onRetry={() => serviceStore.load()} />
  {:else if serviceStore.items.length === 0}
    <Card class="p-8">
      <EmptyState
        title="Nenhum serviço encontrado"
        message={serviceStore.search
          ? 'Nenhum serviço corresponde à sua busca'
          : 'Comece cadastrando seu primeiro serviço'}
      >
        {#snippet action()}
          {#if !serviceStore.search}
            <Button onclick={() => goto('/services/new')}>
              {#snippet icon()}<Plus class="h-4 w-4" />{/snippet}
              {#snippet children()}Novo Serviço{/snippet}
            </Button>
          {/if}
        {/snippet}
      </EmptyState>
    </Card>
  {:else}
    <!-- Service grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each serviceStore.items as service (service.id)}
        <ServiceCard
          {service}
          onClick={handleClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      {/each}
    </div>

    <!-- Pagination -->
    <Card>
      <Pagination
        page={serviceStore.page}
        pageSize={serviceStore.pageSize}
        totalCount={serviceStore.totalCount}
        totalPages={serviceStore.totalPages}
        onPageChange={serviceStore.setPage}
        onPageSizeChange={serviceStore.setPageSize}
      />
    </Card>
  {/if}
</div>

<!-- Delete confirmation modal -->
<Modal
  bind:open={deleteModalOpen}
  title="Excluir Serviço"
  size="sm"
  onClose={() => (deleteModalOpen = false)}
>
  <p class="text-gray-600">
    Tem certeza que deseja excluir o serviço <strong>{serviceToDelete?.name}</strong>?
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
