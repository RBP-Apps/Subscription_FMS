<script lang="ts">
	import * as Dropdown from "$lib/components/ui/dropdown-menu";
	import { getContext } from "svelte";
	import type { UserData } from "./columns";
	import { Ellipsis, Pencil, Trash } from "@lucide/svelte";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { postSheet } from "$lib/api";
	import { toast } from "svelte-sonner";

	const sheetState = useSheets();
	let { currentRow }: { currentRow: UserData } = $props();
	const dialogState: any = getContext(Symbol.for("dialog-state"));
</script>

<div class="flex justify-center">
	<Dropdown.Root>
		<Dropdown.Trigger><Ellipsis size={18} /></Dropdown.Trigger>
		<Dropdown.Content>
			<Dropdown.Item
				class="flex gap-2"
				onclick={() => {
					dialogState.selectedRow = currentRow;
					dialogState.open = true;
					dialogState.typeForm = "Edit";
				}}><Pencil size={15} color="var(--foreground)" />Edit</Dropdown.Item
			>
			<Dropdown.Item
				class="flex gap-2 text-destructive"
				onclick={async () => {
					const row = sheetState.userSheet.find(
						(s) => s.username === currentRow.username,
					)!;

					toast.promise(postSheet({
						action: "delete",
						rows: [{
							...row
						}
						]
					}), {
						loading: "Deleting user",
						success: () =>  { sheetState.updateUser(); return "User deleted successfully"},
						error: "Failed to delete user",
						
					})
				}}><Trash size={15} color="var(--destructive)" />Delete</Dropdown.Item
			>
		</Dropdown.Content>
	</Dropdown.Root>
</div>
