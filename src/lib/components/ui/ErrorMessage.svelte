<script lang="ts">
  import { AlertCircle } from 'lucide-svelte';
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';

  interface Props {
    title?: string;
    message?: string;
    onRetry?: () => void;
    children?: Snippet;
  }

  let { title = 'Erro', message, onRetry, children }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center p-8 text-center" role="alert">
  <AlertCircle class="h-12 w-12 text-red-500 mb-4" />
  <h3 class="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
  {#if message}
    <p class="text-gray-600 mb-4 max-w-md">{message}</p>
  {/if}
  {#if children}
    {@render children()}
  {/if}
  {#if onRetry}
    <Button variant="outline" onclick={onRetry}>
      {#snippet children()}Tentar novamente{/snippet}
    </Button>
  {/if}
</div>
