<script lang="ts">
  import type { Snippet } from 'svelte';

  export type Color = 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'orange' | 'purple';
  type Size = 'sm' | 'md';

  interface Props {
    color?: Color;
    size?: Size;
    children: Snippet;
  }

  let { color = 'gray', size = 'md', children }: Props = $props();

  const colors: Record<Color, string> = {
    gray: 'bg-gray-100 text-gray-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    orange: 'bg-orange-100 text-orange-800',
    purple: 'bg-purple-100 text-purple-800'
  };

  const sizes: Record<Size, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };

  // Ensure color is valid
  const colorClass = $derived(colors[color as Color] ?? colors.gray);
  const sizeClass = $derived(sizes[size] ?? sizes.md);
</script>

<span class="inline-flex items-center rounded-full font-medium {colorClass} {sizeClass}">
  {@render children()}
</span>
