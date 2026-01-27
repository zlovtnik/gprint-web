<script lang="ts">
  import { Users, FileText, Briefcase, Printer, TrendingUp, Clock } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { customersApi } from '$lib/api/customers';
  import { contractsApi } from '$lib/api/contracts';
  import { servicesApi } from '$lib/api/services';
  import { printJobsApi } from '$lib/api/print-jobs';
  import type { Contract } from '$lib/types/contract';
  import { formatDate } from '$lib/utils/format';
  import Spinner from '$lib/components/ui/Spinner.svelte';

  // Dashboard state
  let loading = $state(true);
  let customersCount = $state(0);
  let contractsCount = $state(0);
  let servicesCount = $state(0);
  let printJobsToday = $state(0);
  let recentContracts = $state<Contract[]>([]);

  // Fetch dashboard data
  onMount(async () => {
    loading = true;
    
    const [customersRes, contractsRes, servicesRes, printJobsRes] = await Promise.all([
      customersApi.list({ page: 1, pageSize: 1, active: true }),
      contractsApi.list({ page: 1, pageSize: 5, status: 'ACTIVE' }),
      servicesApi.list({ page: 1, pageSize: 1, active: true }),
      printJobsApi.list({ page: 1, pageSize: 1 })
    ]);

    if (customersRes.ok) {
      customersCount = customersRes.value.total ?? 0;
    }
    
    if (contractsRes.ok) {
      contractsCount = contractsRes.value.total ?? 0;
      recentContracts = contractsRes.value.items ?? [];
    }
    
    if (servicesRes.ok) {
      servicesCount = servicesRes.value.total ?? 0;
    }
    
    if (printJobsRes.ok) {
      printJobsToday = printJobsRes.value.total ?? 0;
    }

    loading = false;
  });

  // Stats computed from state
  const stats = $derived([
    { label: 'Clientes Ativos', value: customersCount, icon: Users, color: '#00d4ff', glow: 'rgba(0,212,255,0.3)' },
    { label: 'Contratos Ativos', value: contractsCount, icon: FileText, color: '#39ff14', glow: 'rgba(57,255,20,0.3)' },
    { label: 'Serviços Cadastrados', value: servicesCount, icon: Briefcase, color: '#8000ff', glow: 'rgba(128,0,255,0.3)' },
    { label: 'Impressões', value: printJobsToday, icon: Printer, color: '#ff0080', glow: 'rgba(255,0,128,0.3)' }
  ]);
</script>

<svelte:head>
  <title>Dashboard - gprint</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-black text-[#00d4ff] tracking-wide text-glow-electric">DASHBOARD</h1>
    <p class="text-[#9ca3af] mt-1">Visão geral do sistema de contratos</p>
  </div>

  <!-- Stats grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {#each stats as stat}
      <div class="relative p-6 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a]
                  hover:border-opacity-100 transition-all duration-300 group"
           style="border-color: {stat.color}30; box-shadow: 0 0 30px {stat.glow};">
        <!-- Glow effect on hover -->
        <div class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
             style="box-shadow: inset 0 0 40px {stat.glow};"></div>
        
        <div class="relative flex items-center gap-4">
          <div class="p-3 rounded-lg bg-black border"
               style="border-color: {stat.color}50; box-shadow: 0 0 15px {stat.glow};">
            <stat.icon class="h-6 w-6" style="color: {stat.color}; filter: drop-shadow(0 0 6px {stat.color});" />
          </div>
          <div>
            <p class="text-sm text-[#787878] uppercase tracking-wider">{stat.label}</p>
            {#if loading}
              <Spinner size="sm" />
            {:else}
              <p class="text-3xl font-black text-[#e8e8e8]">{stat.value}</p>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Recent contracts -->
    <div class="rounded-xl bg-[#0a0a0a] border border-[#00d4ff]/20 overflow-hidden
                shadow-[0_0_30px_rgba(0,212,255,0.1)]">
      <div class="p-4 border-b border-[#1a1a1a] bg-[#050505]">
        <h2 class="text-lg font-bold text-[#00d4ff] flex items-center gap-2 tracking-wide">
          <Clock class="h-5 w-5 drop-shadow-[0_0_6px_rgba(0,212,255,0.8)]" />
          CONTRATOS RECENTES
        </h2>
      </div>
      <div class="p-4">
        {#if loading}
          <div class="flex justify-center py-8">
            <Spinner />
          </div>
        {:else if recentContracts.length === 0}
          <p class="text-[#5a5a5a] text-center py-8">Nenhum contrato recente</p>
        {:else}
          <div class="space-y-3">
            {#each recentContracts as contract}
              <a href="/contracts/{contract.id}" 
                 class="block p-3 rounded-lg bg-[#050505] border border-[#1a1a1a] hover:border-[#00d4ff]/40 transition-colors">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="text-[#e8e8e8] font-medium">{contract.contractNumber}</p>
                    <p class="text-sm text-[#787878]">{contract.customerName ?? 'Cliente'}</p>
                  </div>
                  <span class="text-xs text-[#5a5a5a]">{formatDate(contract.startDate)}</span>
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Activity -->
    <div class="rounded-xl bg-[#0a0a0a] border border-[#8000ff]/20 overflow-hidden
                shadow-[0_0_30px_rgba(128,0,255,0.1)]">
      <div class="p-4 border-b border-[#1a1a1a] bg-[#050505]">
        <h2 class="text-lg font-bold text-[#8000ff] flex items-center gap-2 tracking-wide">
          <TrendingUp class="h-5 w-5 drop-shadow-[0_0_6px_rgba(128,0,255,0.8)]" />
          ATIVIDADE RECENTE
        </h2>
      </div>
      <div class="p-4">
        <p class="text-[#5a5a5a] text-center py-8">Nenhuma atividade recente</p>
      </div>
    </div>
  </div>
</div>
