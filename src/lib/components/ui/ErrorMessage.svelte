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

<div class="flex flex-col items-center justify-center p-12 text-center" role="alert">
  <div class="p-4 rounded-2xl bg-[#ff0080]/10 border border-[#ff0080]/30 mb-5
              shadow-[0_0_20px_rgba(255,0,128,0.2)]">
    <AlertCircle class="h-10 w-10 text-[#ff0080] drop-shadow-[0_0_8px_rgba(255,0,128,0.8)]" />
  </div>
  <h3 class="text-lg font-bold text-[#ff0080] mb-2 uppercase tracking-wide">{title}</h3>
  {#if message}
    <p class="text-[#787878] mb-5 max-w-md text-sm leading-relaxed">{message}</p>
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
