<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLInputAttributes, 'value'> {
    label?: string;
    error?: string | null;
    hint?: string;
    value?: string | number;
  }

  let {
    label,
    error,
    hint,
    id,
    value = $bindable(''),
    class: className = '',
    ...rest
  }: Props = $props();

  const inputId = id ?? `input-${crypto.randomUUID().slice(0, 8)}`;
</script>

<div class="flex flex-col gap-1.5">
  {#if label}
    <label for={inputId} class="text-sm font-medium text-[#a0a0a0] uppercase tracking-wider">
      {label}
      {#if rest.required}
        <span class="text-[#ff0080]">*</span>
      {/if}
    </label>
  {/if}

  <input
    id={inputId}
    bind:value
    class="w-full px-4 py-3 rounded-lg
           bg-[#0d0d0d] text-[#e8e8e8] placeholder-[#8a8a8a]
           border transition-all duration-200
           focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-black
           disabled:bg-[#1a1a1a] disabled:text-[#5a5a5a] disabled:cursor-not-allowed
           {error
      ? 'border-[#ff0080]/60 focus:border-[#ff0080] focus:ring-[#ff0080]/40 shadow-[0_0_10px_rgba(255,0,128,0.2)]'
      : 'border-[#2a2a2a] hover:border-[#00d4ff]/40 focus:border-[#00d4ff] focus:ring-[#00d4ff]/40 focus:shadow-[0_0_15px_rgba(0,212,255,0.2)]'}
           {className}"
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
    {...rest}
  />

  {#if error}
    <p id="{inputId}-error" class="text-sm text-[#ff0080] flex items-center gap-1">
      <span class="inline-block w-1.5 h-1.5 rounded-full bg-[#ff0080] shadow-[0_0_6px_#ff0080]"></span>
      {error}
    </p>
  {:else if hint}
    <p id="{inputId}-hint" class="text-sm text-[#5a5a5a]">{hint}</p>
  {/if}
</div>
