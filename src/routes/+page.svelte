<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.svelte';

  // Check auth on mount and redirect - wait for auth to be ready
  $effect(() => {
    // Wait until auth is not in loading state before redirecting
    if (authStore.loading) return;
    
    if (authStore.isAuthenticated) {
      goto('/dashboard');
    } else {
      goto('/login');
    }
  });
</script>

<div class="min-h-screen flex items-center justify-center">
  <div class="animate-pulse text-gray-500">Carregando...</div>
</div>
