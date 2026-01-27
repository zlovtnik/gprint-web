<script lang="ts">
  import { goto } from '$app/navigation';
  import { contractStore } from '$lib/stores/contracts.svelte';
  import { toastStore } from '$lib/stores/toast.svelte';
  import type { CreateContractRequest, UpdateContractRequest } from '$lib/types/contract';
  import { Card } from '$lib/components/ui';
  import { ContractForm } from '$lib/components/domain';
  import { ArrowLeft } from 'lucide-svelte';

  let submitting = $state(false);

  const handleSubmit = async (data: CreateContractRequest | UpdateContractRequest) => {
    submitting = true;
    const result = await contractStore.create(data as CreateContractRequest);
    submitting = false;

    if (result.ok) {
      toastStore.success('Contrato criado com sucesso!');
      goto(`/contracts/${result.value.id}`);
    } else {
      toastStore.error(result.error.message);
    }
  };

  const handleCancel = () => {
    goto('/contracts');
  };
</script>

<svelte:head>
  <title>Novo Contrato - gprint</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <a
      href="/contracts"
      class="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
    >
      <ArrowLeft class="h-4 w-4" />
      Voltar para Contratos
    </a>
    <h1 class="text-2xl font-bold text-gray-900">Novo Contrato</h1>
    <p class="text-gray-600">Preencha os dados para criar um novo contrato</p>
  </div>

  <!-- Form -->
  <Card class="p-6">
    <ContractForm onSubmit={handleSubmit} onCancel={handleCancel} {submitting} />
  </Card>
</div>
