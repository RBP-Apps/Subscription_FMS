<script lang="ts">
	import Spinner from "$lib/components/element/Spinner.svelte";
	import { navigate } from "$lib/router";
	import { setAuth } from "$lib/state/auth.svelte";
	import { slide } from "svelte/transition";
	import { route } from "$lib/router";

	let { children } = $props();
	let authState = setAuth();

	$effect(() => {
		if (!authState.loading && !authState.loggedin && route.pathname !== "/auth/login") {
			navigate("/auth/login");
		}
		if (
			route.meta.admin &&
			authState.user &&
			authState.user?.role !== "admin"
		) {
			navigate("/app/");
		}
	});
</script>

{#if authState.loading}
	<div
		class="h-screen w-screen bg-background grid place-items-center absolute top-0 bottom-0 left-0 right-0 z-50 shadow-md"
		out:slide={{ axis: "y", duration: 500 }}
	>
		<div class="flex flex-col items-center gap-2">
			<Spinner color="secondary-foreground" size={50} />
			<p class="text-secondary-foreground font-semibold">Loading User Data</p>
		</div>
	</div>
{:else}
	{@render children()}
{/if}
