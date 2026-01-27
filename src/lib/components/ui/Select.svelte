<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements';

  interface Option {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props extends Omit<HTMLSelectAttributes, 'value'> {
    label?: string;
    error?: string | null;
    hint?: string;
    options: Option[];
    placeholder?: string;
    value?: string;
  }

  let {
    label,
    error,
    hint,
    options,
    placeholder,
    id,
    value = $bindable(''),
    class: className = '',
    ...rest
  }: Props = $props();

  const selectId = id ?? (() => {
    if (typeof window === 'undefined') {
      console.warn('Select: id prop should be provided for SSR compatibility');
    }
    return `select-${crypto.randomUUID().slice(0, 8)}`;
  })();
</script>

<div class="flex flex-col gap-1.5">
  {#if label}
    <label for={selectId} class="text-sm font-medium text-[#a0a0a0] uppercase tracking-wider">
      {label}
      {#if rest.required}
        <span class="text-[#ff0080]">*</span>
      {/if}
    </label>
  {/if}

  <select
    id={selectId}
    bind:value
    class="w-full px-4 py-3 rounded-lg
           bg-[#0d0d0d] text-[#e8e8e8]
           border transition-all duration-200 appearance-none
           bg-no-repeat bg-right pr-10 select-chevron
           focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-black
           disabled:bg-[#1a1a1a] disabled:text-[#5a5a5a] disabled:cursor-not-allowed
           {error
      ? 'border-[#ff0080]/60 focus:border-[#ff0080] focus:ring-[#ff0080]/40'
      : 'border-[#2a2a2a] hover:border-[#00d4ff]/40 focus:border-[#00d4ff] focus:ring-[#00d4ff]/40 focus:shadow-[0_0_15px_rgba(0,212,255,0.2)]'}
           {className}"
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
    {...rest}
  >
    {#if placeholder}
      <option value="" disabled class="bg-[#0d0d0d] text-[#5a5a5a]">{placeholder}</option>
    {/if}
    {#each options as option}
      <option value={option.value} disabled={option.disabled} class="bg-[#0d0d0d] text-[#e8e8e8]">
        {option.label}
      </option>
    {/each}
  </select>

  {#if error}
    <p id="{selectId}-error" class="text-sm text-[#ff0080] flex items-center gap-1">
      <span class="inline-block w-1.5 h-1.5 rounded-full bg-[#ff0080] shadow-[0_0_6px_#ff0080]"></span>
      {error}
    </p>
  {:else if hint}
    <p id="{selectId}-hint" class="text-sm text-void-500">{hint}</p>
  {/if}
</div>
