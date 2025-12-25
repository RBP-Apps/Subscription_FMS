<script lang="ts">
	import { onMount } from "svelte";
	import {
		type ApprovalHistoryData,
		type PendingApprovalData,
		approvalHistoryColumns,
		pendingApprovalColumns,
	} from "./columns";
	import DataTable from "$lib/components/element/DataTable.svelte";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { Root as DialogRoot } from "$lib/components/ui/dialog";
	import { setContext } from "svelte";
	import * as Tabs from "$lib/components/ui/tabs";
	import ReviewForm from "./review-form.svelte";

	const sheetState = useSheets();
	let open = $state(false);
	let selectedRow = $state<PendingApprovalData | ApprovalHistoryData>();

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

	let pendingData = $derived.by(() => {
		try {
			return sheetState.subscriptionSheet
				.filter((s) => s.actual2 === "" && s.planned2 !== "")
				.map((sheet) => ({
					subscriptionNo: sheet.subscriptionNo,
					companyName: sheet.companyName,
					subscriberName:
						sheetState.userSheet.find(
							(u) => u.username === sheet.subscriberName,
						)?.name || sheet.subscriberName,
					subscriptionName: sheet.subscriptionName,
					price: sheet.price,
					frequency: sheet.frequency,
					requestedOn:
						sheet.actual1 === ""
							? new Date(sheet.timestamp)
							: new Date(sheet.actual1),
					purpose: sheet.purpose,
				})) satisfies PendingApprovalData[];
		} catch (error) {
			console.error("Error in pendingData derivation:", error);
			return [];
		}
	});

	// Add null checks to prevent errors
	let historyData = $derived(
		sheetState.approvalSheet
			.map((s) => {
				const subscription = sheetState.subscriptionSheet.find(
					(sh) => s.subscriptionNo === sh.subscriptionNo,
				);
				if (!subscription) return null;

				const subscriber = sheetState.userSheet.find(
					(su) => su.username === subscription.subscriberName,
				);

				return {
					approvalNo: s.approvalNo,
					subscriptionNo: s.subscriptionNo,
					subscriberName: subscriber?.name || subscription.subscriberName,
					subscriptionName: subscription.subscriptionName,
					approvalStatus: s.approvalStatus,
					companyName: subscription.companyName,
					frequency: subscription.frequency,
					price: subscription.price,
					purpose: subscription.purpose,
					requestedOn: new Date(s.requestedOn),
					reviewedOn: new Date(s.timestamp),
				};
			})
			.filter(Boolean) satisfies ApprovalHistoryData[],
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
						data={pendingData}
						columns={pendingApprovalColumns}
						loading={sheetState.subscriptionLoading}
					/>
					<ReviewForm />
				</DialogRoot>
			</Tabs.Content>
			<Tabs.Content value="history">
				<DataTable
					data={historyData}
					columns={approvalHistoryColumns}
					loading={sheetState.approvalLoading}
				/>
			</Tabs.Content>
		</div>
	</div>
</Tabs.Root>