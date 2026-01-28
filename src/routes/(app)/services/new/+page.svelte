<script lang="ts">
  import { goto } from '$app/navigation';
  import { serviceStore } from '$lib/stores/services.svelte';
  import { toastStore } from '$lib/stores/toast.svelte';
  import type { CreateServiceRequest, UpdateServiceRequest } from '$lib/types/service';
  import { Card } from '$lib/components/ui';
  import { ServiceForm } from '$lib/components/domain';
  import { ArrowLeft } from 'lucide-svelte';

  let submitting = $state(false);

  const handleSubmit = async (data: CreateServiceRequest | UpdateServiceRequest) => {
    submitting = true;
    try {
      const result = await serviceStore.create(data as CreateServiceRequest);

      if (result.ok) {
        toastStore.success('Serviço criado com sucesso!');
        goto('/services');
      } else {
        toastStore.error(result.error.message);
      }
    } catch {
      toastStore.error('Erro inesperado ao criar serviço.');
    } finally {
      submitting = false;
    }
  };

  const handleCancel = () => {
    goto('/services');
  };
</script>

<svelte:head>
  <title>Novo Serviço - Pressly</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <a
      href="/services"
      class="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
    >
      <ArrowLeft class="h-4 w-4" />
      Voltar para Serviços
    </a>
    <h1 class="text-2xl font-bold text-gray-900">Novo Serviço</h1>
    <p class="text-gray-600">Preencha os dados para cadastrar um novo serviço</p>
  </div>

  <!-- Form -->
  <Card class="p-6">
    <ServiceForm onSubmit={handleSubmit} onCancel={handleCancel} {submitting} />
  </Card>
</div>
