<script lang="ts">
  import { Users, FileText, Briefcase, Printer, TrendingUp, Clock } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';

  // Dashboard stats would come from API
  const stats = [
    { label: 'Clientes Ativos', value: '—', icon: Users, color: '#00d4ff', glow: 'rgba(0,212,255,0.3)' },
    { label: 'Contratos Ativos', value: '—', icon: FileText, color: '#39ff14', glow: 'rgba(57,255,20,0.3)' },
    { label: 'Serviços Cadastrados', value: '—', icon: Briefcase, color: '#8000ff', glow: 'rgba(128,0,255,0.3)' },
    { label: 'Impressões Hoje', value: '—', icon: Printer, color: '#ff0080', glow: 'rgba(255,0,128,0.3)' }
  ];
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
            <p class="text-3xl font-black text-[#e8e8e8]">{stat.value}</p>
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
        <p class="text-[#5a5a5a] text-center py-8">Nenhum contrato recente</p>
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
