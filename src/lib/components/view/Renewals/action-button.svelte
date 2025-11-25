<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
	import { getContext } from "svelte";
	import type { PendingRenewalData } from "./columns";

	let { currentRow }: { currentRow: PendingRenewalData } = $props();
	const dialogState: any = getContext(Symbol.for("dialog-state"));
</script>

<div class="flex justify-center">
	<Button
		onclick={() => {
			dialogState.open = true;
			dialogState.selectedRow = currentRow;
		}}>Renew</Button
	>
</div>
