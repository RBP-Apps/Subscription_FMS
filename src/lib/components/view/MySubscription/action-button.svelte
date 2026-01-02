<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
	import { getContext } from "svelte";
	import { CheckSquare } from "@lucide/svelte";
	import type { SubscriptionData } from "./columns";

	let { currentRow }: { currentRow: SubscriptionData } = $props();
	const dialogState: any = getContext(Symbol.for("dialog-state"));
</script>

<div class="flex justify-center">
	<Button
		variant="ghost"
		size="icon"
		onclick={() => {
			dialogState.open = true;
			dialogState.selectedRow = currentRow;
		}}
	>
		<CheckSquare class="h-5 w-5 text-primary" />
	</Button>
</div>
