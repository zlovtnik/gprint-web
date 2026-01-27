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

<div class="flex flex-col items-center justify-center p-8 text-center">
  <FileQuestion class="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" aria-hidden="true" />
  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
  {#if message}
    <p class="text-gray-600 dark:text-gray-300 mb-4 max-w-md">{message}</p>
  {/if}
  {#if action}
    {@render action()}
  {/if}
</div>
