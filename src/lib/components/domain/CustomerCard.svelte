<script lang="ts">
  import type { Customer, CustomerType } from '$lib/types/customer';
  import { Badge, Button } from '$lib/components/ui';
  import { formatPhone, formatTaxId } from '$lib/utils/format';
  import { Building2, User, Mail, Phone, MapPin, Edit, Trash2 } from 'lucide-svelte';

  interface Props {
    customer: Customer;
    onEdit?: (customer: Customer) => void;
    onDelete?: (customer: Customer) => void;
    onClick?: (customer: Customer) => void;
  }

  let { customer, onEdit, onDelete, onClick }: Props = $props();

  const typeLabels: Record<CustomerType, string> = {
    INDIVIDUAL: 'Pessoa Física',
    COMPANY: 'Pessoa Jurídica'
  };

  const TypeIcon = customer.customerType === 'COMPANY' ? Building2 : User;
</script>

<article
  class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow
         {onClick ? 'cursor-pointer' : ''}"
  onclick={() => onClick?.(customer)}
  onkeydown={(e) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick(customer);
    }
  }}
  tabindex={onClick ? 0 : undefined}
  role={onClick ? 'button' : undefined}
>
  <header class="flex items-start justify-between mb-3">
    <div class="flex items-center gap-3">
      <div class="p-2 rounded-lg bg-gray-100">
        <TypeIcon class="h-5 w-5 text-gray-600" />
      </div>
      <div>
        <h3 class="font-semibold text-gray-900">{customer.name}</h3>
        <p class="text-sm text-gray-500">{customer.customerCode}</p>
      </div>
    </div>
    <Badge color={customer.active ? 'green' : 'gray'}>
      {#snippet children()}{customer.active ? 'Ativo' : 'Inativo'}{/snippet}
    </Badge>
  </header>

  <div class="space-y-2 text-sm text-gray-600 mb-4">
    <p class="flex items-center gap-2">
      <span class="text-gray-400">{typeLabels[customer.customerType]}</span>
      {#if customer.taxId}
        <span class="text-gray-300">•</span>
        <span>{formatTaxId(customer.taxId)}</span>
      {/if}
    </p>

    {#if customer.email}
      <p class="flex items-center gap-2">
        <Mail class="h-4 w-4 text-gray-400" />
        {customer.email}
      </p>
    {/if}

    {#if customer.phone || customer.mobile}
      <p class="flex items-center gap-2">
        <Phone class="h-4 w-4 text-gray-400" />
        {formatPhone(customer.phone || customer.mobile)}
      </p>
    {/if}

    {#if customer.address?.city}
      <p class="flex items-center gap-2">
        <MapPin class="h-4 w-4 text-gray-400" />
        {customer.address.city}{customer.address.state ? `, ${customer.address.state}` : ''}
      </p>
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
            onEdit(customer);
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
            onDelete(customer);
          }}
        >
          {#snippet icon()}<Trash2 class="h-4 w-4 text-red-500" />{/snippet}
          {#snippet children()}<span class="text-red-500">Excluir</span>{/snippet}
        </Button>
      {/if}
    </footer>
  {/if}
</article>
