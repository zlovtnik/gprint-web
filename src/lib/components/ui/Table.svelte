<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Column<T> {
    key: string;
    header: string;
    cell?: (row: T) => string | number;
    class?: string;
  }

  interface Props<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    emptyMessage?: string;
    rowKey?: (row: T, index?: number) => string | number;
    actions?: Snippet<[T]>;
    onRowClick?: (row: T) => void;
  }

  let {
    columns,
    data,
    loading = false,
    emptyMessage = 'Nenhum registro encontrado',
    rowKey = (row, index?: number) => {
      const id = (row as Record<string, unknown>).id;
      if (id === undefined) {
        console.warn('Table row missing "id" property. Provide a custom rowKey prop.');
        return `fallback-${index ?? 0}`;
      }
      return id as string | number;
    },
    actions,
    onRowClick
  }: Props<Record<string, unknown>> = $props();

  const getCellValue = (row: Record<string, unknown>, col: Column<Record<string, unknown>>) => {
    if (col.cell) {
      return col.cell(row);
    }
    return row[col.key] ?? '—';
  };
</script>

<div class="overflow-x-auto rounded-xl border border-[#00d4ff]/20 
            bg-[#0a0a0a] 
            shadow-[0_0_30px_rgba(0,0,0,0.5)]">
  <table class="min-w-full divide-y divide-[#1a1a1a]">
    <thead class="bg-[#050505]">
      <tr>
        {#each columns as column}
          <th
            scope="col"
            class="px-6 py-4 text-left text-xs font-bold text-[#00d4ff] uppercase tracking-wider {column.class ??
              ''}"
          >
            {column.header}
          </th>
        {/each}
        {#if actions}
          <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-[#00d4ff] uppercase tracking-wider">
            Ações
          </th>
        {/if}
      </tr>
    </thead>

    <tbody class="divide-y divide-[#1a1a1a]">
      {#if loading}
        <tr>
          <td
            colspan={columns.length + (actions ? 1 : 0)}
            class="px-6 py-16 text-center text-[#8a8a8a]"
          >
            <div class="flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
              <svg class="animate-spin h-8 w-8 text-[#00d4ff]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle
                  class="opacity-20"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="3"
                />
                <path
                  class="opacity-80"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span class="text-sm">Carregando...</span>
            </div>
          </td>
        </tr>
      {:else if data.length === 0}
        <tr>
          <td
            colspan={columns.length + (actions ? 1 : 0)}
            class="px-6 py-16 text-center text-[#8a8a8a]"
          >
            {emptyMessage}
          </td>
        </tr>
      {:else}
        {#each data as row, index (rowKey(row, index))}
          <tr
            class="group transition-all duration-200
                   {onRowClick
              ? 'cursor-pointer hover:bg-[#00d4ff]/5'
              : 'hover:bg-[#0d0d0d]'}"
            onclick={() => onRowClick?.(row)}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                if (e.key === ' ' || e.key === 'Spacebar') e.preventDefault();
                onRowClick?.(row);
              }
            }}
            tabindex={onRowClick ? 0 : undefined}
            role={onRowClick ? 'button' : undefined}
          >
            {#each columns as column}
              <td class="px-6 py-4 whitespace-nowrap text-sm text-[#a0a0a0] 
                         group-hover:text-[#e8e8e8] transition-colors {column.class ?? ''}">
                {getCellValue(row, column)}
              </td>
            {/each}
            {#if actions}
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                {@render actions(row)}
              </td>
            {/if}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
