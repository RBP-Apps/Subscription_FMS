<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
	import { getContext } from "svelte";
	import type { ApprovalHistoryData, PendingApprovalData } from "./columns";

	let {
		currentRow,
	}: { currentRow: PendingApprovalData | ApprovalHistoryData } = $props();
	const dialogState: any = getContext(Symbol.for("dialog-state"));
</script>

<div class="flex justify-center">
	<Button
		onclick={() => {
			dialogState.open = true;
			dialogState.selectedRow = currentRow;
		}}>Review</Button
	>
</div>
