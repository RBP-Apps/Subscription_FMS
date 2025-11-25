<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
	import { getContext } from "svelte";
	import type { PendingPaymentsData } from "./columns";

	let { currentRow }: { currentRow: PendingPaymentsData } = $props();
	const dialogState: any = getContext(Symbol.for("dialog-state"));
</script>

<div class="flex justify-center">
	<Button
		onclick={() => {
			dialogState.open = true;
			dialogState.selectedRow = currentRow;
		}}>Process</Button
	>
</div>
