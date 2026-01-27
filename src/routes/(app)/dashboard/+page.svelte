<script lang="ts">
  import { Users, FileText, Briefcase, Printer, TrendingUp, Clock } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';

  // Dashboard stats would come from API
  const stats = [
    { label: 'Clientes Ativos', value: '—', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    {
      label: 'Contratos Ativos',
      value: '—',
      icon: FileText,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      label: 'Serviços Cadastrados',
      value: '—',
      icon: Briefcase,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      label: 'Impressões Hoje',
      value: '—',
      icon: Printer,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  ];
</script>

<svelte:head>
  <title>Dashboard - gprint</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
    <p class="text-gray-600">Visão geral do sistema de contratos</p>
  </div>

  <!-- Stats grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {#each stats as stat}
      <Card class="p-6">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg {stat.bg}">
            <stat.icon class="h-6 w-6 {stat.color}" />
          </div>
          <div>
            <p class="text-sm text-gray-600">{stat.label}</p>
            <p class="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
      </Card>
    {/each}
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Recent contracts -->
    <Card>
      <div class="p-4 border-b">
        <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock class="h-5 w-5 text-gray-500" />
          Contratos Recentes
        </h2>
      </div>
      <div class="p-4">
        <p class="text-gray-500 text-center py-8">Nenhum contrato recente</p>
      </div>
    </Card>

    <!-- Activity -->
    <Card>
      <div class="p-4 border-b">
        <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp class="h-5 w-5 text-gray-500" />
          Atividade Recente
        </h2>
      </div>
      <div class="p-4">
        <p class="text-gray-500 text-center py-8">Nenhuma atividade recente</p>
      </div>
    </Card>
  </div>
</div>
