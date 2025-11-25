<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	import Spinner from "$lib/components/element/Spinner.svelte";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Select from "$lib/components/ui/select";
	import type { PendingRenewalData } from "./columns";
	import { getContext } from "svelte";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { validator } from "@felte/validator-zod";
	import { createForm } from "felte";
	import { z } from "zod";
	import { toast } from "svelte-sonner";
	import { postSheet } from "$lib/api";
	import { useAuth } from "$lib/state/auth.svelte";

	const sheetState = useSheets();
	const authState = useAuth();

	const dialogState: {
		selectedRow: PendingRenewalData;
		open: boolean;
	} = getContext(Symbol.for("dialog-state"));

	const schema = z.object({
		renew: z.enum(["Renewed", "Not Renewed"]),
	});

	const { form, setTouched, data, errors, isSubmitting } = createForm<
		z.infer<typeof schema>
	>({
		extend: [validator({ schema })],
		onSubmit: async (values) => {
			const currentRow = sheetState.subscriptionSheet.find(
				(s) => s.subscriptionNo === dialogState.selectedRow.subscriptionNo,
			)!;
			await postSheet({
				action: "update",
				rows: [
					{
						...currentRow,
						actual1: new Date().toISOString(),
						actual2: "",
						renewalCount: (
							(parseInt(currentRow.renewalCount) || 0) + 1
						).toString(),
						renewalStatus: values.renew,
					},
				],
			});

			await postSheet({
				action: "insert",
				rows: [
					{
						sheetName: "RENEWAL",
						renewalNo: `REN-${(sheetState.renewalSheet.length + 1).toString().padStart(4, "0")}`,
						timestamp: new Date().toISOString(),
						subscriptionNo: currentRow.subscriptionNo,
						approvedBy: authState.user?.name,
						renewalStatus: values.renew,
						price: currentRow.price
					},
				],
			});
			dialogState.open = false;
			sheetState.updateSubscription();
			sheetState.updateApproval();
			toast.success("Successfully renewed subscription");
		},
		onError: (e: any) => {
			console.log(e);
			toast.error(e.message);
		},
	});

	const currencyFormatter = Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format;

	const dateFormatter = Intl.DateTimeFormat("en-IN", {
		dateStyle: "medium",
	}).format;
</script>

<Dialog.Content>
	<form use:form class="grid gap-4">
		<Dialog.Header>
			<Dialog.Title>Renew Subscription</Dialog.Title>
			<Dialog.Description
				>Subscription <span class="font-semibold"
					>{dialogState.selectedRow.subscriptionNo}</span
				></Dialog.Description
			>
		</Dialog.Header>

		<div class="grid sm:grid-cols-2 gap-4">
			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">Company Name</p>
				<p>{dialogState.selectedRow.companyName}</p>
			</div>
			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">
					Subscriber Name
				</p>
				<p>{dialogState.selectedRow.subscriberName}</p>
			</div>
			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">
					Subscription Name
				</p>
				<p>{dialogState.selectedRow.subscriptionName}</p>
			</div>
			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">Price</p>
				<p>{currencyFormatter(parseFloat(dialogState.selectedRow.price))}</p>
			</div>
			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">Frequency</p>
				<p>{dialogState.selectedRow.frequency}</p>
			</div>
			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">End Date</p>
				<p class="text-destructive">
					{dateFormatter(dialogState.selectedRow.endDate)}
				</p>
			</div>
		</div>

		<div class="grid gap-2">
			<Label>Review Subscription</Label>
			<Select.Root
				name="renew"
				type="single"
				bind:value={$data.renew}
				onValueChange={() => setTouched("renew", true)}
			>
				<Tooltip.Root disabled={!$errors.renew}>
					<Tooltip.Trigger>
						<Select.Trigger
							aria-invalid={$errors.renew ? true : undefined}
							class="w-full"
							>{$data.renew
								? $data.renew
								: "Select renewal option"}</Select.Trigger
						>
					</Tooltip.Trigger>
					<Tooltip.Content>{$errors.renew}</Tooltip.Content>
				</Tooltip.Root>
				<Select.Content>
					<Select.Item value="Renewed">Renewed</Select.Item>
					<Select.Item value="Not Renewed">Not Renewed</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		<Dialog.Footer>
			<Button class="w-full" type="submit" disabled={$isSubmitting}>
				{#if $isSubmitting}
					<Spinner /> Submitting
				{:else}
					Submit
				{/if}
			</Button>
		</Dialog.Footer>
	</form>
</Dialog.Content>
