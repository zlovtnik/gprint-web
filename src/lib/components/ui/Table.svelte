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

<div class="overflow-x-auto rounded-lg border border-gray-200">
  <table class="min-w-full divide-y divide-gray-200">
    <thead class="bg-gray-50">
      <tr>
        {#each columns as column}
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider {column.class ??
              ''}"
          >
            {column.header}
          </th>
        {/each}
        {#if actions}
          <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
            Ações
          </th>
        {/if}
      </tr>
    </thead>

    <tbody class="bg-white divide-y divide-gray-200">
      {#if loading}
        <tr>
          <td
            colspan={columns.length + (actions ? 1 : 0)}
            class="px-6 py-12 text-center text-gray-500"
          >
            <div class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
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
              Carregando...
            </div>
          </td>
        </tr>
      {:else if data.length === 0}
        <tr>
          <td
            colspan={columns.length + (actions ? 1 : 0)}
            class="px-6 py-12 text-center text-gray-500"
          >
            {emptyMessage}
          </td>
        </tr>
      {:else}
        {#each data as row, index (rowKey(row, index))}
          <tr
            class="{onRowClick
              ? 'cursor-pointer hover:bg-gray-50'
              : ''} transition-colors"
            onclick={() => onRowClick?.(row)}
            onkeydown={(e) => e.key === 'Enter' && onRowClick?.(row)}
            tabindex={onRowClick ? 0 : undefined}
            role={onRowClick ? 'button' : undefined}
          >
            {#each columns as column}
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 {column.class ?? ''}">
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
