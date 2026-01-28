<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.svelte';
  import {
    LayoutDashboard,
    Users,
    Briefcase,
    FileText,
    Printer,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Plug
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';

  let { children } = $props();

  let sidebarOpen = $state(false);
  let userMenuOpen = $state(false);
  let isOnline = $state(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Track online/offline status
  $effect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => { isOnline = true; };
    const handleOffline = () => { isOnline = false; };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', href: '/customers', icon: Users },
    { name: 'Serviços', href: '/services', icon: Briefcase },
    { name: 'Contratos', href: '/contracts', icon: FileText },
    { name: 'Fila de Impressão', href: '/print-jobs', icon: Printer },
    { name: 'Integrações', href: '/integrations', icon: Plug }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return $page.url.pathname === '/';
    }
    return $page.url.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await authStore.logout();
  };

  // Redirect to login if not authenticated
  $effect(() => {
    if (!authStore.isAuthenticated && $page.url.pathname !== '/login') {
      goto('/login');
    }
  });
</script>

{#if !authStore.isAuthenticated}
  <div class="min-h-screen flex items-center justify-center bg-black">
    <div class="flex flex-col items-center gap-4">
      <svg class="animate-spin h-10 w-10 text-[#00d4ff]" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
        <path class="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span class="text-[#5a5a5a] text-sm">Carregando...</span>
    </div>
  </div>
{:else}
  <div class="min-h-screen relative bg-black">
    <!-- Electric grid background -->
    <div class="fixed inset-0 bg-[linear-gradient(rgba(0,212,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
    
    <!-- Mobile sidebar backdrop -->
    {#if sidebarOpen}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="fixed inset-0 z-40 bg-black/90 backdrop-blur-md lg:hidden" onclick={() => (sidebarOpen = false)}></div>
    {/if}

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-64 
             bg-[#050505]
             border-r border-[#00d4ff]/20
             transform transition-transform duration-300 ease-out
             lg:translate-x-0 {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center justify-between h-16 px-4 border-b border-[#1a1a1a]">
          <a href="/" class="flex items-center gap-3 group">
            <div class="p-2 rounded-lg bg-black border border-[#00d4ff]/50
                        shadow-[0_0_15px_rgba(0,212,255,0.3)] 
                        group-hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]
                        transition-all duration-300">
              <Printer class="h-5 w-5 text-[#00d4ff]" />
            </div>
            <span class="text-xl font-black text-[#00d4ff] tracking-wider text-glow-electric">
              PRESSLY
            </span>
          </a>
          <button class="lg:hidden p-2 rounded-lg text-[#5a5a5a] hover:text-[#00d4ff] transition-colors" onclick={() => (sidebarOpen = false)}>
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {#each navigation as item}
            <a
              href={item.href}
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium uppercase tracking-wider
                     transition-all duration-200 group
                     {isActive(item.href)
                ? 'bg-[#00d4ff]/10 text-[#00d4ff] border-l-2 border-[#00d4ff] shadow-[inset_0_0_20px_rgba(0,212,255,0.1)]'
                : 'text-[#787878] hover:text-[#00d4ff] hover:bg-[#0d0d0d]'}"
              onclick={() => (sidebarOpen = false)}
            >
              <item.icon class="h-5 w-5 transition-all duration-200 
                               {isActive(item.href) ? 'drop-shadow-[0_0_6px_rgba(0,212,255,0.8)]' : 'group-hover:drop-shadow-[0_0_4px_rgba(0,212,255,0.5)]'}" />
              {item.name}
            </a>
          {/each}
        </nav>

        <!-- User section -->
        <div class="border-t border-[#1a1a1a] p-4">
          <div class="relative">
            <button
              class="flex items-center gap-3 w-full p-2.5 rounded-lg 
                     hover:bg-[#0d0d0d] transition-all duration-200 group"
              onclick={() => (userMenuOpen = !userMenuOpen)}
            >
              <div class="w-9 h-9 rounded-lg 
                          bg-[#8000ff] border border-[#8000ff]/50
                          flex items-center justify-center 
                          shadow-[0_0_15px_rgba(128,0,255,0.3)]
                          group-hover:shadow-[0_0_20px_rgba(128,0,255,0.5)] transition-shadow">
                <span class="text-sm font-bold text-white">
                  {authStore.user?.username?.charAt(0).toUpperCase() ?? 'U'}
                </span>
              </div>
              <div class="flex-1 text-left">
                <p class="text-sm font-medium text-[#c4c4c4] truncate">
                  {authStore.user?.username ?? 'Usuário'}
                </p>
                <p class="text-xs text-[#5a5a5a] truncate">
                  {authStore.user?.tenantId ?? ''}
                </p>
              </div>
              <ChevronDown class="h-4 w-4 text-[#5a5a5a] transition-transform duration-200 
                                  {userMenuOpen ? 'rotate-180' : ''}" />
            </button>

            {#if userMenuOpen}
              <div class="absolute bottom-full left-0 right-0 mb-2 
                          bg-[#0d0d0d] backdrop-blur-xl rounded-xl 
                          border border-[#2a2a2a] shadow-2xl
                          py-2 overflow-hidden">
                <a
                  href="/settings"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-[#a0a0a0] 
                         hover:bg-[#1a1a1a] hover:text-[#00d4ff] transition-colors"
                  onclick={() => (userMenuOpen = false)}
                >
                  <Settings class="h-4 w-4" />
                  Configurações
                </a>
                <div class="h-px bg-[#2a2a2a] my-1 mx-3"></div>
                <button
                  class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[#ff0080] 
                         hover:bg-[#ff0080]/10 transition-colors"
                  onclick={handleLogout}
                >
                  <LogOut class="h-4 w-4" />
                  Sair
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="lg:pl-64 relative">
      <!-- Top bar -->
      <header class="sticky top-0 z-30 
                     bg-black/80 backdrop-blur-xl 
                     border-b border-[#1a1a1a]">
        <div class="flex items-center justify-between h-14 px-4">
          <button class="lg:hidden p-2 rounded-lg text-[#5a5a5a] hover:text-[#00d4ff] transition-colors" onclick={() => (sidebarOpen = true)}>
            <Menu class="h-5 w-5" />
          </button>

          <div class="flex-1"></div>

          <!-- Status indicator -->
          <div class="flex items-center gap-2 text-xs text-[#8a8a8a] uppercase tracking-wider">
            {#if isOnline}
              <span class="w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_8px_#39ff14] animate-pulse"></span>
              Online
            {:else}
              <span class="w-2 h-2 rounded-full bg-[#ff0080] shadow-[0_0_8px_#ff0080]"></span>
              Offline
            {/if}
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-5 lg:p-8">
        {@render children()}
      </main>
    </div>
  </div>
{/if}
