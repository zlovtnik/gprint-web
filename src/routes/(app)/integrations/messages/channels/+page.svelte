<script lang="ts">
  import { channelsStore } from '$lib/stores/integrations.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import {
    MessageSquare,
    RefreshCw,
    Plus,
    Trash2
  } from 'lucide-svelte';

  let showCreateModal = $state(false);
  let newChannelName = $state('');
  let creating = $state(false);
  let drainingChannel = $state<string | null>(null);

  $effect(() => {
    channelsStore.loadChannels();
  });

  async function handleCreateChannel() {
    if (!newChannelName.trim()) return;
    creating = true;
    try {
      const result = await channelsStore.createChannel(newChannelName.trim());
      if (result) {
        showCreateModal = false;
        newChannelName = '';
      }
    } finally {
      creating = false;
    }
  }

  async function handleDrainChannel(name: string) {
    drainingChannel = name;
    try {
      await channelsStore.drainChannel(name);
    } finally {
      drainingChannel = null;
    }
  }
</script>

<svelte:head>
  <title>Canais | Mensagens | Pressly</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-[#f0f0f0] flex items-center gap-3">
        <MessageSquare class="h-7 w-7 text-[#39ff14]" />
        Canais de Mensagens
      </h1>
      <p class="text-[#787878] mt-1">
        Gerenciamento de canais de integração
      </p>
    </div>
    <div class="flex items-center gap-3">
      <Button variant="ghost" onclick={() => channelsStore.loadChannels()} disabled={channelsStore.loading}>
        <RefreshCw class="h-4 w-4 {channelsStore.loading ? 'animate-spin' : ''}" />
      </Button>
      <Button variant="primary" onclick={() => (showCreateModal = true)}>
        <Plus class="h-4 w-4 mr-2" />
        Novo Canal
      </Button>
    </div>
  </div>

  <!-- Channels Grid -->
  {#if channelsStore.loading && channelsStore.channels.length === 0}
    <div class="flex justify-center py-12">
      <Spinner size="lg" />
    </div>
  {:else if channelsStore.channels.length === 0}
    <Card class="!bg-[#0a0a0a]">
      <div class="text-center py-12">
        <MessageSquare class="h-16 w-16 mx-auto mb-4 text-[#2a2a2a]" />
        <h3 class="text-lg font-medium text-[#787878]">Nenhum canal encontrado</h3>
        <p class="text-sm text-[#5a5a5a] mt-1">
          Crie um canal para começar a receber mensagens.
        </p>
        <Button variant="primary" class="mt-4" onclick={() => (showCreateModal = true)}>
          <Plus class="h-4 w-4 mr-2" />
          Criar Canal
        </Button>
      </div>
    </Card>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each channelsStore.channels as channel}
        <Card class="!bg-[#0a0a0a] hover:border-[#39ff14]/30 transition-colors">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-semibold text-[#f0f0f0]">{channel.name}</h3>
              <p class="text-sm text-[#5a5a5a] mt-1">
                {channel.queueSize} mensagens na fila
              </p>
            </div>
            <Badge variant={channel.status === 'active' ? 'success' : 'secondary'}>
              {channel.status}
            </Badge>
          </div>

          <div class="pt-4 border-t border-[#2a2a2a] flex justify-end">
            <Button 
              variant="ghost" 
              size="sm"
              disabled={drainingChannel === channel.name || channel.queueSize === 0}
              onclick={() => handleDrainChannel(channel.name)}
            >
              {#if drainingChannel === channel.name}
                <Spinner size="sm" />
              {:else}
                <Trash2 class="h-4 w-4 text-[#ff0080]" />
              {/if}
              <span class="ml-2">Drenar</span>
            </Button>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>

<!-- Create Channel Modal -->
<Modal bind:open={showCreateModal} title="Novo Canal">
  <form onsubmit={(e) => { e.preventDefault(); handleCreateChannel(); }} class="space-y-4">
    <Input
      label="Nome do Canal"
      bind:value={newChannelName}
      placeholder="meu-canal"
      required
    />

    <div class="flex justify-end gap-3 pt-4">
      <Button variant="ghost" onclick={() => (showCreateModal = false)}>
        Cancelar
      </Button>
      <Button 
        variant="primary" 
        type="submit"
        disabled={creating || !newChannelName.trim()}
      >
        {#if creating}
          <Spinner size="sm" class="mr-2" />
        {/if}
        Criar Canal
      </Button>
    </div>
  </form>
</Modal>
