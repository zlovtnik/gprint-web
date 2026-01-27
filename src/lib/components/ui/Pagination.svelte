<script lang="ts">
  import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-svelte';
  import Button from './Button.svelte';

  interface Props {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: number[];
  }

  let {
    page,
    pageSize,
    totalCount,
    totalPages,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100]
  }: Props = $props();

  const startItem = $derived((page - 1) * pageSize + 1);
  const endItem = $derived(Math.min(page * pageSize, totalCount));

  const canGoPrevious = $derived(page > 1);
  const canGoNext = $derived(page < totalPages);

  const goToFirst = () => onPageChange(1);
  const goToPrevious = () => onPageChange(page - 1);
  const goToNext = () => onPageChange(page + 1);
  const goToLast = () => onPageChange(totalPages);
</script>

<div class="flex items-center justify-between px-4 py-3 
            bg-[#050505] border-t border-[#1a1a1a] rounded-b-xl">
  <div class="flex items-center gap-4">
    {#if onPageSizeChange}
      <div class="flex items-center gap-2">
        <label for="page-size" class="text-sm text-[#8a8a8a] uppercase tracking-wider">Mostrar</label>
        <select
          id="page-size"
          class="px-2.5 py-1.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-sm text-[#c4c4c4] 
                 focus:outline-none focus:ring-1 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff]/50
                 transition-all"
          value={pageSize}
          onchange={(e) => onPageSizeChange?.(Number((e.target as HTMLSelectElement).value))}
        >
          {#each pageSizeOptions as size}
            <option value={size} class="bg-[#0d0d0d]">{size}</option>
          {/each}
        </select>
      </div>
    {/if}

    <p class="text-sm text-[#5a5a5a]">
      {#if totalCount > 0}
        <span class="font-medium text-[#a0a0a0]">{startItem}</span>
        –
        <span class="font-medium text-[#a0a0a0]">{endItem}</span>
        de
        <span class="font-bold text-[#00d4ff]">{totalCount}</span>
      {:else}
        0 registros
      {/if}
    </p>
  </div>

  <div class="flex items-center gap-1">
    <Button variant="ghost" size="sm" disabled={!canGoPrevious} onclick={goToFirst}>
      {#snippet icon()}<ChevronsLeft class="h-4 w-4" />{/snippet}
      {#snippet children()}{/snippet}
    </Button>
    <Button variant="ghost" size="sm" disabled={!canGoPrevious} onclick={goToPrevious}>
      {#snippet icon()}<ChevronLeft class="h-4 w-4" />{/snippet}
      {#snippet children()}{/snippet}
    </Button>

    <span class="px-3 py-1.5 text-sm text-void-400 bg-void-800/40 rounded-lg border border-void-700/30">
      Página <span class="text-void-200 font-medium">{page}</span> de <span class="text-void-200 font-medium">{totalPages || 1}</span>
    </span>

    <Button variant="ghost" size="sm" disabled={!canGoNext} onclick={goToNext}>
      {#snippet icon()}<ChevronRight class="h-4 w-4" />{/snippet}
      {#snippet children()}{/snippet}
    </Button>
    <Button variant="ghost" size="sm" disabled={!canGoNext} onclick={goToLast}>
      {#snippet icon()}<ChevronsRight class="h-4 w-4" />{/snippet}
      {#snippet children()}{/snippet}
    </Button>
  </div>
</div>
