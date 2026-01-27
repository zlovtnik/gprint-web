<script lang="ts">
  import type { Service, ServiceType, UnitType } from '$lib/types/service';
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

  const typeLabels: Record<ServiceType, string> = {
    PRINT: 'Impressão',
    SCAN: 'Digitalização',
    COPY: 'Cópia',
    FAX: 'Fax',
    OTHER: 'Outro'
  };

  const unitLabels: Record<UnitType, string> = {
    UNIT: 'Unidade',
    PAGE: 'Página',
    HOUR: 'Hora',
    PROJECT: 'Projeto',
    MONTHLY: 'Mensal'
  };
</script>

<article
  class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow
         {onClick ? 'cursor-pointer' : ''}"
  onclick={() => onClick?.(service)}
  onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.(service)}
  tabindex={onClick ? 0 : undefined}
  role={onClick ? 'button' : undefined}
>
  <header class="flex items-start justify-between mb-3">
    <div class="flex items-center gap-3">
      <div class="p-2 rounded-lg bg-purple-100">
        <FileBox class="h-5 w-5 text-purple-600" />
      </div>
      <div>
        <h3 class="font-semibold text-gray-900">{service.name}</h3>
        <p class="text-sm text-gray-500">{service.serviceCode}</p>
      </div>
    </div>
    <Badge color={service.active ? 'green' : 'gray'}>
      {#snippet children()}{service.active ? 'Ativo' : 'Inativo'}{/snippet}
    </Badge>
  </header>

  <div class="space-y-2 text-sm text-gray-600 mb-4">
    <div class="flex items-center gap-4">
      <Badge color="purple" size="sm">
        {#snippet children()}{typeLabels[service.serviceType]}{/snippet}
      </Badge>
      <span class="text-gray-400">•</span>
      <span>Unidade: {unitLabels[service.unitType]}</span>
    </div>

    <p class="text-lg font-semibold text-gray-900">
      {formatCurrency('BRL')(service.unitPrice)}
      <span class="text-sm font-normal text-gray-500">/ {unitLabels[service.unitType].toLowerCase()}</span>
    </p>

    {#if service.description}
      <p class="text-gray-600 line-clamp-2">{service.description}</p>
    {/if}
  </div>

  {#if onEdit || onDelete}
    <footer class="flex items-center gap-2 pt-3 border-t">
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
