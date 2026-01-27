<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { serviceStore } from '$lib/stores/services.svelte';
  import { toastStore } from '$lib/stores/toast.svelte';
  import type { Service, CreateServiceRequest, UpdateServiceRequest, PriceUnit } from '$lib/types/service';
  import { Card, Spinner, ErrorMessage, Button, Badge } from '$lib/components/ui';
  import { ServiceForm } from '$lib/components/domain';
  import { formatCurrency } from '$lib/utils/format';
  import { ArrowLeft, Edit, X } from 'lucide-svelte';

  let service = $state<Service | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let editing = $state(false);
  let submitting = $state(false);

  const serviceId = $derived(Number($page.params.id));

  const unitLabels: Record<PriceUnit, string> = {
    UNIT: 'Unidade',
    PAGE: 'Página',
    HOUR: 'Hora',
    PROJECT: 'Projeto',
    MONTHLY: 'Mensal'
  };

  // Load service on mount
  $effect(() => {
    const id = serviceId; // Track the dependency
    if (!Number.isFinite(id) || id <= 0) {
      loading = false;
      error = 'ID de serviço inválido';
      return;
    }
    loadService();
  });

  const loadService = async () => {
    loading = true;
    error = null;

    const result = await serviceStore.getById(serviceId);

    if (result.ok) {
      service = result.value;
    } else {
      error = result.error.message;
    }

    loading = false;
  };

  const handleSubmit = async (data: CreateServiceRequest | UpdateServiceRequest) => {
    submitting = true;
    const result = await serviceStore.update(serviceId, data as UpdateServiceRequest);
    submitting = false;

    if (result.ok) {
      service = result.value;
      editing = false;
      toastStore.success('Serviço atualizado com sucesso!');
    } else {
      toastStore.error(result.error.message);
    }
  };

  const toggleActive = async () => {
    if (!service) return;

    const result = await serviceStore.update(serviceId, { active: !service.active });

    if (result.ok) {
      service = result.value;
      toastStore.success(
        service.active ? 'Serviço ativado com sucesso' : 'Serviço desativado com sucesso'
      );
    } else {
      toastStore.error(result.error.message);
    }
  };
</script>

<svelte:head>
  <title>{service?.name ?? 'Serviço'} - gprint</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between">
    <div>
      <a
        href="/services"
        class="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
      >
        <ArrowLeft class="h-4 w-4" />
        Voltar para Serviços
      </a>
      <h1 class="text-2xl font-bold text-gray-900">
        {service?.name ?? 'Carregando...'}
      </h1>
      {#if service}
        {@const isActive = service.active}
        <div class="flex items-center gap-2 mt-1">
          <span class="text-gray-600">{service.serviceCode}</span>
          <Badge color={isActive ? 'green' : 'gray'}>
            {#snippet children()}{isActive ? 'Ativo' : 'Inativo'}{/snippet}
          </Badge>
        </div>
      {/if}
    </div>

    {#if service && !editing}
      {@const isActive = service.active}
      <div class="flex items-center gap-2">
        <Button variant="outline" onclick={toggleActive}>
          {#snippet children()}{isActive ? 'Desativar' : 'Ativar'}{/snippet}
        </Button>
        <Button onclick={() => (editing = true)}>
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
      <ErrorMessage message={error} onRetry={loadService} />
    </Card>
  {:else if service}
    <Card class="p-6">
      {#if editing}
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold">Editar Serviço</h2>
          <Button variant="ghost" size="sm" onclick={() => (editing = false)}>
            {#snippet icon()}<X class="h-4 w-4" />{/snippet}
            {#snippet children()}Cancelar{/snippet}
          </Button>
        </div>
        <ServiceForm
          {service}
          onSubmit={handleSubmit}
          onCancel={() => (editing = false)}
          {submitting}
        />
      {:else}
        <!-- Display service details -->
        <div class="space-y-6">
          <section>
            <h3 class="text-sm font-medium text-electric-cyan/70 mb-3">Informações do Serviço</h3>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm text-electric-cyan/50">Unidade de Preço</dt>
                <dd class="text-white">{unitLabels[service.priceUnit]}</dd>
              </div>
              <div>
                <dt class="text-sm text-electric-cyan/50">Preço Unitário</dt>
                <dd class="text-xl font-semibold text-neon-green">
                  {formatCurrency('BRL')(service.unitPrice)}
                </dd>
              </div>
            </dl>
          </section>

          {#if service.description}
            <section>
              <h3 class="text-sm font-medium text-electric-cyan/70 mb-3">Descrição</h3>
              <p class="text-white/80 whitespace-pre-wrap">{service.description}</p>
            </section>
          {/if}
        </div>
      {/if}
    </Card>
  {/if}
</div>
