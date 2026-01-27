<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  type Size = 'sm' | 'md' | 'lg';

  interface Props extends HTMLButtonAttributes {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    children: Snippet;
    icon?: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    children,
    icon,
    class: className = '',
    ...rest
  }: Props = $props();

  const variants: Record<Variant, string> = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
    outline:
      'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400'
  };

  const sizes: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5'
  };
</script>

<button
  class="inline-flex items-center justify-center rounded-md font-medium
         transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
         disabled:opacity-50 disabled:pointer-events-none cursor-pointer
         {variants[variant]} {sizes[size]} {className}"
  disabled={disabled || loading}
  aria-busy={loading}
  {...rest}
>
  {#if loading}
    <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
    <span class="sr-only" role="status">Carregando…</span>
  {:else if icon}
    {@render icon()}
  {/if}
  {@render children()}
</button>
