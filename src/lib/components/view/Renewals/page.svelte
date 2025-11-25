<script lang="ts">
	import * as Tabs from "$lib/components/ui/tabs";
	import { Root as DialogRoot } from "$lib/components/ui/dialog";
	import DataTable from "$lib/components/element/DataTable.svelte";
	import { setContext } from "svelte";
	import { useSheets } from "$lib/state/sheets.svelte";
	import {
		pendingRenewalColumns,
		renewalHistoryColumns,
		type PendingRenewalData,
		type RenewalHistoryData,
	} from "./columns";
	import RenewalForm from "./renewal-form.svelte";
	import { useAuth } from "$lib/state/auth.svelte";

	const sheetState = useSheets();
	const authState = useAuth();
	let open = $state(false);
	let selectedRow = $state<PendingRenewalData>();

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
	});

	let pendingData = $derived(
		sheetState.subscriptionSheet
			.filter((s) => s.planned1 !== "" && s.actual1 === "")
			.filter(
				(s) =>
					authState.user?.role === "admin" ||
					s.subscriberName === authState.user?.username,
			)
			.map((s) => ({
				companyName: s.companyName,
				endDate: new Date(s.endDate),
				price: s.price,
				frequency: s.frequency,
				subscriberName:
					sheetState.userSheet.find((u) => u.username === s.subscriberName)
						?.name || "",
				subscriptionName: s.subscriptionName,
				subscriptionNo: s.subscriptionNo,
			})) satisfies PendingRenewalData[],
	);

	let historyData = $derived(
		sheetState.renewalSheet
			.filter(
				(s) =>
					authState.user?.role === "admin" ||
					sheetState.subscriptionSheet.find(
						(r) => r.subscriptionNo === s.subscriptionNo,
					)!.subscriberName === authState.user?.username,
			)
			.map((s) => {
				const currentRow = sheetState.subscriptionSheet.find(
					(sh) => s.subscriptionNo === sh.subscriptionNo,
				)!;
				const subscriber = sheetState.userSheet.find(
					(su) => su.username === currentRow.subscriberName,
				)!.name;
				return {
					companyName: currentRow.companyName,
					frequency: currentRow.frequency,
					price: currentRow.price,
					renewalDate: new Date(s.timestamp),
					renewalNo: s.renewalNo,
					renewalStatus: s.renewalStatus,
					subscriberName: subscriber,
					subscriptionName: currentRow.subscriptionName,
					subscriptionNo: currentRow.subscriptionNo,
				};
			}) satisfies RenewalHistoryData[],
	);
</script>

<Tabs.Root value="pending">
	<div class="px-5">
		<Tabs.List class="w-full">
			<Tabs.Trigger value="pending">Pending</Tabs.Trigger>
			<Tabs.Trigger value="history">History</Tabs.Trigger>
		</Tabs.List>
	</div>
	<div class="md:p-5 md:pt-0">
		<div class="bg-background p-5 rounded-md shadow-md">
			<Tabs.Content value="pending">
				<DialogRoot bind:open>
					<DataTable
						columns={pendingRenewalColumns}
						data={pendingData}
						loading={sheetState.subscriptionLoading}
					/>
					<RenewalForm />
				</DialogRoot>
			</Tabs.Content>
			<Tabs.Content value="history">
				<DataTable
					columns={renewalHistoryColumns}
					data={historyData}
					loading={sheetState.renewalLoading}
				/>
			</Tabs.Content>
		</div>
	</div>
</Tabs.Root>
