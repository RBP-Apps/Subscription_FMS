<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import { getContext } from "svelte";
	import type { PendingPaymentsData } from "./columns";
	import z from "zod";
	import { createForm } from "felte";
	import { validator } from "@felte/validator-zod";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";
	import * as RadioGroup from "$lib/components/ui/radio-group";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { cn } from "$lib/utils/cn";
	import { CreditCard, Landmark, Smartphone } from "@lucide/svelte";
	import Spinner from "$lib/components/element/Spinner.svelte";
	import { calculateEndDate } from "$lib/utils/parsers";
	import { postSheet, uploadFile } from "$lib/api";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { toast } from "svelte-sonner";

	const sheetState = useSheets();

	const dialogState: {
		selectedRow: PendingPaymentsData;
		open: boolean;
	} = getContext(Symbol.for("dialog-state"));

	const currencyFormatter = Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format;

	// Update schema to include price as a string
	const schema = z.object({
		price: z.string().min(1, "Price is required"),
		paymentMethod: z.enum(
			["Credit Card", "Bank Transfer", "UPI"],
			"Please select a valid payment method",
		),
		transactionId: z.string(),
		startDate: z.coerce.date("Please fill the start date"),
		endDate: z.coerce.date("Please fill the end date"),
		insuranceDocument: z.file().optional(),
		paymentRiciept: z.file().optional(),
	});

	// Initialize with empty values first
	let initialValues = {
		price: "",
		paymentMethod: undefined,
		transactionId: "",
		startDate: undefined,
		endDate: undefined,
		insuranceDocument: undefined,
		paymentRiciept: undefined,
	};

	// Update initial values when dialogState is available using $effect
	$effect(() => {
		if (dialogState?.selectedRow) {
			initialValues = {
				...initialValues,
				price: dialogState.selectedRow.price || "",
			};
		}
	});

	const { form, setTouched, reset, setFields, data, errors, isSubmitting } =
		createForm<z.infer<typeof schema>>({
			extend: [validator({ schema })],
			initialValues,
			onSubmit: async (values) => {
				if (!dialogState?.selectedRow) {
					toast.error("No subscription selected");
					return;
				}

				let fileUrl = "";
				let receiptUrl = "";

				if (values.insuranceDocument) {
					fileUrl = await uploadFile(
						values.insuranceDocument,
						import.meta.env.VITE_ATTACHMENT_FOLDER,
					);
				}

				if (values.paymentRiciept) {
					receiptUrl = await uploadFile(
						values.paymentRiciept,
						import.meta.env.VITE_ATTACHMENT_FOLDER,
					);
				}

				const currentRow = sheetState.subscriptionSheet.find(
					(s) => s.subscriptionNo === dialogState.selectedRow.subscriptionNo,
				);

				if (!currentRow) {
					toast.error("Subscription not found!");
					return;
				}

				await postSheet({
					action: "update",
					rows: [
						{
							sheetName: "SUBSCRIPTION",
							rowIndex: currentRow.rowIndex,
							timestamp: currentRow.timestamp,
							companyName: currentRow.companyName,
							subscriberName: currentRow.subscriberName,
							subscriptionName: currentRow.subscriptionName,
							frequency: currentRow.frequency,
							purpose: currentRow.purpose,
							actual2: currentRow.actual2,
							approvalStatus: currentRow.approvalStatus,
							policyNo: currentRow.policyNo,
							agentName: currentRow.agentName,
							fileUpload: currentRow.fileUpload,
							price: values.price,
							actual3: new Date().toISOString().split("T")[0],
						},
					],
				});

				await postSheet({
					action: "insert",
					rows: [
						{
							sheetName: "PAYMENT",
							timestamp: new Date().toISOString(),
							subscriptionNo: currentRow.subscriptionNo,
							paymentMode: values.paymentMethod,
							transactionId:
								values.transactionId ||
								`TSI-${(sheetState.paymentSheet.length + 1)
									.toString()
									.padStart(4, "0")}`,
							startDate: new Date(values.startDate).toISOString(),
							endDate: new Date(values.endDate).toISOString(),
							updatedPrice: values.price,
							insuranceDocument: fileUrl,
							paymentRiciept: receiptUrl,
						},
					],
				});

				await sheetState.updateSubscription();
				await sheetState.updatePayment();

				dialogState.open = false;
				toast.success("Successfully updated payment and price");
			},
		});

	// Function to handle start date change and auto-calculate end date
	function handleStartDateChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const startDate = target.value;

		if (startDate && dialogState?.selectedRow) {
			const calculatedEndDate = calculateEndDate(
				startDate,
				dialogState.selectedRow.frequency as any,
			);

			setFields("endDate", calculatedEndDate as any);
		}
	}

	// Reset form when dialog opens with new data using $effect
	$effect(() => {
		if (dialogState?.open && dialogState?.selectedRow) {
			setFields("price", dialogState.selectedRow.price || "");
		}
	});
</script>

<Dialog.Content
	class="w-[1200px] max-h-[90vh] overflow-y-auto"
	onclose={() => reset()}
