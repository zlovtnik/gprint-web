<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLTextareaAttributes, 'value'> {
    label?: string;
    error?: string | null;
    hint?: string;
    value?: string;
  }

  let { label, error, hint, id, value = $bindable(''), class: className = '', ...rest }: Props = $props();

  const textareaId = id ?? `textarea-${crypto.randomUUID().slice(0, 8)}`;
</script>

<div class="flex flex-col gap-1.5">
  {#if label}
    <label for={textareaId} class="text-sm font-medium text-gray-700">
      {label}
      {#if rest.required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}

  <textarea
    id={textareaId}
    bind:value
    class="w-full px-3 py-2 rounded-md border transition-colors resize-y min-h-[80px]
           focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
           disabled:bg-gray-100 disabled:cursor-not-allowed
           {error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300'}
           {className}"
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
    {...rest}
  ></textarea>

  {#if error}
    <p id="{textareaId}-error" class="text-sm text-red-600">{error}</p>
  {:else if hint}
    <p id="{textareaId}-hint" class="text-sm text-gray-500">{hint}</p>
  {/if}
</div>
