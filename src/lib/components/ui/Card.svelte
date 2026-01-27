<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    class?: string;
  }

  let { children, class: className = '' }: Props = $props();
</script>

<div class="relative rounded-xl overflow-hidden
            bg-[#0a0a0a]
            border border-[#00d4ff]/20
            shadow-[0_0_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.02)]
            {className}">
  {@render children()}
</div>
