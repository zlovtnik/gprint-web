<script lang="ts">
  import type { Contract, CreateContractRequest, UpdateContractRequest } from '$lib/types/contract';
  import type { Customer } from '$lib/types/customer';
  import { createContractSchema, type CreateContractInput } from '$lib/schemas/contract';
  import { customersApi } from '$lib/api/customers';
  import { Button, Input, Select, Textarea } from '$lib/components/ui';
  import { formatDateISO } from '$lib/utils/format';

  interface Props {
    contract?: Contract;
    customerId?: number;
    onSubmit: (data: CreateContractRequest | UpdateContractRequest) => Promise<void>;
    onCancel: () => void;
    submitting?: boolean;
  }

  let { contract, customerId, onSubmit, onCancel, submitting = false }: Props = $props();

  const isEditing = !!contract;

  // Customer options for select
  let customers = $state<Customer[]>([]);
  let loadingCustomers = $state(true);

  // Load customers on mount
  $effect(() => {
    loadCustomers();
  });

  let customerLoadError = $state<string | null>(null);

  const loadCustomers = async () => {
    loadingCustomers = true;
    customerLoadError = null;
    const result = await customersApi.list({ pageSize: 100, active: true });
    if (result.ok) {
      customers = result.value.data;
    } else {
      customerLoadError = 'Falha ao carregar clientes';
    }
    loadingCustomers = false;
  };

  const today = formatDateISO(new Date());

  // Form state
  let form = $state<CreateContractInput>({
    customerId: contract?.customerId ?? customerId ?? 0,
    contractType: contract?.contractType ?? 'SERVICE',
    startDate: contract?.startDate?.split('T')[0] ?? today,
    endDate: contract?.endDate?.split('T')[0] ?? '',
    durationMonths: contract?.durationMonths ?? undefined,
    autoRenew: contract?.autoRenew ?? false,
    paymentTerms: contract?.paymentTerms ?? '',
    billingCycle: contract?.billingCycle ?? 'MONTHLY',
    notes: contract?.notes ?? ''
  });

  let errors = $state<Record<string, string>>({});

  const contractTypeOptions = [
    { value: 'SERVICE', label: 'Serviço' },
    { value: 'RECURRING', label: 'Recorrente' },
    { value: 'PROJECT', label: 'Projeto' }
  ];

  const billingCycleOptions = [
    { value: 'MONTHLY', label: 'Mensal' },
    { value: 'QUARTERLY', label: 'Trimestral' },
    { value: 'YEARLY', label: 'Anual' },
    { value: 'ONCE', label: 'Único' }
  ];

  const customerOptions = $derived(
    customers.map((c) => ({
      value: String(c.id),
      label: `${c.customerCode} - ${c.name}`
    }))
  );

  let selectedCustomerId = $state(String(form.customerId || ''));

  $effect(() => {
    form.customerId = Number(selectedCustomerId) || 0;
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    errors = {};

    const validation = createContractSchema.safeParse(form);

    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      }
      return;
    }

    await onSubmit(validation.data as CreateContractRequest | UpdateContractRequest);
  };
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Select
      label="Cliente"
      bind:value={selectedCustomerId}
      options={customerOptions}
      placeholder={loadingCustomers ? 'Carregando...' : 'Selecione um cliente'}
      error={errors.customerId || customerLoadError}
      required
      disabled={isEditing || loadingCustomers}
    />

    <Select
      label="Tipo de Contrato"
      bind:value={form.contractType}
      options={contractTypeOptions}
      error={errors.contractType}
      required
    />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Input
      label="Data de Início"
      type="date"
      bind:value={form.startDate}
      error={errors.startDate}
      required
    />

    <Input
      label="Data de Término"
      type="date"
      bind:value={form.endDate}
      error={errors.endDate}
      hint="Opcional"
    />

    <Input
      label="Duração (meses)"
      type="number"
      bind:value={form.durationMonths}
      error={errors.durationMonths}
      placeholder="12"
      min={1}
    />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Select
      label="Ciclo de Faturamento"
      bind:value={form.billingCycle}
      options={billingCycleOptions}
      error={errors.billingCycle}
      required
    />

    <Input
      label="Condições de Pagamento"
      bind:value={form.paymentTerms}
      error={errors.paymentTerms}
      placeholder="Ex: 30 dias após emissão"
    />
  </div>

  <div class="flex items-center gap-3">
    <input
      type="checkbox"
      id="autoRenew"
      bind:checked={form.autoRenew}
      class="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
    />
    <label for="autoRenew" class="text-sm text-gray-700"> Renovação automática </label>
  </div>

  <Textarea
    label="Observações"
    bind:value={form.notes}
    error={errors.notes}
    placeholder="Observações sobre o contrato..."
    rows={3}
  />

  <!-- Actions -->
  <div class="flex items-center justify-end gap-3 pt-4 border-t">
    <Button variant="outline" type="button" onclick={onCancel}>
      {#snippet children()}Cancelar{/snippet}
    </Button>
    <Button type="submit" loading={submitting}>
      {#snippet children()}{isEditing ? 'Salvar' : 'Criar Contrato'}{/snippet}
    </Button>
  </div>
</form>
