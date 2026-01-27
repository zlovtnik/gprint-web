<script lang="ts">
  import type { Snippet } from 'svelte';
  import { X } from 'lucide-svelte';

  interface Props {
    open: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    onClose: () => void;
    children: Snippet;
    footer?: Snippet;
  }

  let { open = $bindable(), title, size = 'md', onClose, children, footer }: Props = $props();

  const sizes: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (open && e.key === 'Escape') {
      onClose();
    }
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4
           bg-black/90 backdrop-blur-md"
    onclick={handleBackdropClick}
  >
    <div
      class="relative w-full {sizes[size]} max-h-[90vh] flex flex-col
             rounded-2xl overflow-hidden
             bg-[#0a0a0a]
             border border-[#00d4ff]/30
             shadow-[0_0_60px_rgba(0,212,255,0.15)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {#if title}
        <header class="flex items-center justify-between px-6 py-4 
                       border-b border-[#1a1a1a]">
          <h2 id="modal-title" class="text-lg font-bold text-[#00d4ff] tracking-wide">{title}</h2>
          <button
            type="button"
            class="p-1.5 text-[#5a5a5a] hover:text-[#ff0080] 
                   rounded-lg hover:bg-[#1a1a1a] 
                   transition-all duration-200"
            onclick={onClose}
            aria-label="Close"
          >
            <X class="h-5 w-5" />
          </button>
        </header>
      {/if}

      <div class="flex-1 overflow-y-auto px-6 py-5 text-[#c4c4c4]">
        {@render children()}
      </div>

      {#if footer}
        <footer class="px-6 py-4 border-t border-[#1a1a1a] bg-[#050505]">
          {@render footer()}
        </footer>
      {/if}
    </div>
  </div>
{/if}
