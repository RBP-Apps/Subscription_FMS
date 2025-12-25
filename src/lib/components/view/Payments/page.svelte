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

	// Safe date utility function to handle various formats including Google Sheets serial numbers
	function safeDate(dateValue: any): Date | null {
		if (!dateValue || (typeof dateValue === 'string' && dateValue.trim() === "")) return null;
		
		// If it's already a Date object
		if (dateValue instanceof Date) return isNaN(dateValue.getTime()) ? null : dateValue;
		
		// Try parsing as a Date string
		let date = new Date(dateValue);
		
		// If parsing failed and it looks like a Google Sheets serial number (e.g., 45678)
		if (isNaN(date.getTime()) && !isNaN(Number(dateValue)) && Number(dateValue) > 30000) {
			// Google Sheets dates are days since Dec 30, 1899
			date = new Date((Number(dateValue) - 25569) * 86400 * 1000);
		}
		
		return isNaN(date.getTime()) ? null : date;
	}

	let pendingData = $derived(
		sheetState.subscriptionSheet
			.filter((s) => s.actual3 === "" && s.planned3 !== "")
			.filter(
				(s) =>
					authState.user?.role === "admin" ||
					s.subscriberName === authState.user?.username ||
					s.subscriberName === authState.user?.name,
			)
			.map((s) => {
				// Use safeDate to handle invalid dates
				const approvedOn = safeDate(s.actual2);
				
				return {
					approvedOn: approvedOn || new Date(), // Fallback to current date if invalid
					company: s.companyName,
					frequency: s.frequency,
					price: s.price,
					subscriberName:
						sheetState.userSheet.find((u) => u.username === s.subscriberName)
							?.name || s.subscriberName,
					subscriptionName: s.subscriptionName,
					purpose: s.purpose,
					subscriptionNo: s.subscriptionNo,
				};
			}) satisfies PendingPaymentsData[],
	);

	let historyData = $derived(
		sheetState.paymentSheet
			.map((s) => {
				const currentSheet = sheetState.subscriptionSheet.find(
					(su) => s.subscriptionNo === su.subscriptionNo
				);

				if (!currentSheet) return null;

				const subscriber =
					sheetState.userSheet.find(
						(su) => su.username === currentSheet.subscriberName
					)?.name || currentSheet.subscriberName || "";

				// Use safeDate for both dates
				const startDate = safeDate(s.startDate);
				const paymentDate = safeDate(s.timestamp);

				return {
					company: currentSheet.companyName,
					insuranceDocument: s.insuranceDocument,
					paymentMode: s.paymentMode,
					startDate: startDate || new Date(), // Fallback if parsing fails
					subscriber,
					subscriptionNo: s.subscriptionNo,
					transactionId: s.transactionId || "",
					paymentDate: paymentDate || new Date(), // Fallback if parsing fails
					paymentRiciept: s.paymentRiciept,
				};
			})
			.filter(Boolean) as paymentHistoryData[]
	);

	$effect(() => {
		console.log("💳 Payment History Data:", historyData);
	});
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
		</div>
	</div>
</Tabs.Root>