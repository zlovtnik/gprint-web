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

<div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
  <div class="flex items-center gap-4">
    {#if onPageSizeChange}
      <div class="flex items-center gap-2">
        <label for="page-size" class="text-sm text-gray-600">Mostrar</label>
        <select
          id="page-size"
          class="px-2 py-1 border border-gray-300 rounded text-sm"
          value={pageSize}
          onchange={(e) => onPageSizeChange?.(Number((e.target as HTMLSelectElement).value))}
        >
          {#each pageSizeOptions as size}
            <option value={size}>{size}</option>
          {/each}
        </select>
      </div>
    {/if}

    <p class="text-sm text-gray-600">
      {#if totalCount > 0}
        <span class="font-medium">{startItem}</span>
        –
        <span class="font-medium">{endItem}</span>
        de
        <span class="font-medium">{totalCount}</span>
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

    <span class="px-3 py-1 text-sm text-gray-600">
      Página {page} de {totalPages || 1}
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
