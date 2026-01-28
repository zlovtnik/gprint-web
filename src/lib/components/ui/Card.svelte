<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { MouseEventHandler, KeyboardEventHandler } from 'svelte/elements';

  interface Props {
    children: Snippet;
    class?: string;
    onclick?: MouseEventHandler<HTMLDivElement>;
  }

  let { children, class: className = '', onclick }: Props = $props();

  // Handle keyboard activation for interactive cards
  const handleKeydown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (onclick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onclick(e as unknown as MouseEvent & { currentTarget: HTMLDivElement });
    }
  };
</script>

{#if onclick}
  <div 
    class="relative rounded-xl overflow-hidden
              bg-[#0a0a0a]
              border border-[#00d4ff]/20
              shadow-[0_0_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.02)]
              focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50
              {className}"
    role="button"
    tabindex="0"
    {onclick}
    onkeydown={handleKeydown}
  >
    {@render children()}
  </div>
{:else}
  <div 
    class="relative rounded-xl overflow-hidden
              bg-[#0a0a0a]
              border border-[#00d4ff]/20
              shadow-[0_0_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.02)]
              {className}"
  >
    {@render children()}
  </div>
{/if}
