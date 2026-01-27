<script lang="ts">
  import '../app.css';
  import { ToastContainer } from '$lib/components/ui';

  let { children } = $props();
</script>

<svelte:head>
  <title>gprint - Sistema de Contratos</title>
  <meta name="description" content="Sistema de Gerenciamento de Contratos de Impressão" />
</svelte:head>

{@render children()}
<ToastContainer />
