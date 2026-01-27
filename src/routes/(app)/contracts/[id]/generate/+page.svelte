<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { generationApi } from '$lib/api/generation';
  import { contractsApi } from '$lib/api/contracts';
  import { toastStore } from '$lib/stores/toast.svelte';
  import type { Contract } from '$lib/types/contract';
  import type { Template } from '$lib/types/generation';
  import { Card, Spinner, ErrorMessage, Button, Select } from '$lib/components/ui';
  import { formatCurrency, formatDate } from '$lib/utils/format';
  import { ArrowLeft, FileText, Download, Printer } from 'lucide-svelte';

  let contract = $state<Contract | null>(null);
  let templates = $state<Template[]>([]);
  let selectedTemplate = $state('');
  let loading = $state(true);
  let error = $state<string | null>(null);
  let generating = $state(false);

  const contractId = $derived(Number($page.params.id));

  const templateOptions = $derived(
    templates.map((t) => ({
      value: String(t.id),
      label: t.name
    }))
  );

  // Load data on mount
  $effect(() => {
    loadData();
  });

  const loadData = async () => {
    loading = true;
    error = null;

    try {
      const [contractResult, templatesResult] = await Promise.all([
        contractsApi.get(contractId),
        generationApi.listTemplates()
      ]);

      if (contractResult.ok) {
        contract = contractResult.value;
      } else {
        error = contractResult.error.message;
        loading = false;
        return;
      }

      if (templatesResult.ok) {
        templates = templatesResult.value;
        if (templates.length > 0) {
          // Select default or first template
          const defaultTemplate = templates.find((t) => t.isDefault);
          selectedTemplate = String((defaultTemplate ?? templates[0]).id);
        }
      } else {
        error = templatesResult.error.message;
      }
    } catch (e) {
      error = 'Erro de conexão. Tente novamente.';
    }

    loading = false;
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      toastStore.error('Selecione um modelo');
      return;
    }

    generating = true;

    try {
      const result = await generationApi.generate(contractId, {
        templateId: Number(selectedTemplate)
      });

      if (result.ok) {
        toastStore.success('Contrato gerado com sucesso!');
        goto(`/contracts/${contractId}/generated`);
      } else {
        toastStore.error(result.error.message);
      }
    } catch (e) {
      toastStore.error(e instanceof Error ? e.message : 'Erro ao gerar contrato');
    } finally {
      generating = false;
    }
  };
</script>

<svelte:head>
  <title>Gerar Contrato - gprint</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <a
      href="/contracts/{contractId}"
      class="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
    >
      <ArrowLeft class="h-4 w-4" />
      Voltar para o Contrato
    </a>
    <h1 class="text-2xl font-bold text-gray-900">Gerar Documento</h1>
    <p class="text-gray-600">Gere o PDF do contrato para impressão</p>
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
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Contract preview -->
      <Card class="p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText class="h-5 w-5 text-gray-500" />
          Resumo do Contrato
        </h2>

        <dl class="space-y-3">
          <div class="flex justify-between">
            <dt class="text-gray-500">Número</dt>
            <dd class="font-medium text-gray-900">{contract.contractNumber}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">Cliente</dt>
            <dd class="text-gray-900">{contract.customer?.name}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">Período</dt>
            <dd class="text-gray-900">
              {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">Itens</dt>
            <dd class="text-gray-900">{contract.items?.length ?? 0}</dd>
          </div>
          <div class="flex justify-between pt-3 border-t">
            <dt class="text-gray-500">Valor Total</dt>
            <dd class="text-xl font-bold text-gray-900">
              {formatCurrency('BRL')(contract.totalValue)}
            </dd>
          </div>
        </dl>
      </Card>

      <!-- Generation form -->
      <Card class="p-6">
        <h2 class="text-lg font-semibold mb-4">Opções de Geração</h2>

        <div class="space-y-4">
          <Select
            label="Modelo de Documento"
            bind:value={selectedTemplate}
            options={templateOptions}
            placeholder="Selecione um modelo"
          />

          {#if templates.length > 0}
            {@const template = templates.find((t) => String(t.id) === selectedTemplate)}
            {#if template}
              <div class="p-3 bg-gray-50 rounded-lg text-sm">
                <p class="text-gray-600">{template.description ?? 'Sem descrição'}</p>
              </div>
            {/if}
          {/if}

          <div class="pt-4">
            <Button class="w-full" loading={generating} onclick={handleGenerate}>
              {#snippet icon()}<Download class="h-4 w-4" />{/snippet}
              {#snippet children()}Gerar PDF{/snippet}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  {/if}
</div>
