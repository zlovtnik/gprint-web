<script lang="ts">
  import { page } from '$app/stores';
  import { printJobsApi } from '$lib/api/print-jobs';
  import { toastStore } from '$lib/stores/toast.svelte';
  import type { PrintJob, PrintJobStatus } from '$lib/types/print-job';
  import { Card, Spinner, ErrorMessage, Button, Badge } from '$lib/components/ui';
  import type { Color } from '$lib/components/ui/Badge.svelte';
  import { formatDateTime } from '$lib/utils/format';
  import { ArrowLeft, Printer, FileText, X, RotateCcw, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-svelte';

  let printJob = $state<PrintJob | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  const jobId = $derived(Number($page.params.id));

  const statusColors: Record<PrintJobStatus, Color> = {
    QUEUED: 'yellow',
    PRINTING: 'blue',
    COMPLETED: 'green',
    FAILED: 'red',
    CANCELLED: 'gray'
  };

  const statusLabels: Record<PrintJobStatus, string> = {
    QUEUED: 'Na Fila',
    PRINTING: 'Imprimindo',
    COMPLETED: 'Concluído',
    FAILED: 'Falhou',
    CANCELLED: 'Cancelado'
  };

  const statusIcons: Record<PrintJobStatus, typeof Clock> = {
    QUEUED: Clock,
    PRINTING: Loader2,
    COMPLETED: CheckCircle,
    FAILED: AlertCircle,
    CANCELLED: X
  };

  // Load data on mount
  $effect(() => {
    loadPrintJob();
  });

  const loadPrintJob = async () => {
    loading = true;
    error = null;

    const result = await printJobsApi.get(jobId);

    if (result.ok) {
      printJob = result.value;
    } else {
      error = result.error.message;
    }

    loading = false;
  };

  const handleCancel = async () => {
    const result = await printJobsApi.cancel(jobId);

    if (result.ok) {
      toastStore.success('Trabalho de impressão cancelado');
      loadPrintJob();
    } else {
      toastStore.error(result.error.message);
    }
  };

  const handleRetry = async () => {
    const result = await printJobsApi.retry(jobId);

    if (result.ok) {
      toastStore.success('Trabalho de impressão reenviado');
      loadPrintJob();
    } else {
      toastStore.error(result.error.message);
    }
  };
</script>

<svelte:head>
  <title>Trabalho de Impressão - Pressly</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-start justify-between">
    <div>
      <a
        href="/print-jobs"
        class="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
      >
        <ArrowLeft class="h-4 w-4" />
        Voltar para Fila de Impressão
      </a>
      <h1 class="text-2xl font-bold text-gray-900">Trabalho de Impressão #{jobId}</h1>
    </div>

    {#if printJob}
      <div class="flex items-center gap-2">
        {#if printJob.status === 'QUEUED'}
          <Button variant="outline" onclick={handleCancel}>
            {#snippet icon()}<X class="h-4 w-4" />{/snippet}
            {#snippet children()}Cancelar{/snippet}
          </Button>
        {/if}
        {#if printJob.status === 'FAILED'}
          <Button variant="outline" onclick={handleRetry}>
            {#snippet icon()}<RotateCcw class="h-4 w-4" />{/snippet}
            {#snippet children()}Reenviar{/snippet}
          </Button>
        {/if}
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
      <ErrorMessage message={error} onRetry={loadPrintJob} />
    </Card>
  {:else if printJob}
    {@const StatusIcon = statusIcons[printJob.status]}
    {@const status = printJob.status}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Status card -->
      <Card class="p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <Printer class="h-5 w-5 text-gray-500" />
          Status
        </h2>

        <div class="flex items-center gap-4 mb-6">
          <div class="p-4 rounded-full bg-gray-100">
            <StatusIcon class="h-8 w-8 text-gray-600 {status === 'PRINTING' ? 'animate-spin' : ''}" />
          </div>
          <div>
            <Badge color={statusColors[status]}>
              {#snippet children()}{statusLabels[status]}{/snippet}
            </Badge>
          </div>
        </div>

        <dl class="space-y-3">
          <div class="flex justify-between">
            <dt class="text-gray-500">Criado em</dt>
            <dd class="text-gray-900">{formatDateTime(printJob.createdAt)}</dd>
          </div>
          {#if printJob.printedAt}
            <div class="flex justify-between">
              <dt class="text-gray-500">Impresso em</dt>
              <dd class="text-gray-900">{formatDateTime(printJob.printedAt)}</dd>
            </div>
          {/if}
          <div class="flex justify-between">
            <dt class="text-gray-500">Cópias</dt>
            <dd class="text-gray-900">{printJob.copies}</dd>
          </div>
        </dl>

        {#if printJob.status === 'FAILED' && printJob.errorMessage}
          <div class="mt-4 p-3 bg-red-50 rounded-lg">
            <p class="text-sm font-medium text-red-800">Erro:</p>
            <p class="text-sm text-red-600">{printJob.errorMessage}</p>
          </div>
        {/if}
      </Card>

      <!-- Printer info -->
      <Card class="p-6">
        <h2 class="text-lg font-semibold mb-4">Impressora</h2>

        {#if printJob.printer}
          <dl class="space-y-3">
            <div class="flex justify-between">
              <dt class="text-gray-500">Nome</dt>
              <dd class="text-gray-900">{printJob.printer.name}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Localização</dt>
              <dd class="text-gray-900">{printJob.printer.location ?? '—'}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Modelo</dt>
              <dd class="text-gray-900">{printJob.printer.model ?? '—'}</dd>
            </div>
          </dl>
        {:else}
          <p class="text-gray-500">Impressora não especificada</p>
        {/if}
      </Card>

      <!-- Contract info -->
      {#if printJob.generatedContract?.contract}
        <Card class="p-6 lg:col-span-2">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText class="h-5 w-5 text-gray-500" />
            Contrato
          </h2>

          <dl class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <dt class="text-sm text-gray-500">Número</dt>
              <dd class="text-gray-900">
                <a
                  href="/contracts/{printJob.generatedContract.contract.id}"
                  class="text-brand-600 hover:underline"
                >
                  {printJob.generatedContract.contract.contractNumber}
                </a>
              </dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Cliente</dt>
              <dd class="text-gray-900">
                {printJob.generatedContract.contract.customer?.name ?? '—'}
              </dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Versão do Documento</dt>
              <dd class="text-gray-900">{printJob.generatedContract.version}</dd>
            </div>
            <div>
              <dt class="text-sm text-gray-500">Gerado em</dt>
              <dd class="text-gray-900">
                {formatDateTime(printJob.generatedContract.generatedAt)}
              </dd>
            </div>
          </dl>
        </Card>
      {/if}
    </div>
  {/if}
</div>
