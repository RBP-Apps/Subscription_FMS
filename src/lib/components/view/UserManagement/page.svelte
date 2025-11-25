<script lang="ts">
	import { Root as DialogRoot } from "$lib/components/ui/dialog";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { setContext } from "svelte";
	import { userColumns, type UserData } from "./columns";
	import DataTable from "$lib/components/element/DataTable.svelte";
	import { Button } from "$lib/components/ui/button";
	import { UserPlus } from "@lucide/svelte";
	import UserForm from "./user-form.svelte";
	import { Dialog } from "bits-ui";

	const sheetState = useSheets();
	let open = $state(false);
	let selectedRow = $state<UserData>();
	let typeForm = $state<"Edit" | "Create">("Create");

	setContext(Symbol.for("dialog-state"), {
		get open() {
			return open;
		},
		set open(value) {
			open = value;
		},
		get selectedRow() {
			return selectedRow;
		},
		set selectedRow(value) {
			selectedRow = value;
		},
		get typeForm() {
			return typeForm;
		},
		set typeForm(value) {
			typeForm = value;
		},
	});

	let users = $derived(
		sheetState.userSheet.map((s) => ({
			lastLogin: new Date(s.lastLogin),
			role: s.role,
			user: {
				email: s.email,
				name: s.name,
			},
			username: s.username,
			password: s.password,
		})) satisfies UserData[],
	);
</script>

<div class="md:p-5 md:pt-0">
	<div class="bg-background p-5 rounded-md shadow-md">
		<DialogRoot bind:open>
			<DataTable
				columns={userColumns}
				data={users}
				loading={sheetState.userLoading}
				class="h-[84dvh] md:h-[79dvh]"
			>
				<Button
					onclick={() => {
						selectedRow = undefined;
						typeForm = "Create";
						open = true;
					}}><UserPlus />Create User</Button
				>
			</DataTable>
			<UserForm />
		</DialogRoot>
	</div>
</div>
