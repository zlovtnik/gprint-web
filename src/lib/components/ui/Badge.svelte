<script lang="ts">
  import type { Snippet } from 'svelte';

  export type Color = 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'orange' | 'purple';
  // Variant aliases for semantic naming
  export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  type Size = 'sm' | 'md';

  interface Props {
    color?: Color;
    variant?: Variant;
    size?: Size;
    children: Snippet;
  }

  let { color, variant, size = 'md', children }: Props = $props();

  // Map variant to color
  const variantToColor: Record<Variant, Color> = {
    primary: 'blue',
    secondary: 'gray',
    success: 'green',
    warning: 'yellow',
    danger: 'red',
    info: 'purple'
  };

  // Resolve the effective color: prefer explicit color, then map variant, default to gray
  const effectiveColor = $derived(color ?? (variant ? variantToColor[variant] : 'gray'));

  const colors: Record<Color, string> = {
    gray: 'bg-[#1a1a1a] text-[#a0a0a0] border border-[#2a2a2a]',
    green: 'bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/30 shadow-[0_0_8px_rgba(57,255,20,0.2)]',
    yellow: 'bg-[#ff9500]/10 text-[#ff9500] border border-[#ff9500]/30 shadow-[0_0_8px_rgba(255,149,0,0.2)]',
    red: 'bg-[#ff0080]/10 text-[#ff0080] border border-[#ff0080]/30 shadow-[0_0_8px_rgba(255,0,128,0.2)]',
    blue: 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 shadow-[0_0_8px_rgba(0,212,255,0.2)]',
    orange: 'bg-[#ff7b00]/10 text-[#ff7b00] border border-[#ff7b00]/30 shadow-[0_0_8px_rgba(255,123,0,0.2)]',
    purple: 'bg-[#8000ff]/10 text-[#8000ff] border border-[#8000ff]/30 shadow-[0_0_8px_rgba(128,0,255,0.2)]'
  };

  const sizes: Record<Size, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };

  // Ensure color is valid
  const colorClass = $derived(colors[effectiveColor] ?? colors.gray);
  const sizeClass = $derived(sizes[size] ?? sizes.md);
</script>

<span class="inline-flex items-center rounded-full font-medium {colorClass} {sizeClass}">
  {@render children()}
</span>
