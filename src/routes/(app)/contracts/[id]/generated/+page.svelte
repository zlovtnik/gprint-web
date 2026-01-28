<script lang="ts">
  import { page } from '$app/stores';
  import { generationApi } from '$lib/api/generation';
  import { contractsApi } from '$lib/api/contracts';
  import { toastStore } from '$lib/stores/toast.svelte';
  import type { Contract } from '$lib/types/contract';
  import type { GeneratedContract, GenerationStatus } from '$lib/types/generation';
  import { Card, Spinner, ErrorMessage, Button, Badge, EmptyState } from '$lib/components/ui';
  import { formatDateTime } from '$lib/utils/format';
  import { ArrowLeft, FileText, Download, RefreshCw, CheckCircle, AlertCircle, Clock, FileDown } from 'lucide-svelte';
  import type { Color } from '$lib/components/ui/Badge.svelte';

  let contract = $state<Contract | null>(null);
  let generatedContracts = $state<GeneratedContract[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let downloading = $state<number | null>(null);

  const contractId = $derived(Number($page.params.id));

  const statusColors: Record<GenerationStatus, Color> = {
    PENDING: 'yellow',
    PROCESSING: 'blue',
    COMPLETED: 'green',
    FAILED: 'red'
  };

  const statusLabels: Record<GenerationStatus, string> = {
    PENDING: 'Pendente',
    PROCESSING: 'Processando',
    COMPLETED: 'Concluído',
    FAILED: 'Falhou'
  };

  const statusIcons: Record<GenerationStatus, typeof CheckCircle> = {
    PENDING: Clock,
    PROCESSING: RefreshCw,
    COMPLETED: CheckCircle,
    FAILED: AlertCircle
  };

  // Load data on mount
  $effect(() => {
    loadData();
  });

  const loadData = async () => {
    loading = true;
    error = null;

    const [contractResult, generatedResult] = await Promise.all([
      contractsApi.get(contractId),
      generationApi.listGenerated(contractId)
    ]);

    if (contractResult.ok) {
      contract = contractResult.value;
    } else {
      error = contractResult.error.message;
    }

    if (generatedResult.ok) {
      generatedContracts = generatedResult.value;
    }

    loading = false;
  };

  const handleDownload = async (generated: GeneratedContract) => {
    downloading = generated.id;

    try {
      const result = await generationApi.downloadPdf(contractId, generated.id);
      
      if (result.ok) {
        // Create download link
        const url = URL.createObjectURL(result.value);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${contract?.contractNumber ?? 'contrato'}-${generated.version}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        toastStore.error(result.error.message || 'Erro ao baixar documento');
      }
    } catch (e) {
      toastStore.error('Erro ao baixar documento');
    }

    downloading = null;
  };

  const handleVerify = async (generated: GeneratedContract) => {
    const result = await generationApi.verify(contractId, generated.id);

    if (result.ok) {
      if (result.value.valid) {
        toastStore.success('Documento válido');
      } else {
        toastStore.warning('Documento com problemas de integridade');
      }
    } else {
      toastStore.error(result.error.message);
    }
  };
</script>

<svelte:head>
  <title>Documentos Gerados - Pressly</title>
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
      <h1 class="text-2xl font-bold text-gray-900">Documentos Gerados</h1>
      <p class="text-gray-600">{contract?.contractNumber ?? ''}</p>
    </div>

    <Button variant="outline" onclick={loadData}>
      {#snippet icon()}<RefreshCw class="h-4 w-4" />{/snippet}
      {#snippet children()}Atualizar{/snippet}
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
  {:else if generatedContracts.length === 0}
    <Card class="p-8">
      <EmptyState
        title="Nenhum documento gerado"
        message="Clique em 'Gerar PDF' para criar o primeiro documento"
      >
        {#snippet action()}
          <Button onclick={() => window.location.href = `/contracts/${contractId}/generate`}>
            {#snippet icon()}<FileDown class="h-4 w-4" />{/snippet}
            {#snippet children()}Gerar PDF{/snippet}
          </Button>
        {/snippet}
      </EmptyState>
    </Card>
  {:else}
    <div class="space-y-4">
      {#each generatedContracts as generated (generated.id)}
        {@const StatusIcon = statusIcons[generated.status]}
        <Card class="p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="p-2 rounded-lg bg-gray-100">
                <FileText class="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-gray-900">
                    Versão {generated.version}
                  </h3>
                  <Badge color={statusColors[generated.status]}>
                    {#snippet children()}
                      <span class="flex items-center gap-1">
                        <StatusIcon class="h-3 w-3" />
                        {statusLabels[generated.status]}
                      </span>
                    {/snippet}
                  </Badge>
                </div>
                <p class="text-sm text-gray-500">
                  Gerado em {formatDateTime(generated.generatedAt)}
                </p>
                {#if generated.templateId}
                  <p class="text-sm text-gray-400">Template ID: {generated.templateId}</p>
                {/if}
              </div>
            </div>

            {#if generated.status === 'COMPLETED'}
              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onclick={() => handleVerify(generated)}
                >
                  {#snippet icon()}<CheckCircle class="h-4 w-4" />{/snippet}
                  {#snippet children()}Verificar{/snippet}
                </Button>
                <Button
                  size="sm"
                  loading={downloading === generated.id}
                  onclick={() => handleDownload(generated)}
                >
                  {#snippet icon()}<Download class="h-4 w-4" />{/snippet}
                  {#snippet children()}Baixar PDF{/snippet}
                </Button>
              </div>
            {:else if generated.status === 'FAILED'}
              <span class="text-sm text-red-500">Erro na geração</span>
            {:else}
              <Spinner />
            {/if}
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>
