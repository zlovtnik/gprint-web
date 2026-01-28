<script lang="ts">
  import { messagesStore } from '$lib/stores/integrations.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import {
    AlertTriangle,
    RefreshCw,
    RotateCcw,
    Trash2,
    Clock,
    AlertCircle
  } from 'lucide-svelte';

  let retryingId = $state<number | null>(null);
  let deletingId = $state<number | null>(null);

  $effect(() => {
    messagesStore.loadDeadLetterMessages();
  });

  async function handleRetry(id: number) {
    retryingId = id;
    try {
      await messagesStore.retryDeadLetter(id);
    } finally {
      retryingId = null;
    }
  }

  async function handleDelete(id: number) {
    deletingId = id;
    try {
      await messagesStore.deleteDeadLetter(id);
    } finally {
      deletingId = null;
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('pt-BR');
  }
</script>

<svelte:head>
  <title>Dead Letter Queue | Mensagens | Pressly</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-[#f0f0f0] flex items-center gap-3">
        <AlertTriangle class="h-7 w-7 text-[#ff0080]" />
        Dead Letter Queue
      </h1>
      <p class="text-[#787878] mt-1">
        Mensagens que falharam no processamento
      </p>
    </div>
    <Button variant="ghost" onclick={() => messagesStore.loadDeadLetterMessages()} disabled={messagesStore.loading}>
      <RefreshCw class="h-4 w-4 {messagesStore.loading ? 'animate-spin' : ''}" />
    </Button>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card class="!bg-[#0a0a0a] border-[#ff0080]/20">
      <div class="flex items-center gap-4">
        <div class="p-3 rounded-lg bg-[#ff0080]/10">
          <AlertCircle class="h-6 w-6 text-[#ff0080]" />
        </div>
        <div>
          <p class="text-sm text-[#787878]">Total na Fila</p>
          <p class="text-2xl font-bold text-[#f0f0f0]">
            {messagesStore.deadLetterMessages.length}
          </p>
        </div>
      </div>
    </Card>
  </div>

  <!-- Messages List -->
  <Card class="!bg-[#0a0a0a]">
    {#if messagesStore.loading && messagesStore.deadLetterMessages.length === 0}
      <div class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    {:else if messagesStore.deadLetterMessages.length === 0}
      <div class="text-center py-12">
        <AlertTriangle class="h-16 w-16 mx-auto mb-4 text-[#39ff14]" />
        <h3 class="text-lg font-medium text-[#787878]">Nenhuma mensagem na DLQ</h3>
        <p class="text-sm text-[#5a5a5a] mt-1">
          Ótimo! Todas as mensagens foram processadas com sucesso.
        </p>
      </div>
    {:else}
      <div class="space-y-3 p-4">
        {#each messagesStore.deadLetterMessages as msg}
          <div 
            class="p-4 rounded-lg bg-[#111111] border border-[#ff0080]/20 
                   hover:border-[#ff0080]/40 transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3">
                  <span class="font-mono text-sm text-[#c4c4c4]">
                    {msg.originalMessageId}
                  </span>
                  <Badge variant="danger">
                    {msg.retryCount} retries
                  </Badge>
                </div>
                
                <p class="mt-2 text-sm text-[#ff0080]">
                  {msg.failureReason}
                </p>

                <div class="mt-2 flex items-center gap-2 text-xs text-[#5a5a5a]">
                  <Clock class="h-3 w-3" />
                  <span>Movida em: {formatDate(msg.movedAt)}</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={retryingId === msg.id}
                  onclick={() => handleRetry(msg.id)}
                >
                  {#if retryingId === msg.id}
                    <Spinner size="sm" />
                  {:else}
                    <RotateCcw class="h-4 w-4 text-[#00d4ff]" />
                  {/if}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={deletingId === msg.id}
                  onclick={() => handleDelete(msg.id)}
                >
                  {#if deletingId === msg.id}
                    <Spinner size="sm" />
                  {:else}
                    <Trash2 class="h-4 w-4 text-[#ff0080]" />
                  {/if}
                </Button>
              </div>
            </div>

            {#if msg.messagePayload}
              <details class="mt-3">
                <summary class="text-xs text-[#787878] cursor-pointer hover:text-[#c4c4c4]">
                  Ver payload
                </summary>
                <pre class="mt-2 p-3 rounded bg-[#0a0a0a] text-xs text-[#c4c4c4] overflow-x-auto">
{msg.messagePayload}
                </pre>
              </details>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </Card>
</div>
