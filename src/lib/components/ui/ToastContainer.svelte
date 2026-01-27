<script lang="ts">
  import { fly } from 'svelte/transition';
  import { toastStore } from '$lib/stores/toast.svelte';
  import Toast from './Toast.svelte';
</script>

<div 
  class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
  aria-live="polite"
  aria-atomic="true"
  role="status"
>
  {#each toastStore.toasts as toast (toast.id)}
    <div transition:fly={{ y: 20, duration: 200 }}>
      <Toast
        id={toast.id}
        type={toast.type}
        message={toast.message}
        onDismiss={toastStore.dismiss}
      />
    </div>
  {/each}
</div>
