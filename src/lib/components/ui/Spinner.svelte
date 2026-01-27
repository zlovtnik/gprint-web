<script lang="ts">
  interface Props {
    class?: string;
    label?: string;
  }

  let { class: className = '', label = 'Carregando...' }: Props = $props();
</script>

<div class="flex items-center justify-center p-8 {className}" role="status" aria-live="polite">
  <div class="flex flex-col items-center gap-4 text-[#8a8a8a]">
    <div class="relative">
      <svg class="animate-spin h-10 w-10 text-[#00d4ff] relative z-10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle
          class="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="3"
        />
        <path
          class="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <div class="absolute inset-0 blur-xl bg-[#00d4ff]/40 rounded-full z-[-1]"></div>
    </div>
    <span class="text-sm uppercase tracking-wider">{label}</span>
  </div>
</div>
