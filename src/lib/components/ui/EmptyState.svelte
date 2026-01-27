<script lang="ts">
  import type { Snippet } from 'svelte';
  import { FileQuestion } from 'lucide-svelte';

  interface Props {
    title?: string;
    message?: string;
    action?: Snippet;
  }

  let { title = 'Nenhum resultado', message, action }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center p-12 text-center">
  <div class="p-4 rounded-2xl bg-[#0d0d0d] border border-[#2a2a2a] mb-5">
    <FileQuestion class="h-10 w-10 text-[#5a5a5a]" aria-hidden="true" />
  </div>
  <h3 class="text-lg font-bold text-[#c4c4c4] mb-2 uppercase tracking-wide">{title}</h3>
  {#if message}
    <p class="text-[#5a5a5a] mb-5 max-w-md text-sm leading-relaxed">{message}</p>
  {/if}
  {#if action}
    {@render action()}
  {/if}
</div>