>
	{#if dialogState?.selectedRow}
		<form use:form class="space-y-4">
			<Dialog.Header>
				<Dialog.Title>Payment for Subscription</Dialog.Title>
				<Dialog.Description
					>Subscription <span class="font-semibold"
						>{dialogState.selectedRow.subscriptionNo}</span
					></Dialog.Description
				>
			</Dialog.Header>

			<div class="grid grid-cols-2 gap-4">
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
					<p class="text-sm text-muted-foreground font-semibold">Frequency</p>
					<p class="p-2 border rounded-md bg-muted/50 text-sm">
						{dialogState.selectedRow.frequency}
					</p>
				</div>

				<div class="grid gap-1">
					<p class="text-sm text-muted-foreground font-semibold">
						Current Price
					</p>
					<p class="p-2 border rounded-md bg-muted/50 text-sm">
						{currencyFormatter(parseFloat(dialogState.selectedRow.price))}
					</p>
				</div>

				<div class="grid gap-2 col-span-2">
					<Label for="price">New Price *</Label>
					<Tooltip.Root disabled={!$errors.price}>
						<Tooltip.Trigger>
							<Input
								name="price"
								id="price"
								type="text"
								placeholder="Enter new price"
								value={$data.price}
								class="w-full"
							/>
						</Tooltip.Trigger>
						<Tooltip.Content>{$errors.price}</Tooltip.Content>
					</Tooltip.Root>
				</div>

				<div class="grid gap-1 col-span-2">
					<p class="text-sm text-muted-foreground font-semibold">Description</p>
					<p class="p-2 border rounded-md bg-muted/50 text-sm min-h-[60px]">
						{dialogState.selectedRow.purpose}
					</p>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="startDate">Start Date *</Label>
					<Tooltip.Root disabled={!$errors.startDate}>
						<Tooltip.Trigger>
							<Input
								name="startDate"
								id="startDate"
								type="date"
								onchange={handleStartDateChange}
								class="w-full"
							/>
						</Tooltip.Trigger>
						<Tooltip.Content>{$errors.startDate}</Tooltip.Content>
					</Tooltip.Root>
				</div>

				<div class="grid gap-2">
					<Label for="endDate">End Date *</Label>
					<Tooltip.Root disabled={!$errors.endDate}>
						<Tooltip.Trigger>
							<Input
								name="endDate"
								id="endDate"
								type="date"
								onchange={() => setTouched("endDate", true)}
								class="w-full"
							/>
						</Tooltip.Trigger>
						<Tooltip.Content>{$errors.endDate}</Tooltip.Content>
					</Tooltip.Root>
				</div>
			</div>

			<div class="grid gap-2">
				<Label>Payment Method *</Label>
				<Tooltip.Root disabled={!$errors.paymentMethod}>
					<Tooltip.Trigger>
						<RadioGroup.Root
							name="paymentMethod"
							class="grid grid-cols-1 gap-2"
							value={$data.paymentMethod as string}
							onValueChange={(val) => {
								$data.paymentMethod = val as
									| "Credit Card"
									| "Bank Transfer"
									| "UPI";
								setTouched("paymentMethod", true);
							}}
						>
							<div class="w-full">
								<RadioGroup.Item
									value="Credit Card"
									id="credit-card"
									class="hidden"
								/>
								<Label
									class={cn(
										"border text-center px-3 py-2 flex gap-2 items-center text-sm rounded-sm",
										$data.paymentMethod === "Credit Card" &&
											"outline outline-primary bg-primary/5",
										$errors.paymentMethod && "outline outline-destructive",
									)}
									for="credit-card"
									><CreditCard size={18} /><span>Credit Card</span></Label
								>
							</div>
							<div class="w-full">
								<RadioGroup.Item
									value="Bank Transfer"
									id="bank-transfer"
									class="hidden"
								/>
								<Label
									class={cn(
										"border text-center px-3 py-2 flex gap-2 items-center text-sm rounded-sm",
										$data.paymentMethod === "Bank Transfer" &&
											"outline outline-primary bg-primary/5",
										$errors.paymentMethod && "outline outline-destructive",
									)}
									for="bank-transfer"
									><Landmark size={18} /><span>Bank Transfer</span></Label
								>
							</div>
							<div class="w-full">
								<RadioGroup.Item value="UPI" id="upi" class="hidden" />
								<Label
									class={cn(
										"border text-center px-3 py-2 flex gap-2 items-center text-sm rounded-sm",
										$data.paymentMethod === "UPI" &&
											"outline outline-primary bg-primary/5",
										$errors.paymentMethod && "outline outline-destructive",
									)}
									for="upi"><Smartphone size={18} /><span>UPI</span></Label
								>
							</div>
						</RadioGroup.Root>
					</Tooltip.Trigger>
					<Tooltip.Content>{$errors.paymentMethod}</Tooltip.Content>
				</Tooltip.Root>
			</div>

			<div class="grid grid-cols-1 gap-4">
				<div class="grid gap-2">
					<Label for="transactionId">Transaction ID</Label>
					<Input
						name="transactionId"
						id="transactionId"
						placeholder="Enter transaction ID, if available"
						class="w-full"
					/>
				</div>

				<div class="grid gap-2">
					<Label for="insuranceDocument">Upload Insurance Document</Label>
					<Tooltip.Root disabled={!$errors.insuranceDocument}>
						<Tooltip.Trigger>
							<Input
								name="insuranceDocument"
								id="insuranceDocument"
								placeholder="Upload insurance document"
								type="file"
								class="w-full"
							/>
						</Tooltip.Trigger>
						<Tooltip.Content>{$errors.insuranceDocument}</Tooltip.Content>
					</Tooltip.Root>
				</div>

				<div class="grid gap-2">
					<Label for="paymentRiciept">Upload Payment Receipt</Label>
					<Tooltip.Root disabled={!$errors.paymentRiciept}>
						<Tooltip.Trigger>
							<Input
								name="paymentRiciept"
								id="paymentRiciept"
								placeholder="Upload payment receipt"
								type="file"
								class="w-full"
							/>
						</Tooltip.Trigger>
						<Tooltip.Content>{$errors.paymentRiciept}</Tooltip.Content>
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
	{:else}
		<div class="p-4 text-center">
			<p>No subscription selected</p>
		</div>
	{/if}
</Dialog.Content>
