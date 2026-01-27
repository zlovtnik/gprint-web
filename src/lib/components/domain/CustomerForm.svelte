<script lang="ts">
  import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '$lib/types/customer';
  import {
    createCustomerSchema,
    updateCustomerSchema,
    type CreateCustomerInput
  } from '$lib/schemas/customer';
  import { Button, Input, Select, Textarea } from '$lib/components/ui';

  interface Props {
    customer?: Customer;
    onSubmit: (data: CreateCustomerRequest | UpdateCustomerRequest) => Promise<void>;
    onCancel: () => void;
    submitting?: boolean;
  }

  let { customer, onSubmit, onCancel, submitting = false }: Props = $props();

  const isEditing = !!customer;

  // Form state
  let form = $state<CreateCustomerInput>({
    customerCode: customer?.customerCode ?? '',
    customerType: customer?.customerType ?? 'COMPANY',
    name: customer?.name ?? '',
    tradeName: customer?.tradeName ?? '',
    taxId: customer?.taxId ?? '',
    stateReg: customer?.stateReg ?? '',
    municipalReg: customer?.municipalReg ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
    mobile: customer?.mobile ?? '',
    address: {
      street: customer?.address?.street ?? '',
      number: customer?.address?.number ?? '',
      complement: customer?.address?.complement ?? '',
      district: customer?.address?.district ?? '',
      city: customer?.address?.city ?? '',
      state: customer?.address?.state ?? '',
      zip: customer?.address?.zip ?? '',
      country: customer?.address?.country ?? 'Brasil'
    },
    notes: customer?.notes ?? ''
  });

  let errors = $state<Record<string, string>>({});

  const customerTypeOptions = [
    { value: 'COMPANY', label: 'Pessoa Jurídica' },
    { value: 'INDIVIDUAL', label: 'Pessoa Física' }
  ];

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    errors = {};

    const schema = isEditing ? updateCustomerSchema : createCustomerSchema;
    const validation = schema.safeParse(form);

    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      }
      return;
    }

    // Clean up empty optional fields - backend doesn't accept empty strings
    const data = { ...validation.data };
    if (data.tradeName === '') delete data.tradeName;
    if (data.stateReg === '') delete data.stateReg;
    if (data.municipalReg === '') delete data.municipalReg;
    if (data.phone === '') delete data.phone;
    if (data.mobile === '') delete data.mobile;
    if (data.notes === '') delete data.notes;
    if (data.address) {
      if (data.address.complement === '') delete data.address.complement;
    }

    await onSubmit(data as CreateCustomerRequest | UpdateCustomerRequest);
  };
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  <!-- Basic info -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input
      label="Código"
      bind:value={form.customerCode}
      error={errors.customerCode}
      required
      disabled={isEditing}
      placeholder="CLI001"
    />

    <Select
      label="Tipo"
      bind:value={form.customerType}
      options={customerTypeOptions}
      error={errors.customerType}
      required
    />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input
      label="Nome / Razão Social"
      bind:value={form.name}
      error={errors.name}
      required
      placeholder="Nome completo ou razão social"
    />

    <Input
      label="Nome Fantasia"
      bind:value={form.tradeName}
      error={errors.tradeName}
      placeholder="Nome fantasia (opcional)"
    />
  </div>

  <!-- Tax info -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Input
      label={form.customerType === 'COMPANY' ? 'CNPJ' : 'CPF'}
      bind:value={form.taxId}
      error={errors.taxId}
      placeholder={form.customerType === 'COMPANY' ? '00.000.000/0000-00' : '000.000.000-00'}
    />

    <Input
      label="Inscrição Estadual"
      bind:value={form.stateReg}
      error={errors.stateReg}
      placeholder="Inscrição estadual"
    />

    <Input
      label="Inscrição Municipal"
      bind:value={form.municipalReg}
      error={errors.municipalReg}
      placeholder="Inscrição municipal"
    />
  </div>

  <!-- Contact -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Input
      label="E-mail"
      type="email"
      bind:value={form.email}
      error={errors.email}
      placeholder="email@exemplo.com"
    />

    <Input
      label="Telefone"
      bind:value={form.phone}
      error={errors.phone}
      placeholder="(00) 0000-0000"
    />

    <Input
      label="Celular"
      bind:value={form.mobile}
      error={errors.mobile}
      placeholder="(00) 00000-0000"
    />
  </div>

  <!-- Address -->
  <fieldset class="border border-gray-200 rounded-lg p-4">
    <legend class="px-2 text-sm font-medium text-gray-700">Endereço</legend>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="md:col-span-2">
        <Input
          label="Logradouro"
          bind:value={form.address!.street}
          error={errors['address.street']}
          placeholder="Rua, Avenida, etc."
        />
      </div>

      <Input
        label="Número"
        bind:value={form.address!.number}
        error={errors['address.number']}
        placeholder="123"
      />

      <Input
        label="Complemento"
        bind:value={form.address!.complement}
        error={errors['address.complement']}
        placeholder="Sala, Apto, etc."
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
      <Input
        label="Bairro"
        bind:value={form.address!.district}
        error={errors['address.district']}
        placeholder="Bairro"
      />

      <Input
        label="Cidade"
        bind:value={form.address!.city}
        error={errors['address.city']}
        placeholder="Cidade"
      />

      <Input
        label="Estado"
        bind:value={form.address!.state}
        error={errors['address.state']}
        placeholder="UF"
        maxlength={2}
      />

      <Input
        label="CEP"
        bind:value={form.address!.zip}
        error={errors['address.zip']}
        placeholder="00000-000"
      />
    </div>
  </fieldset>

  <!-- Notes -->
  <Textarea
    label="Observações"
    bind:value={form.notes}
    error={errors.notes}
    placeholder="Observações sobre o cliente..."
    rows={3}
  />

  <!-- Actions -->
  <div class="flex items-center justify-end gap-3 pt-4 border-t">
    <Button variant="outline" type="button" onclick={onCancel}>
      {#snippet children()}Cancelar{/snippet}
    </Button>
    <Button type="submit" loading={submitting}>
      {#snippet children()}{isEditing ? 'Salvar' : 'Criar Cliente'}{/snippet}
    </Button>
  </div>
</form>
