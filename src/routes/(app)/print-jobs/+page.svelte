<script lang="ts">
  import { printJobsApi } from '$lib/api/print-jobs';
  import { toastStore } from '$lib/stores/toast.svelte';
  import type { PrintJob, PrintJobStatus } from '$lib/types/print-job';
  import {
    Button,
    Card,
    Select,
    Pagination,
    Modal,
    Spinner,
    EmptyState,
    ErrorMessage,
    Badge
  } from '$lib/components/ui';
  import type { Color } from '$lib/components/ui/Badge.svelte';
  import { formatDateTime } from '$lib/utils/format';
  import { Printer, RefreshCw, X, RotateCcw, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-svelte';

  let printJobs = $state<PrintJob[]>([]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let page = $state(1);
  let pageSize = $state(10);
  let totalCount = $state(0);
  let totalPages = $state(1);
  let statusFilter = $state('');

  // Cancel modal
  let cancelModalOpen = $state(false);
  let jobToCancel = $state<PrintJob | null>(null);
  let cancelling = $state(false);
  let retryingId = $state<number | null>(null);

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

  const statusOptions = $derived(
    [{ value: '', label: 'Todos os status' }].concat(
      Object.entries(statusLabels).map(([value, label]) => ({ value, label }))
    )
  );

  const statusIcons: Record<PrintJobStatus, typeof Clock> = {
    QUEUED: Clock,
    PRINTING: Loader2,
    COMPLETED: CheckCircle,
    FAILED: AlertCircle,
    CANCELLED: X
  };

  // Load data on mount and when filters change
  // Reactive dependencies: page, pageSize, statusFilter trigger reload
  $effect(() => {
    // Track dependencies to trigger reload
    void page;
    void pageSize;
    void statusFilter;
    loadPrintJobs();
  });

  const loadPrintJobs = async () => {
    isLoading = true;
    error = null;

    try {
      const result = await printJobsApi.list({
        page,
        pageSize,
        status: (statusFilter as PrintJobStatus) || undefined
      });

      if (result.ok) {
        printJobs = result.value.data;
        totalCount = result.value.totalCount;
        totalPages = result.value.totalPages;
      } else {
        error = result.error.message;
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Erro de conexão. Tente novamente.';
    } finally {
      isLoading = false;
    }
  };

  const handleStatusChange = () => {
    page = 1;
    // The $effect will automatically trigger loadPrintJobs due to reactive dependencies
  };

  const handleCancel = (job: PrintJob) => {
    jobToCancel = job;
    cancelModalOpen = true;
  };

  const confirmCancel = async () => {
    if (!jobToCancel) return;

    cancelling = true;
    const result = await printJobsApi.cancel(jobToCancel.id);
    cancelling = false;

    if (result.ok) {
      toastStore.success('Trabalho de impressão cancelado');
      cancelModalOpen = false;
      jobToCancel = null;
      loadPrintJobs();
    } else {
      toastStore.error(result.error.message);
    }
  };

  const handleRetry = async (job: PrintJob) => {
    // Prevent duplicate calls
    if (retryingId === job.id) return;
    
    retryingId = job.id;
    
    try {
      const result = await printJobsApi.retry(job.id);

      if (result.ok) {
        toastStore.success('Trabalho de impressão reenviado');
        loadPrintJobs();
      } else {
        toastStore.error(result.error.message);
      }
    } catch (e) {
      toastStore.error(e instanceof Error ? e.message : 'Erro ao reenviar trabalho');
    } finally {
      retryingId = null;
    }
  };
</script>

<svelte:head>
  <title>Fila de Impressão - Pressly</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Fila de Impressão</h1>
      <p class="text-gray-600">Gerencie os trabalhos de impressão</p>
    </div>

    <Button variant="outline" onclick={loadPrintJobs} disabled={isLoading}>
      {#snippet icon()}<RefreshCw class="h-4 w-4" />{/snippet}
      {#snippet children()}Atualizar{/snippet}
    </Button>
  </div>

  <!-- Filters -->
  <Card class="p-4">
    <div class="flex items-center gap-4">
      <div class="w-48">
        <Select
          bind:value={statusFilter}
          options={statusOptions}
          onchange={handleStatusChange}
        />
      </div>
    </div>
  </Card>

  <!-- Content -->
  {#if isLoading}
    <Spinner />
  {:else if error}
    <ErrorMessage message={error} onRetry={loadPrintJobs} />
  {:else if printJobs.length === 0}
    <Card class="p-8">
      <EmptyState
        title="Nenhum trabalho de impressão"
        message={statusFilter
          ? 'Nenhum trabalho corresponde ao filtro'
          : 'A fila de impressão está vazia'}
      />
    </Card>
  {:else}
    <!-- Print Jobs list -->
    <div class="space-y-4">
      {#each printJobs as job (job.id)}
        {@const StatusIcon = statusIcons[job.status]}
        <Card class="p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="p-3 rounded-lg bg-gray-100">
                <Printer class="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-gray-900">
                    {job.generatedContract?.contract?.contractNumber ?? `Trabalho #${job.id}`}
                  </h3>
                  <Badge color={statusColors[job.status]}>
                    {#snippet children()}
                      <span class="flex items-center gap-1">
                        <StatusIcon class="h-3 w-3 {job.status === 'PRINTING' ? 'animate-spin' : ''}" />
                        {statusLabels[job.status]}
                      </span>
                    {/snippet}
                  </Badge>
                </div>
                <div class="text-sm text-gray-500 space-y-1 mt-1">
                  <p>Enviado em: {formatDateTime(job.createdAt)}</p>
                  {#if job.printer}
                    <p class="flex items-center gap-1">
                      <Printer class="h-3 w-3" />
                      {job.printer.name}
                    </p>
                  {/if}
                  {#if job.printedAt}
                    <p>Impresso em: {formatDateTime(job.printedAt)}</p>
                  {/if}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              {#if job.status === 'QUEUED'}
                <Button variant="outline" size="sm" onclick={() => handleCancel(job)}>
                  {#snippet icon()}<X class="h-4 w-4" />{/snippet}
                  {#snippet children()}Cancelar{/snippet}
                </Button>
              {/if}
              {#if job.status === 'FAILED'}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onclick={() => handleRetry(job)}
                  disabled={retryingId === job.id}
                  loading={retryingId === job.id}
                >
                  {#snippet icon()}<RotateCcw class="h-4 w-4" />{/snippet}
                  {#snippet children()}Reenviar{/snippet}
                </Button>
              {/if}
            </div>
          </div>

          {#if job.status === 'FAILED' && job.errorMessage}
            <div class="mt-3 p-2 bg-red-50 rounded text-sm text-red-600">
              {job.errorMessage}
            </div>
          {/if}
        </Card>
      {/each}
    </div>

    <!-- Pagination -->
    <Card>
      <Pagination
        {page}
        {pageSize}
        {totalCount}
        {totalPages}
        onPageChange={(p) => {
          page = p;
          loadPrintJobs();
        }}
        onPageSizeChange={(ps) => {
          pageSize = ps;
          page = 1;
          loadPrintJobs();
        }}
      />
    </Card>
  {/if}
</div>

<!-- Cancel confirmation modal -->
<Modal
  bind:open={cancelModalOpen}
  title="Cancelar Impressão"
  size="sm"
  onClose={() => (cancelModalOpen = false)}
>
  <p class="text-gray-600">
    Tem certeza que deseja cancelar este trabalho de impressão?
  </p>

  {#snippet footer()}
    <div class="flex justify-end gap-3">
      <Button variant="outline" onclick={() => (cancelModalOpen = false)}>
        {#snippet children()}Voltar{/snippet}
      </Button>
      <Button variant="danger" loading={cancelling} onclick={confirmCancel}>
        {#snippet children()}Cancelar Impressão{/snippet}
      </Button>
    </div>
  {/snippet}
</Modal>
