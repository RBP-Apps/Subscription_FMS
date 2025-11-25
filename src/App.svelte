<script lang="ts">
	import { Router } from "sv-router";
	import { Toaster } from "$lib/components/ui/sonner";
	import { TooltipProvider } from "$lib/components/ui/tooltip";
	import "$lib/router";
	import { setAuth } from "$lib/state/auth.svelte";
</script>

<TooltipProvider>
	<Router />
</TooltipProvider>
<Toaster expand richColors closeButton />
