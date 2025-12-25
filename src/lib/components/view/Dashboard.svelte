<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import * as Chart from "$lib/components/ui/chart";
	import * as Table from "$lib/components/ui/table";
	import * as Popover from "$lib/components/ui/popover";
	import { SheetState, useSheets } from "$lib/state/sheets.svelte";
	import {
		CalendarIcon,
		Check,
		ClipboardList,
		CreditCard,
		IndianRupee,
		MonitorCheck,
		RotateCcw,	
	} from "@lucide/svelte";
	import { getLocalTimeZone, type DateValue } from "@internationalized/date";
	import { RangeCalendar } from "$lib/components/ui/range-calendar";
	import type { DateRange } from "bits-ui";
	import type {
		ApprovalRow,
		RenewalRow,
		SubscriptionRow,
	} from "$lib/types/sheets";
	import { cn } from "$lib/utils/cn";
	import { buttonVariants } from "../ui/button";
	import { getStatus } from "$lib/utils/parsers";
	import { Arc, Legend, PieChart } from "layerchart";
	import { Separator } from "$lib/components/ui/separator";
	import { useAuth } from "$lib/state/auth.svelte";

	const sheetState = useSheets();
	const authState = useAuth();

	function filterSheets({
		sheetState,
		dateRange,
	}: {
		sheetState: SheetState;
		dateRange?: DateRange;
	}) {
		const inDateRange = (s: SubscriptionRow | RenewalRow) => {
			if (!dateRange) return true;

			let final = true;
			if (
				dateRange.start &&
				dateRange.start.toDate(getLocalTimeZone()) >= new Date(s.timestamp)
			) {
				final = false;
			}
			if (
				dateRange.end &&
				dateRange.end.toDate(getLocalTimeZone()) <= new Date(s.timestamp)
			) {
				final = false;
			}
			return final;
		};

		// Filter by user role
		const isUserData = (s: SubscriptionRow | RenewalRow) => {
			return (
				authState.user?.role === "admin" ||
				s.subscriberName === authState.user?.username ||
				s.subscriberName === authState.user?.name
			);
		};

		return {
			subscriptionSheet: sheetState.subscriptionSheet.filter(s => isUserData(s) && inDateRange(s)),
			renewalSheet: sheetState.renewalSheet.filter(s => isUserData(s) && inDateRange(s)),
		};
	}

	let dateRange = $state<DateRange>();
	let dateStartValue = $state<DateValue>();

	let filteredSheets = $derived(filterSheets({ sheetState, dateRange }));

	let pendingApprovals = $derived(
		filteredSheets.subscriptionSheet.filter(
			(s) => s.actual2 === "" && s.planned2 !== "",
		).length || "No",
	);
	let pendingPayments = $derived(
		filteredSheets.subscriptionSheet.filter(
			(s) => s.actual3 === "" && s.planned3 !== "",
		).length || "No",
	);
	let pendingRenewals = $derived(
		filteredSheets.subscriptionSheet.filter(
			(s) => s.actual1 === "" && s.planned1 !== "",
		).length || "No",
	);
	let totalSubscriptions = $derived(filteredSheets.subscriptionSheet.length);
	let activeSubscrptions = $derived(
		filteredSheets.subscriptionSheet
			.map(getStatus)
			.filter((s) => s === "Active").length,
	);
	let totalRenewalValue = $derived(
		filteredSheets.renewalSheet
			.map((r) => parseInt(r.price))
			.reduce((acc, curr) => acc + curr, 0),
	);
	let totalValue = $derived(
		filteredSheets.subscriptionSheet
			.map((s) => {
				const renewalCount = isNaN(parseInt(s.renewalCount))
					? 1
					: parseInt(s.renewalCount) + 1;
				const price = parseInt(s.price);
				return price * renewalCount;
			})
			.reduce((acc, curr) => acc + curr, 0),
	);

	let constlySubscriptions = $derived(filteredSheets.subscriptionSheet.sort((x, y) => parseInt(y.price) - parseInt(x.price)).slice(0, 5));

	const currencyFormatter = Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format;
	const dateFormatter = Intl.DateTimeFormat("en-IN", {
		dateStyle: "medium",
	}).format;

	let statuses = $derived(filteredSheets.subscriptionSheet.map(getStatus));
	
	const chartData = $derived([
		{
			status: "created",
			subscriptions: statuses.filter((s) => s === "Created").length,
			color: "var(--color-created)",
		},
		{
			status: "active",
			subscriptions: statuses.filter((s) => s === "Active").length,
			color: "var(--color-active)",
		},
		{
			status: "renewal",
			subscriptions: statuses.filter((s) => s === "Renewal").length,
			color: "var(--color-renewal)",
		},
		{
			status: "approved",
			subscriptions: statuses.filter((s) => s === "Approved").length,
			color: "var(--color-approved)",
		},
		{
			status: "rejected",
			subscriptions: statuses.filter((s) => s === "Rejected").length,
			color: "var(--color-rejected)",
		},
		{
			status: "ended",
			subscriptions: statuses.filter((s) => s === "Ended").length,
			color: "var(--color-ended)",
		},
		{
			status: "expired",
			subscriptions: statuses.filter((s) => s === "Expired").length,
			color: "var(--color-expired)",
		},
	]);
	const chartConfig = {
		subscriptions: { label: "Subscriptions" },
		created: { label: "Created", color: "var(--chart-1)" },
		active: { label: "Active", color: "var(--chart-2)" },
		renewal: { label: "Renewal", color: "var(--chart-3)" },
		approved: { label: "Approved", color: "var(--chart-4)" },
		rejected: { label: "Rejected", color: "var(--chart-5)" },
		ended: { label: "Ended", color: "var(--chart-6)" },
		expired: { label: "Expired", color: "var(--chart-7)" },
	} satisfies Chart.ChartConfig;
