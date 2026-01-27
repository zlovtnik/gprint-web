<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    class?: string;
  }

  let { children, class: className = '' }: Props = $props();
</script>

<div class="bg-white rounded-lg border border-gray-200 shadow-sm {className}">
  {@render children()}
</div>
