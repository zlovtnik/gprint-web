<script lang="ts">
  import type { Contract, ContractStatus, ContractType, BillingCycle } from '$lib/types/contract';
  import { Badge, Button } from '$lib/components/ui';
  import type { Color } from '$lib/components/ui/Badge.svelte';
  import { formatCurrency, formatDate } from '$lib/utils/format';
  import { pipe } from '$lib/utils/pipe';
  import { FileText, Edit, Trash2, FileDown } from 'lucide-svelte';

  interface Props {
    contract: Contract;
    onEdit?: (contract: Contract) => void;
    onDelete?: (contract: Contract) => void;
    onGenerate?: (contract: Contract) => void;
    onClick?: (contract: Contract) => void;
  }

  let { contract, onEdit, onDelete, onGenerate, onClick }: Props = $props();

  const statusColors: Record<ContractStatus, Color> = {
    DRAFT: 'gray',
    PENDING: 'yellow',
    ACTIVE: 'green',
    SUSPENDED: 'orange',
    CANCELLED: 'red',
    COMPLETED: 'blue'
  };

  const statusLabels: Record<ContractStatus, string> = {
    DRAFT: 'Rascunho',
    PENDING: 'Pendente',
    ACTIVE: 'Ativo',
    SUSPENDED: 'Suspenso',
    CANCELLED: 'Cancelado',
    COMPLETED: 'Concluído'
  };

  const typeLabels: Record<ContractType, string> = {
    SERVICE: 'Serviço',
    RECURRING: 'Recorrente',
    PROJECT: 'Projeto'
  };

  const billingLabels: Record<BillingCycle, string> = {
    MONTHLY: 'Mensal',
    QUARTERLY: 'Trimestral',
    YEARLY: 'Anual',
    ONCE: 'Único'
  };

  const formattedValue = $derived(pipe(contract.totalValue, formatCurrency('BRL')));
</script>

<article
  class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow
         {onClick ? 'cursor-pointer' : ''}"
  onclick={() => onClick?.(contract)}
  onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick?.(contract))}
  tabindex={onClick ? 0 : undefined}
  role={onClick ? 'button' : undefined}
  aria-label={onClick ? `Ver contrato ${contract.contractNumber}` : undefined}
>
  <header class="flex items-start justify-between mb-3">
    <div class="flex items-center gap-3">
      <div class="p-2 rounded-lg bg-blue-100">
        <FileText class="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h3 class="font-semibold text-gray-900">{contract.contractNumber}</h3>
        <p class="text-sm text-gray-500">{contract.customer?.name ?? 'Cliente'}</p>
      </div>
    </div>
    <Badge color={statusColors[contract.status]}>
      {#snippet children()}{statusLabels[contract.status]}{/snippet}
    </Badge>
  </header>

  <dl class="grid grid-cols-2 gap-2 text-sm mb-4">
    <div>
      <dt class="text-gray-500">Valor</dt>
      <dd class="font-medium text-gray-900">{formattedValue}</dd>
    </div>
    <div>
      <dt class="text-gray-500">Início</dt>
      <dd class="text-gray-900">{formatDate(contract.startDate)}</dd>
    </div>
    <div>
      <dt class="text-gray-500">Tipo</dt>
      <dd class="text-gray-900">{typeLabels[contract.contractType]}</dd>
    </div>
    <div>
      <dt class="text-gray-500">Faturamento</dt>
      <dd class="text-gray-900">{billingLabels[contract.billingCycle]}</dd>
    </div>
  </dl>

  {#if onEdit || onDelete || onGenerate}
    <footer class="flex items-center gap-2 pt-3 border-t">
      {#if onEdit}
        <Button
          variant="ghost"
          size="sm"
          onclick={(e) => {
            e.stopPropagation();
            onEdit(contract);
          }}
        >
          {#snippet icon()}<Edit class="h-4 w-4" />{/snippet}
          {#snippet children()}Editar{/snippet}
        </Button>
      {/if}
      {#if onGenerate && contract.status === 'ACTIVE'}
        <Button
          variant="ghost"
          size="sm"
          onclick={(e) => {
            e.stopPropagation();
            onGenerate(contract);
          }}
        >
          {#snippet icon()}<FileDown class="h-4 w-4 text-green-600" />{/snippet}
          {#snippet children()}<span class="text-green-600">Gerar PDF</span>{/snippet}
        </Button>
      {/if}
      {#if onDelete}
        <Button
          variant="ghost"
          size="sm"
          onclick={(e) => {
            e.stopPropagation();
            onDelete(contract);
          }}
        >
          {#snippet icon()}<Trash2 class="h-4 w-4 text-red-500" />{/snippet}
          {#snippet children()}<span class="text-red-500">Excluir</span>{/snippet}
        </Button>
      {/if}
    </footer>
  {/if}
</article>
