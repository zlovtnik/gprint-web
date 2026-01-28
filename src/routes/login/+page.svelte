<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.svelte';
  import { toastStore } from '$lib/stores/toast.svelte';
  import { loginSchema, type LoginInput } from '$lib/schemas/auth';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { Printer } from 'lucide-svelte';

  let username = $state('');
  let password = $state('');
  let errors = $state<Record<string, string>>({});
  let submitting = $state(false);

  // Redirect if already authenticated
  $effect(() => {
    if (authStore.isAuthenticated) {
      goto('/');
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    errors = {};

    const input: LoginInput = { username, password };
    const validation = loginSchema.safeParse(input);

    if (!validation.success) {
      for (const issue of validation.error.issues) {
        errors[issue.path[0] as string] = issue.message;
      }
      return;
    }

    submitting = true;

    try {
      const result = await authStore.login(username, password);

      if (result.ok) {
        toastStore.success('Login realizado com sucesso!');
        goto('/');
      } else {
        toastStore.error(result.error.message || 'Credenciais inválidas');
      }
    } finally {
      submitting = false;
    }
  };
</script>

<svelte:head>
  <title>Login - Pressly</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-black">
  <!-- Scan line effect -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
    <div class="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)]"></div>
  </div>
  
  <!-- Electric grid -->
  <div class="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.08)_1px,transparent_1px)] bg-[size:80px_80px]"></div>
  
  <!-- Neon glow orbs - vibrant -->
  <div class="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] bg-[#00d4ff] rounded-full blur-[200px] opacity-20"></div>
  <div class="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-[#ff0080] rounded-full blur-[180px] opacity-20"></div>
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#8000ff] rounded-full blur-[150px] opacity-15"></div>
  
  <!-- Login card -->
  <div class="w-full max-w-md relative z-10">
    <div class="relative bg-black/80 backdrop-blur-xl rounded-2xl border border-[#00d4ff]/30 p-8
                shadow-[0_0_50px_rgba(0,212,255,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]">
      
      <!-- Neon top border -->
      <div class="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent"></div>
      
      <div class="flex flex-col items-center mb-8">
        <!-- Logo with intense glow -->
        <div class="relative p-5 rounded-2xl mb-4 bg-black border border-[#00d4ff]/50 glow-electric">
          <Printer class="relative h-12 w-12 text-[#00d4ff]" />
        </div>
        <h1 class="text-4xl font-black text-[#00d4ff] text-glow-electric tracking-wider">
          PRESSLY
        </h1>
        <p class="text-[#787878] mt-2 tracking-wide text-sm">Sistema de Gerenciamento de Contratos</p>
      </div>

      <form onsubmit={handleSubmit} class="space-y-5">
        <Input
          label="Usuário"
          type="text"
          bind:value={username}
          error={errors.username}
          placeholder="Digite seu usuário"
          required
          autocomplete="username"
        />

        <Input
          label="Senha"
          type="password"
          bind:value={password}
          error={errors.password}
          placeholder="Digite sua senha"
          required
          autocomplete="current-password"
        />

        <Button type="submit" class="w-full mt-6" loading={submitting}>
          {#snippet children()}ENTRAR{/snippet}
        </Button>
      </form>
      
      <div class="mt-8 pt-6 border-t border-[#2a2a2a] text-center">
        <p class="text-xs text-[#5a5a5a] tracking-wider">
          v1.0 • 
          <span class="text-[#00d4ff]/60">POWERED BY PRESSLY</span>
        </p>
      </div>
    </div>
  </div>
</div>
