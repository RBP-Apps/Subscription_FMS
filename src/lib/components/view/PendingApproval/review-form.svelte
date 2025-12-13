<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import { getContext } from "svelte";
	import type { PendingApprovalData } from "./columns";
	import z from "zod";
	import { createForm } from "felte";
	import { validator } from "@felte/validator-zod";
	import { Label } from "$lib/components/ui/label";
	import * as Select from "$lib/components/ui/select";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Button } from "$lib/components/ui/button";
	import { Tooltip } from "bits-ui";
	import Spinner from "$lib/components/element/Spinner.svelte";
	import { postSheet } from "$lib/api";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { useAuth } from "$lib/state/auth.svelte";
	import { toast } from "svelte-sonner";

	const sheetState = useSheets();
	const authState = useAuth();

	const dialogState: {
		selectedRow: PendingApprovalData;
		open: boolean;
	} = getContext(Symbol.for("dialog-state"));

	const currencyFormatter = Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format;

	const dateFormatter = Intl.DateTimeFormat("en-IN", {
		dateStyle: "medium",
	}).format;

	const schema = z.object({
		approval: z.enum(
			["Approved", "Rejected"],
			"Please select valid approval option",
		),
		note: z.string(),
	});

	// ✅ Helper function to calculate next payment date
	const getNextPaymentDate = (frequency: string) => {
		const date = new Date();
		switch(frequency.toLowerCase()) {
			case 'monthly':
				date.setMonth(date.getMonth() + 1);
				break;
			case 'quarterly':
				date.setMonth(date.getMonth() + 3);
				break;
			case 'yearly':
				date.setFullYear(date.getFullYear() + 1);
				break;
			default:
				date.setMonth(date.getMonth() + 1); // Default to monthly
		}
		return date.toISOString();
	};

	const { form, setTouched, data, errors, isSubmitting, reset } = createForm<
		z.infer<typeof schema>
	>({
		extra: [validator({ schema })],
		onSubmit: async (values) => {
			try {
				const currentRow = sheetState.subscriptionSheet.find(
					(s) => s.subscriptionNo === dialogState.selectedRow.subscriptionNo,
				)!;

				// ✅ Remove subscriptionNo, startDate (U), endDate (V) - these should NEVER be updated
				const { subscriptionNo, startDate, endDate, ...rowWithoutExcludedFields } = currentRow;

				// ✅ Update SUBSCRIPTION - WITHOUT startDate & endDate
				await postSheet({
					action: "update",
					rows: [
						{
							...rowWithoutExcludedFields,
							companyName: dialogState.selectedRow.companyName,
							subscriberName: currentRow.subscriberName,
							subscriptionName: dialogState.selectedRow.subscriptionName,
							price: dialogState.selectedRow.price,
							frequency: dialogState.selectedRow.frequency,
							purpose: dialogState.selectedRow.purpose,
							actual2: new Date().toISOString(),
							 actual3: currentRow.actual3,
							approvalStatus: values.approval,
							planned3: values.approval === "Approved" 
								? getNextPaymentDate(currentRow.frequency)
								: "",
						},
					],
				});

				// ✅ Insert APPROVAL log
				await postSheet({
					action: "insert",
					rows: [
						{
							sheetName: "APPROVAL",
							timestamp: new Date().toISOString(),
							approvalNo: `APG-${(sheetState.approvalSheet.length + 1).toString().padStart(4, "0")}`,
							subscriptionNo: dialogState.selectedRow.subscriptionNo,
							approvedBy: authState.user?.name,
							approvalStatus: values.approval,
							requestedOn: dialogState.selectedRow.requestedOn.toISOString(),
							note: values.note,
						},
					],
				});

				   await sheetState.updateSubscription();
        await sheetState.updateApproval();
        
        dialogState.open = false;
        toast.success("Successfully updated status");

    } catch (e: any) {
        console.error(e);
        toast.error("Something went wrong!");
    }
},
	});
</script>

<Dialog.Content
	class="w-[1200px] max-h-[90vh] overflow-y-auto"
	onclose={() => reset()}
>
	<form use:form class="space-y-4">
		<Dialog.Header>
			<Dialog.Title>Review Subscription Request</Dialog.Title>
			<Dialog.Description
				>Subscription <span class="font-semibold"
					>{dialogState.selectedRow.subscriptionNo}</span
				></Dialog.Description
			>
		</Dialog.Header>

		<div class="grid grid-cols-2 gap-4">
			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">Company Name</p>
				<p class="p-2 border rounded-md bg-muted/50 text-sm">
					{dialogState.selectedRow.companyName}
				</p>
			</div>

			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">
					Subscriber Name
				</p>
				<p class="p-2 border rounded-md bg-muted/50 text-sm">
					{dialogState.selectedRow.subscriberName}
				</p>
			</div>

			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">
					Subscription Name
				</p>
				<p class="p-2 border rounded-md bg-muted/50 text-sm">
					{dialogState.selectedRow.subscriptionName}
				</p>
			</div>

			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">Price</p>
				<p class="p-2 border rounded-md bg-muted/50 text-sm">
					{currencyFormatter(parseFloat(dialogState.selectedRow.price))}
				</p>
			</div>

			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">Frequency</p>
				<p class="p-2 border rounded-md bg-muted/50 text-sm">
					{dialogState.selectedRow.frequency}
				</p>
			</div>

			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">Requested On</p>
				<p class="p-2 border rounded-md bg-muted/50 text-sm">
					{dateFormatter(dialogState.selectedRow.requestedOn)}
				</p>
			</div>

			<div class="grid gap-1 col-span-2">
				<p class="text-sm text-muted-foreground font-semibold">
					Purpose of Subscription
				</p>
				<p class="p-2 border rounded-md bg-muted/50 text-sm min-h-[60px]">
					{dialogState.selectedRow.purpose}
				</p>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-4 pt-4">
			<div class="grid gap-2">
				<Label>Review Subscription *</Label>
				<Select.Root
					name="approval"
					type="single"
					bind:value={$data.approval}
					onValueChange={() => setTouched("approval", true)}
				>
					<Tooltip.Root disabled={!$errors.approval}>
						<Tooltip.Trigger>
							<Select.Trigger
								aria-invalid={$errors.approval ? true : undefined}
								class="w-full"
								>{$data.approval
									? $data.approval
									: "Select review option"}</Select.Trigger
							>
						</Tooltip.Trigger>
						<Tooltip.Content>{$errors.approval}</Tooltip.Content>
					</Tooltip.Root>
					<Select.Content>
						<Select.Item value="Approved">Approve</Select.Item>
						<Select.Item value="Rejected">Reject</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="grid gap-2">
				<Label for="note">Note (Optional)</Label>
				<Tooltip.Root disabled={!$errors.note}>
					<Tooltip.Trigger>
						<Textarea
							name="note"
							id="note"
							bind:value={$data.note}
							placeholder="Enter a note"
							class="h-full"
						/>
					</Tooltip.Trigger>
				</Tooltip.Root>
			</div>
		</div>

		<Dialog.Footer class="pt-4">
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