<script lang="ts">
  import { goto } from '$app/navigation';
  import { customerStore } from '$lib/stores/customers.svelte';
  import { toastStore } from '$lib/stores/toast.svelte';
  import type { CreateCustomerRequest, UpdateCustomerRequest } from '$lib/types/customer';
  import { Card } from '$lib/components/ui';
  import { CustomerForm } from '$lib/components/domain';
  import { ArrowLeft } from 'lucide-svelte';

  let submitting = $state(false);

  const handleSubmit = async (data: CreateCustomerRequest | UpdateCustomerRequest) => {
    submitting = true;
    try {
      const result = await customerStore.create(data as CreateCustomerRequest);
      if (result.ok) {
        toastStore.success('Cliente criado com sucesso!');
        goto('/customers');
      } else {
        toastStore.error(result.error.message);
      }
    } catch (error) {
      toastStore.error('Erro inesperado ao criar cliente. Tente novamente.');
    } finally {
      submitting = false;
    }
  };

  const handleCancel = () => {
    goto('/customers');
  };
</script>

<svelte:head>
  <title>Novo Cliente - Pressly</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <a
      href="/customers"
      class="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
    >
      <ArrowLeft class="h-4 w-4" />
      Voltar para Clientes
    </a>
    <h1 class="text-2xl font-bold text-gray-900">Novo Cliente</h1>
    <p class="text-gray-600">Preencha os dados para cadastrar um novo cliente</p>
  </div>

  <!-- Form -->
  <Card class="p-6">
    <CustomerForm onSubmit={handleSubmit} onCancel={handleCancel} {submitting} />
  </Card>
</div>
