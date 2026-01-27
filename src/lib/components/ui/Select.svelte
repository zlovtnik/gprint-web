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
    <label for={selectId} class="text-sm font-medium text-gray-700">
      {label}
      {#if rest.required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}

  <select
    id={selectId}
    bind:value
    class="w-full px-3 py-2 rounded-md border transition-colors appearance-none
           bg-white bg-no-repeat bg-right pr-10 select-chevron
           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
           disabled:bg-gray-100 disabled:cursor-not-allowed
           {error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300'}
           {className}"
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
    {...rest}
  >
    {#if placeholder}
      <option value="" disabled>{placeholder}</option>
    {/if}
    {#each options as option}
      <option value={option.value} disabled={option.disabled}>
        {option.label}
      </option>
    {/each}
  </select>

  {#if error}
    <p id="{selectId}-error" class="text-sm text-red-600">{error}</p>
  {:else if hint}
    <p id="{selectId}-hint" class="text-sm text-gray-500">{hint}</p>
  {/if}
</div>
