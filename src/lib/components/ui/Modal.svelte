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
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    onclick={handleBackdropClick}
  >
    <div
      class="bg-white rounded-lg shadow-xl w-full {sizes[size]} max-h-[90vh] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {#if title}
        <header class="flex items-center justify-between px-6 py-4 border-b">
          <h2 id="modal-title" class="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            class="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            onclick={onClose}
            aria-label="Close"
          >
            <X class="h-5 w-5" />
          </button>
        </header>
      {/if}

      <div class="flex-1 overflow-y-auto px-6 py-4">
        {@render children()}
      </div>

      {#if footer}
        <footer class="px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          {@render footer()}
        </footer>
      {/if}
    </div>
  </div>
{/if}
