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
    primary: `bg-[#00d4ff] text-black font-bold
              hover:bg-[#00ffff] hover:shadow-[0_0_20px_#00d4ff,0_0_40px_rgba(0,212,255,0.4)]
              border border-[#00d4ff]/50`,
    secondary: `bg-[#8000ff] text-white font-bold
                hover:bg-[#9933ff] hover:shadow-[0_0_20px_#8000ff,0_0_40px_rgba(128,0,255,0.4)]
                border border-[#8000ff]/50`,
    danger: `bg-[#ff0080] text-white font-bold
             hover:bg-[#ff33aa] hover:shadow-[0_0_20px_#ff0080,0_0_40px_rgba(255,0,128,0.4)]
             border border-[#ff0080]/50`,
    ghost: `bg-transparent text-[#a0a0a0]
            hover:text-[#00d4ff] hover:bg-[#1a1a1a]
            border border-transparent`,
    outline: `bg-transparent text-[#00d4ff]
              border border-[#00d4ff]/50
              hover:bg-[#00d4ff]/10 hover:shadow-[0_0_15px_rgba(0,212,255,0.3)]`
  };

  const sizes: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5'
  };
</script>

<button
  class="inline-flex items-center justify-center rounded-lg font-medium uppercase tracking-wider
         transition-all duration-200 ease-out
         focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/60 focus:ring-offset-2 focus:ring-offset-black
         disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none cursor-pointer
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
