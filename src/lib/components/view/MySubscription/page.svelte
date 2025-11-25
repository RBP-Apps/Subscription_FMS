<script lang="ts">
	import DataTable from "$lib/components/element/DataTable.svelte";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { subscriptionColumns, type SubscriptionData } from "./columns";
	import { getStatus } from "$lib/utils/parsers";
	import { useAuth } from "$lib/state/auth.svelte";

	const sheetState = useSheets();
	const authState = useAuth();

	let subscriptionData = $derived(
		sheetState.subscriptionSheet
			.filter(
				(s) =>
					authState.user?.role === "admin" ||
					s.subscriberName === authState.user?.username,
			)
			.map((s) => ({
				companyName: s.companyName,
				startDate: new Date(s.startDate),
				endDate: new Date(s.endDate),
				price: s.price,
				subscriberName:
					sheetState.userSheet.find((u) => u.username === s.subscriberName)
						?.name || "",
				subscriptionName: s.subscriptionName,
				subscriptionNo: s.subscriptionNo,
				status: getStatus(s),
			})) satisfies SubscriptionData[],
	);
</script>

<div class="md:p-5 md:pt-0">
	<div class="bg-background p-5 rounded-md shadow-md">
		<DataTable
			columns={subscriptionColumns}
			data={subscriptionData}
			loading={sheetState.subscriptionLoading}
			class="h-[84dvh] md:h-[79dvh]"
		/>
	</div>
</div>
