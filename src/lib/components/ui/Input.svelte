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
    <label for={inputId} class="text-sm font-medium text-gray-700">
      {label}
      {#if rest.required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}

  <input
    id={inputId}
    bind:value
    class="w-full px-3 py-2 rounded-md border transition-colors
           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
           disabled:bg-gray-100 disabled:cursor-not-allowed
           {error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300'}
           {className}"
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
    {...rest}
  />

  {#if error}
    <p id="{inputId}-error" class="text-sm text-red-600">{error}</p>
  {:else if hint}
    <p id="{inputId}-hint" class="text-sm text-gray-500">{hint}</p>
  {/if}
</div>
