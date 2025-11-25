<script lang="ts">
	import { Root as DialogRoot } from "$lib/components/ui/dialog";
	import * as Tabs from "$lib/components/ui/tabs";
	import { setContext } from "svelte";
	import {
		paymentHistoryColumns,
		pendingPaymentsColumns,
		type paymentHistoryData,
		type PendingPaymentsData,
	} from "./columns";
	import { useSheets } from "$lib/state/sheets.svelte";
	import DataTable from "$lib/components/element/DataTable.svelte";
	import ProcessForm from "./process-form.svelte";
	import { useAuth } from "$lib/state/auth.svelte";

	const sheetState = useSheets();
	const authState = useAuth();

	let open = $state(false);
	let selectedRow = $state<PendingPaymentsData>();

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
			.filter((s) => s.actual3 === "" && s.planned3 !== "")
			.filter(
				(s) =>
					authState.user?.role === "admin" ||
					s.subscriberName === authState.user?.username,
			)
			.map((s) => ({
				approvedOn: new Date(s.actual2),
				company: s.companyName,
				frequency: s.frequency,
				price: s.price,
				subscriberName:
					sheetState.userSheet.find((u) => u.username === s.subscriberName)
						?.name || "",
				subscriptionName: s.subscriptionName,
				purpose: s.purpose,
				subscriptionNo: s.subscriptionNo,
			})) satisfies PendingPaymentsData[],
	);

	let historyData = $derived(
		sheetState.paymentSheet
			.filter(
				(s) =>
					authState.user?.role === "admin" ||
					sheetState.subscriptionSheet.find(
						(r) => r.subscriptionNo === s.subscriptionNo,
					)!.subscriberName === authState.user?.username,
			)
			.map((s) => {
				const currentSheet = sheetState.subscriptionSheet.find(
					(su) => s.subscriptionNo === su.subscriptionNo,
				)!;
				const subscriber = sheetState.userSheet.find(
					(su) => su.username === currentSheet.subscriberName,
				)!.name;
				return {
					company: currentSheet.companyName,
					insuranceDocument: s.insuranceDocument,
					paymentMode: s.paymentMode,
					startDate: new Date(s.startDate),
					subscriber,
					subscriptionNo: s.subscriptionNo,
					transactionId: s.transactionId,
					paymentDate: new Date(s.timestamp),
				};
			}) satisfies paymentHistoryData[],
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
						columns={pendingPaymentsColumns}
						data={pendingData}
						bind:loading={sheetState.subscriptionLoading}
					/>
					<ProcessForm />
				</DialogRoot>
			</Tabs.Content>
			<Tabs.Content value="history">
				<DataTable
					columns={paymentHistoryColumns}
					data={historyData}
					bind:loading={sheetState.paymentLoading}
				/>
			</Tabs.Content>
			<Tabs.Content value="history"></Tabs.Content>
		</div>
	</div>
</Tabs.Root>
