<script lang="ts">
	import DataTable from "$lib/components/element/DataTable.svelte";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { subscriptionColumns, type SubscriptionData } from "./columns";
	import { getStatus } from "$lib/utils/parsers";
	import { useAuth } from "$lib/state/auth.svelte";
	import * as Dialog from "$lib/components/ui/dialog";
	import { setContext } from "svelte";
	import SubscriptionForm from "./subscription-form.svelte";

	const sheetState = useSheets();
	const authState = useAuth();

	let dialogState = $state({
		open: false,
		selectedRow: null as SubscriptionData | null,
	});

	setContext(Symbol.for("dialog-state"), dialogState);

	let subscriptionData = $derived(
		sheetState.subscriptionSheet
			.filter(
				(s) =>
					authState.user?.role === "admin" ||
					s.subscriberName === authState.user?.username ||
					s.subscriberName === authState.user?.name,
			)
			.map((s) => ({
				companyName: s.companyName,
				startDate: s.startDate ? new Date(s.startDate) : null,
				endDate: s.endDate ? new Date(s.endDate) : null,
				price: s.price,
				subscriberName:
					sheetState.userSheet.find((u) => u.username === s.subscriberName)
						?.name || s.subscriberName,
				subscriptionName: s.subscriptionName,
				subscriptionNo: s.subscriptionNo,
				policyNo: s.policyNo || "",
				agentName: s.agentName || "",
				fileUpload: s.fileUpload || "",
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				raw: s as any,
				status: getStatus(s),
			})) satisfies SubscriptionData[],
	);
</script>

<div class="md:p-5 md:pt-0">
	<div class="bg-background p-5 rounded-md shadow-md">
		<Dialog.Root bind:open={dialogState.open}>
			<DataTable
				columns={subscriptionColumns}
				data={subscriptionData}
				loading={sheetState.subscriptionLoading}
				class="h-[84dvh] md:h-[79dvh]"
			>
				{#if dialogState.selectedRow}
					<SubscriptionForm />
				{/if}
			</DataTable>
		</Dialog.Root>
	</div>
</div>