</script>

<!-- The rest of your HTML template remains the same -->
<div class="grid gap-4 px-5 pb-5">
	<Card.Root class="bg-background p-2">
		<Card.Content class="p-0">
			<Popover.Root>
				<Popover.Trigger
					class={cn(
						"w-full md:w-auto",
						buttonVariants({ variant: "outline" }),
						!dateRange && "text-muted-foreground",
					)}
				>
					<CalendarIcon class="size-4 mr-2" />
					{#if dateRange && dateRange.start}
						{#if dateRange.end}
							{dateFormatter(dateRange.start.toDate(getLocalTimeZone()))} - {dateFormatter(
								dateRange.end.toDate(getLocalTimeZone()),
							)}
						{:else}
							{dateFormatter(dateRange.start.toDate(getLocalTimeZone()))}
						{/if}
					{:else if dateStartValue}
						{dateFormatter(dateStartValue.toDate(getLocalTimeZone()))}
					{:else}
						Pick date range
					{/if}
				</Popover.Trigger>
				<Popover.Content class="w-auto p-0" align="start">
					<RangeCalendar
						bind:value={dateRange}
						onStartValueChange={(v) => (dateStartValue = v)}
						numberOfMonths={2}
					/>
				</Popover.Content>
			</Popover.Root>
		</Card.Content>
	</Card.Root>


	<div class="grid gap-4 md:grid-cols-4">
		<Card.Root class="bg-blue-50">
			<Card.Content class="grid gap-2">
				<div
					class="text-sm text-blue-500 font-bold flex justify-between items-center"
				>
					<span>Total Values</span>
					<IndianRupee size="14" />
				</div>
				<p class="text-blue-800 text-3xl font-bold">
					{currencyFormatter(totalValue)}
				</p>
			</Card.Content>
		</Card.Root>
		<Card.Root class="bg-purple-50">
			<Card.Content class="grid gap-2">
				<div
					class="text-sm text-purple-500 font-bold flex justify-between items-center"
				>
					<span>Total Renewal Values</span>
					<RotateCcw size="14" />
				</div>
				<p class="text-purple-800 text-3xl font-bold">
					{currencyFormatter(totalRenewalValue)}
				</p>
			</Card.Content>
		</Card.Root>
		<Card.Root class="bg-orange-50">
			<Card.Content class="grid gap-2">
				<div
					class="text-sm text-orange-500 font-bold flex justify-between items-center"
				>
					<span>Total Subscriptions</span>
					<ClipboardList size="14" />
				</div>
				<p class="text-orange-800 text-3xl font-bold">{totalSubscriptions}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root class="bg-green-50">
			<Card.Content class="grid gap-2">
				<div
					class="text-sm text-green-500 font-bold flex justify-between items-center"
				>
					<span>Active Subscriptions</span>
					<Check size="14" />
				</div>
				<p class="text-green-800 text-3xl font-bold">{activeSubscrptions}</p>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid md:grid-cols-3 gap-4">
		<Card.Root class="border-0 border-l-3 border-orange-300 rounded-md">
			<Card.Content class="flex gap-3 items-center">
				<MonitorCheck size={40} class="text-orange-300" />
				<div>
					<p class="text-lg font-medium">Pending Approvals</p>
					<p class="text-sm text-muted-foreground">
						{pendingApprovals} Subscription{pendingApprovals !== 1 && "s"}
					</p>
				</div>
			</Card.Content>
		</Card.Root>
		<Card.Root class="border-0 border-l-3 border-green-500 rounded-md">
			<Card.Content class="flex gap-3 items-center">
				<CreditCard size={40} class="text-green-500" />
				<div>
					<p class="text-lg font-medium">Pending Payments</p>
					<p class="text-sm text-muted-foreground">
						{pendingPayments} Subscription{pendingPayments !== 1 && "s"}
					</p>
				</div>
			</Card.Content>
		</Card.Root>
		<Card.Root class="border-0 border-l-3 border-blue-500 rounded-md">
			<Card.Content class="flex gap-3 items-center">
				<RotateCcw size={40} class="text-blue-500" />
				<div>
					<p class="text-lg font-medium">Pending Renewals</p>
					<p class="text-sm text-muted-foreground">
						{pendingRenewals} Subscription{pendingRenewals !== 1 && "s"}
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	</div>


	<div class="grid md:flex gap-4">
		<Card.Root class="w-full md:max-w-150 h-full gap-3">
			<Card.Header>
				<Card.Title>Subscription Status</Card.Title>
			</Card.Header>
			<Card.Content>
				<Chart.Container config={chartConfig} class="mx-auto max-h-[200px]">
					<PieChart
						data={chartData}
						key="status"
						value="subscriptions"
						c="color"
						innerRadius={60}
						outerRadius={85}
						label={(d) =>
							d.status
								.split("")
								.map((c, i) => (i === 0 ? c.toUpperCase() : c))
								.join("")}
						padding={29}
						props={{ pie: { motion: "tween" } }}
						legend={{ placement: "left", orientation: "vertical" }}
					>
						{#snippet tooltip()}
							<Chart.Tooltip hideLabel />
						{/snippet}
						{#snippet arc({ props, index })}
							{@const arcProps =
								index === 1
									? { ...props, outerRadius: 60, innerRadius: 95 }
									: props}
							<Arc {...arcProps} />
						{/snippet}
					</PieChart>
				</Chart.Container>
			</Card.Content>
		</Card.Root>

		<Card.Root class="flex-grow gap-0">
			<Card.Header><Card.Title>Subscriptions Costs</Card.Title></Card.Header>
			<Card.Content class="">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Name</Table.Head>
							<Table.Head class="text-right">Price</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each constlySubscriptions as sub}
							<Table.Row>
								<Table.Cell class="text-primary font-semibold">{sub.subscriptionName}</Table.Cell>
								<Table.Cell class="text-right">{currencyFormatter(parseInt(sub.price))}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	</div>
</div>
