<script lang="ts">
  import type { Service, PriceUnit } from '$lib/types/service';
  import { Badge, Button } from '$lib/components/ui';
  import { formatCurrency } from '$lib/utils/format';
  import { Edit, Trash2, FileBox } from 'lucide-svelte';

  interface Props {
    service: Service;
    onEdit?: (service: Service) => void;
    onDelete?: (service: Service) => void;
    onClick?: (service: Service) => void;
  }

  let { service, onEdit, onDelete, onClick }: Props = $props();

  const unitLabels: Record<PriceUnit, string> = {
    UNIT: 'Unidade',
    PAGE: 'Página',
    HOUR: 'Hora',
    PROJECT: 'Projeto',
    MONTHLY: 'Mensal'
  };
</script>

<article
  class="bg-[#0a0a0a] rounded-xl border border-[#8000ff]/20 p-4 
         hover:border-[#8000ff]/40 hover:shadow-[0_0_20px_rgba(128,0,255,0.15)] 
         transition-all duration-200
         {onClick ? 'cursor-pointer' : ''}"
  onclick={() => onClick?.(service)}
  onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.(service)}
  tabindex={onClick ? 0 : undefined}
  role={onClick ? 'button' : undefined}
>
  <header class="flex items-start justify-between mb-3">
    <div class="flex items-center gap-3">
      <div class="p-2 rounded-lg bg-[#8000ff]/10 border border-[#8000ff]/30">
        <FileBox class="h-5 w-5 text-[#8000ff]" />
      </div>
      <div>
        <h3 class="font-bold text-[#e8e8e8]">{service.name}</h3>
        <p class="text-sm text-[#5a5a5a]">{service.serviceCode}</p>
      </div>
    </div>
    <Badge color={service.active ? 'green' : 'gray'}>
      {#snippet children()}{service.active ? 'Ativo' : 'Inativo'}{/snippet}
    </Badge>
  </header>

  <div class="space-y-2 text-sm text-[#787878] mb-4">
    <div class="flex items-center gap-4">
      <span>Unidade: {unitLabels[service.priceUnit] ?? service.priceUnit ?? 'N/A'}</span>
    </div>

    <p class="text-lg font-bold text-[#00d4ff]">
      {formatCurrency('BRL')(service.unitPrice ?? 0)}
      <span class="text-sm font-normal text-[#5a5a5a]">/ {unitLabels[service.priceUnit]?.toLowerCase() ?? 'unidade'}</span>
    </p>

    {#if service.description}
      <p class="text-[#787878] line-clamp-2">{service.description}</p>
    {/if}
  </div>

  {#if onEdit || onDelete}
    <footer class="flex items-center gap-2 pt-3 border-t border-[#1a1a1a]">
      {#if onEdit}
        <Button
          variant="ghost"
          size="sm"
          onclick={(e) => {
            e.stopPropagation();
            onEdit(service);
          }}
        >
          {#snippet icon()}<Edit class="h-4 w-4" />{/snippet}
          {#snippet children()}Editar{/snippet}
        </Button>
      {/if}
      {#if onDelete}
        <Button
          variant="ghost"
          size="sm"
          onclick={(e) => {
            e.stopPropagation();
            onDelete(service);
          }}
        >
          {#snippet icon()}<Trash2 class="h-4 w-4 text-red-500" />{/snippet}
          {#snippet children()}<span class="text-red-500">Excluir</span>{/snippet}
        </Button>
      {/if}
    </footer>
  {/if}
</article>
