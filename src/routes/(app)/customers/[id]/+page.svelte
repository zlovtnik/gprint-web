<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { customerStore } from '$lib/stores/customers.svelte';
  import { toastStore } from '$lib/stores/toast.svelte';
  import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '$lib/types/customer';
  import { Card, Spinner, ErrorMessage, Button, Badge } from '$lib/components/ui';
  import { CustomerForm } from '$lib/components/domain';
  import { ArrowLeft, Edit, X } from 'lucide-svelte';

  let customer = $state<Customer | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let editing = $state(false);
  let submitting = $state(false);

  const customerId = $derived(Number($page.params.id));

  // Load customer on mount
  $effect(() => {
    const id = customerId; // Read synchronously to track dependency
    if (Number.isNaN(id) || id <= 0) {
      loading = false;
      error = 'ID de cliente inválido';
      return;
    }
    loadCustomer();
  });

  const loadCustomer = async () => {
    loading = true;
    error = null;

    const result = await customerStore.getById(customerId);

    if (result.ok) {
      customer = result.value;
    } else {
      error = result.error.message;
    }

    loading = false;
  };

  const handleSubmit = async (data: CreateCustomerRequest | UpdateCustomerRequest) => {
    submitting = true;
    const result = await customerStore.update(customerId, data as UpdateCustomerRequest);
    submitting = false;

    if (result.ok) {
      customer = result.value;
      editing = false;
      toastStore.success('Cliente atualizado com sucesso!');
    } else {
      toastStore.error(result.error.message);
    }
  };

  const toggleActive = async () => {
    if (!customer) return;

    const result = await customerStore.update(customerId, { active: !customer.active });

    if (result.ok) {
      customer = result.value;
      const isActive = result.value.active;
      toastStore.success(
        isActive ? 'Cliente ativado com sucesso' : 'Cliente desativado com sucesso'
      );
    } else {
      toastStore.error(result.error.message);
    }
  };
</script>

<svelte:head>
  <title>{customer?.name ?? 'Cliente'} - gprint</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between">
    <div>
      <a
        href="/customers"
        class="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
      >
        <ArrowLeft class="h-4 w-4" />
        Voltar para Clientes
      </a>
      <h1 class="text-2xl font-bold text-gray-900">
        {customer?.name ?? 'Carregando...'}
      </h1>
      {#if customer}
        {@const isActive = customer.active}
        <div class="flex items-center gap-2 mt-1">
          <span class="text-gray-600">{customer.customerCode}</span>
          <Badge color={isActive ? 'green' : 'gray'}>
            {#snippet children()}{isActive ? 'Ativo' : 'Inativo'}{/snippet}
          </Badge>
        </div>
      {/if}
    </div>

    {#if customer && !editing}
      {@const isActive = customer.active}
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
      <ErrorMessage message={error} onRetry={loadCustomer} />
    </Card>
  {:else if customer}
    <Card class="p-6">
      {#if editing}
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold">Editar Cliente</h2>
          <Button variant="ghost" size="sm" onclick={() => (editing = false)}>
            {#snippet icon()}<X class="h-4 w-4" />{/snippet}
            {#snippet children()}Cancelar{/snippet}
          </Button>
        </div>
        <CustomerForm
          {customer}
          onSubmit={handleSubmit}
          onCancel={() => (editing = false)}
          {submitting}
        />
      {:else}
        <!-- Display customer details -->
        <div class="space-y-6">
          <section>
            <h3 class="text-sm font-medium text-gray-500 mb-3">Informações Básicas</h3>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm text-gray-500">Tipo</dt>
                <dd class="text-gray-900">
                  {customer.customerType === 'COMPANY' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Nome Fantasia</dt>
                <dd class="text-gray-900">{customer.tradeName || '—'}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">{customer.customerType === 'COMPANY' ? 'CNPJ' : 'CPF'}</dt>
                <dd class="text-gray-900">{customer.taxId || '—'}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Inscrição Estadual</dt>
                <dd class="text-gray-900">{customer.stateReg || '—'}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 class="text-sm font-medium text-gray-500 mb-3">Contato</h3>
            <dl class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <dt class="text-sm text-gray-500">E-mail</dt>
                <dd class="text-gray-900">{customer.email || '—'}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Telefone</dt>
                <dd class="text-gray-900">{customer.phone || '—'}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Celular</dt>
                <dd class="text-gray-900">{customer.mobile || '—'}</dd>
              </div>
            </dl>
          </section>

          {#if customer.address}
            <section>
              <h3 class="text-sm font-medium text-gray-500 mb-3">Endereço</h3>
              <p class="text-gray-900">
                {#if customer.address.street}
                  {customer.address.street}
                  {customer.address.number ? `, ${customer.address.number}` : ''}
                  {customer.address.complement ? ` - ${customer.address.complement}` : ''}
                  <br />
                {/if}
                {#if customer.address.district}
                  {customer.address.district}
                  <br />
                {/if}
                {customer.address.city || ''}
                {customer.address.state ? ` - ${customer.address.state}` : ''}
                {customer.address.zip ? ` - ${customer.address.zip}` : ''}
              </p>
            </section>
          {/if}

          {#if customer.notes}
            <section>
              <h3 class="text-sm font-medium text-gray-500 mb-3">Observações</h3>
              <p class="text-gray-900 whitespace-pre-wrap">{customer.notes}</p>
            </section>
          {/if}
        </div>
      {/if}
    </Card>
  {/if}
</div>
