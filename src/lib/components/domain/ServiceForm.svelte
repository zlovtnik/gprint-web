<script lang="ts">
  import type { Service, CreateServiceRequest, UpdateServiceRequest } from '$lib/types/service';
  import { createServiceSchema, type CreateServiceInput } from '$lib/schemas/service';
  import { Button, Input, Select, Textarea } from '$lib/components/ui';

  interface Props {
    service?: Service;
    onSubmit: (data: CreateServiceRequest | UpdateServiceRequest) => Promise<void>;
    onCancel: () => void;
    submitting?: boolean;
  }

  let { service, onSubmit, onCancel, submitting = false }: Props = $props();

  const isEditing = !!service;

  // Form state
  let form = $state<CreateServiceInput>({
    serviceCode: service?.serviceCode ?? '',
    name: service?.name ?? '',
    description: service?.description ?? '',
    serviceType: service?.serviceType ?? 'PRINT',
    unitType: service?.unitType ?? 'PAGE',
    unitPrice: service?.unitPrice ?? ''
  });

  let errors = $state<Record<string, string>>({});

  const serviceTypeOptions = [
    { value: 'PRINT', label: 'Impressão' },
    { value: 'SCAN', label: 'Digitalização' },
    { value: 'COPY', label: 'Cópia' },
    { value: 'FAX', label: 'Fax' },
    { value: 'OTHER', label: 'Outro' }
  ];

  const unitTypeOptions = [
    { value: 'UNIT', label: 'Unidade' },
    { value: 'PAGE', label: 'Página' },
    { value: 'HOUR', label: 'Hora' },
    { value: 'PROJECT', label: 'Projeto' },
    { value: 'MONTHLY', label: 'Mensal' }
  ];

  let submissionError = $state<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    errors = {};
    submissionError = null;

    const validation = createServiceSchema.safeParse(form);

    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const path = issue.path.join('.');
        errors[path] = issue.message;
      }
      return;
    }

    // Build properly typed payload
    const payload: CreateServiceRequest | UpdateServiceRequest = {
      serviceCode: form.serviceCode,
      name: form.name,
      description: form.description || undefined,
      serviceType: form.serviceType as 'PRINT' | 'SCAN' | 'COPY' | 'FAX' | 'OTHER',
      unitType: form.unitType as 'UNIT' | 'PAGE' | 'HOUR' | 'PROJECT' | 'MONTHLY',
      unitPrice: typeof form.unitPrice === 'string' 
        ? form.unitPrice 
        : String(form.unitPrice)
    };

    try {
      await onSubmit(payload);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro ao salvar serviço';
      submissionError = message;
      errors['_form'] = message;
    }
  };
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input
      label="Código"
      bind:value={form.serviceCode}
      error={errors.serviceCode}
      required
      disabled={isEditing}
      placeholder="SRV001"
    />

    <Input
      label="Nome"
      bind:value={form.name}
      error={errors.name}
      required
      placeholder="Nome do serviço"
    />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Select
      label="Tipo"
      bind:value={form.serviceType}
      options={serviceTypeOptions}
      error={errors.serviceType}
      required
    />

    <Select
      label="Unidade"
      bind:value={form.unitType}
      options={unitTypeOptions}
      error={errors.unitType}
      required
    />

    <Input
      label="Preço Unitário"
      type="text"
      inputmode="decimal"
      bind:value={form.unitPrice}
      error={errors.unitPrice}
      required
      placeholder="0.00"
    />
  </div>

  <Textarea
    label="Descrição"
    bind:value={form.description}
    error={errors.description}
    placeholder="Descrição do serviço..."
    rows={3}
  />

  <!-- Actions -->
  <div class="flex items-center justify-end gap-3 pt-4 border-t">
    <Button variant="outline" type="button" onclick={onCancel}>
      {#snippet children()}Cancelar{/snippet}
    </Button>
    <Button type="submit" loading={submitting}>
      {#snippet children()}{isEditing ? 'Salvar' : 'Criar Serviço'}{/snippet}
    </Button>
  </div>
</form>
