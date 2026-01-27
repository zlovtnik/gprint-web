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
    success: `bg-[#0a0a0a] 
              border-l-4 border-l-[#39ff14] border-y border-r border-[#1a1a1a] 
              shadow-[0_0_20px_rgba(57,255,20,0.15)]`,
    error: `bg-[#0a0a0a] 
            border-l-4 border-l-[#ff0080] border-y border-r border-[#1a1a1a] 
            shadow-[0_0_20px_rgba(255,0,128,0.15)]`,
    warning: `bg-[#0a0a0a] 
              border-l-4 border-l-[#ff9500] border-y border-r border-[#1a1a1a] 
              shadow-[0_0_20px_rgba(255,149,0,0.15)]`,
    info: `bg-[#0a0a0a] 
           border-l-4 border-l-[#00d4ff] border-y border-r border-[#1a1a1a] 
           shadow-[0_0_20px_rgba(0,212,255,0.15)]`
  };

  const iconColors = {
    success: 'text-[#39ff14]',
    error: 'text-[#ff0080]',
    warning: 'text-[#ff9500]',
    info: 'text-[#00d4ff]'
  };

  const Icon = icons[type];
</script>

<div
  class="flex items-start gap-3 p-4 rounded-lg backdrop-blur-xl 
         animate-in slide-in-from-right text-[#e8e8e8] {colors[type]}"
  role="alert"
>
  <Icon class="h-5 w-5 flex-shrink-0 mt-0.5 {iconColors[type]}" />
  <p class="flex-1 text-sm font-medium">{message}</p>
  <button
    type="button"
    class="flex-shrink-0 p-1 rounded-md text-[#5a5a5a] 
           hover:text-[#e8e8e8] hover:bg-[#1a1a1a] 
           transition-all duration-200"
    onclick={() => onDismiss(id)}
    aria-label="Dismiss notification"
  >
    <X class="h-4 w-4" />
  </button>
</div>
