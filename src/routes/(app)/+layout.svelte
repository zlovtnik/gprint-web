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
    ChevronDown
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';

  let { children } = $props();

  let sidebarOpen = $state(false);
  let userMenuOpen = $state(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', href: '/customers', icon: Users },
    { name: 'Serviços', href: '/services', icon: Briefcase },
    { name: 'Contratos', href: '/contracts', icon: FileText },
    { name: 'Fila de Impressão', href: '/print-jobs', icon: Printer }
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
  <div class="min-h-screen flex items-center justify-center">
    <span>Carregando...</span>
  </div>
{:else}
  <div class="min-h-screen bg-gray-100">
    <!-- Mobile sidebar backdrop -->
    {#if sidebarOpen}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="fixed inset-0 z-40 bg-black/50 lg:hidden" onclick={() => (sidebarOpen = false)}></div>
    {/if}

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out
             lg:translate-x-0 {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center justify-between h-16 px-4 border-b">
          <a href="/" class="flex items-center gap-2">
            <Printer class="h-8 w-8 text-brand-600" />
            <span class="text-xl font-bold text-gray-900">gprint</span>
          </a>
          <button class="lg:hidden p-2 rounded-md hover:bg-gray-100" onclick={() => (sidebarOpen = false)}>
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {#each navigation as item}
            <a
              href={item.href}
              class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                     {isActive(item.href)
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-700 hover:bg-gray-100'}"
              onclick={() => (sidebarOpen = false)}
            >
              <item.icon class="h-5 w-5" />
              {item.name}
            </a>
          {/each}
        </nav>

        <!-- User section -->
        <div class="border-t p-4">
          <div class="relative">
            <button
              class="flex items-center gap-3 w-full p-2 rounded-md hover:bg-gray-100 transition-colors"
              onclick={() => (userMenuOpen = !userMenuOpen)}
            >
              <div class="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                <span class="text-sm font-medium text-brand-700">
                  {authStore.user?.username?.charAt(0).toUpperCase() ?? 'U'}
                </span>
              </div>
              <div class="flex-1 text-left">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {authStore.user?.username ?? 'Usuário'}
                </p>
                <p class="text-xs text-gray-500 truncate">
                  {authStore.user?.tenantId ?? ''}
                </p>
              </div>
              <ChevronDown class="h-4 w-4 text-gray-400" />
            </button>

            {#if userMenuOpen}
              <div class="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-md shadow-lg border py-1">
                <a
                  href="/settings"
                  class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onclick={() => (userMenuOpen = false)}
                >
                  <Settings class="h-4 w-4" />
                  Configurações
                </a>
                <button
                  class="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
    <div class="lg:pl-64">
      <!-- Top bar -->
      <header class="sticky top-0 z-30 bg-white shadow-sm">
        <div class="flex items-center justify-between h-16 px-4">
          <button class="lg:hidden p-2 rounded-md hover:bg-gray-100" onclick={() => (sidebarOpen = true)}>
            <Menu class="h-5 w-5" />
          </button>

          <div class="flex-1"></div>

          <!-- Right side actions can go here -->
        </div>
      </header>

      <!-- Page content -->
      <main class="p-4 lg:p-6">
        {@render children()}
      </main>
    </div>
  </div>
{/if}
