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
  <title>Login - gprint</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
  <Card class="w-full max-w-md">
    <div class="p-8">
      <div class="flex flex-col items-center mb-8">
        <div class="p-3 bg-brand-100 rounded-full mb-4">
          <Printer class="h-10 w-10 text-brand-600" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">gprint</h1>
        <p class="text-gray-600">Sistema de Gerenciamento de Contratos</p>
      </div>

      <form onsubmit={handleSubmit} class="space-y-4">
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

        <Button type="submit" class="w-full" loading={submitting}>
          {#snippet children()}Entrar{/snippet}
        </Button>
      </form>
    </div>
  </Card>
</div>
