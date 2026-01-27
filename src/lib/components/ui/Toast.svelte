<script lang="ts">
  import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-svelte';
  import type { ToastType } from '$lib/stores/toast.svelte';

  interface Props {
    id: string;
    type: ToastType;
    message: string;
    onDismiss: (id: string) => void;
  }

  let { id, type, message, onDismiss }: Props = $props();

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  const Icon = icons[type];
</script>

<div
  class="flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right {colors[type]}"
  role="alert"
>
  <Icon class="h-5 w-5 flex-shrink-0 {iconColors[type]}" />
  <p class="flex-1 text-sm font-medium">{message}</p>
  <button
    type="button"
    class="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
    onclick={() => onDismiss(id)}
    aria-label="Dismiss notification"
  >
    <X class="h-4 w-4" />
  </button>
</div>
