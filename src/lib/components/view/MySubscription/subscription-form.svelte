<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import Spinner from "$lib/components/element/Spinner.svelte";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import * as Dialog from "$lib/components/ui/dialog";
	import type { SubscriptionData } from "./columns";
	import { getContext } from "svelte";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { validator } from "@felte/validator-zod";
	import { createForm } from "felte";
	import { z } from "zod";
	import { toast } from "svelte-sonner";
	import { postSheet, uploadFile } from "$lib/api";

	const sheetState = useSheets();

	const dialogState: {
		selectedRow: SubscriptionData;
		open: boolean;
	} = getContext(Symbol.for("dialog-state"));

	// Simple file state using Svelte 5 runes
	let selectedFile = $state<File | null>(null);

	const schema = z.object({
		subscriptionName: z.string().min(1, "Please enter product name"),
		price: z.preprocess(
			(val) => Number(val),
			z.number().gt(0, "The price should at least be 0"),
		),
		policyNo: z.string().optional(),
		agentName: z.string().optional(),
		purpose: z.string().min(1, "Please enter the purpose"),
	});

	const { form, setFields, setTouched, errors, data, isSubmitting } =
		createForm<z.infer<typeof schema>>({
			extend: [validator({ schema })],
			initialValues: {
				subscriptionName: dialogState.selectedRow?.subscriptionName || "",
				price: parseFloat(dialogState.selectedRow?.price || "0"),
				policyNo: dialogState.selectedRow?.policyNo || "",
				agentName: dialogState.selectedRow?.agentName || "",
				purpose: dialogState.selectedRow?.raw?.purpose || "",
			},
			onSubmit: async (values) => {
				try {
					const currentRow = sheetState.subscriptionSheet.find(
						(s) => s.subscriptionNo === dialogState.selectedRow.subscriptionNo,
					);

					if (!currentRow) {
						toast.error("Subscription not found");
						return;
					}

					let fileUrl = dialogState.selectedRow.fileUpload;

					if (selectedFile) {
						try {
							fileUrl = await uploadFile(
								selectedFile,
								import.meta.env.VITE_ATTACHMENT_FOLDER,
							);
							toast.success("File uploaded successfully");
						} catch (uploadError) {
							console.error("Upload error:", uploadError);
							toast.warning("File upload failed, keeping existing file...");
						}
					}

					await postSheet({
						action: "update",
						rows: [
							{
								...currentRow,
								sheetName: "SUBSCRIPTION",
								subscriptionName: values.subscriptionName,
								price: values.price.toString(),
								policyNo: values.policyNo || "",
								agentName: values.agentName || "",
								purpose: values.purpose,
								fileUpload: fileUrl,
							},
						],
					});

					await sheetState.updateSubscription();
					dialogState.open = false;
					toast.success("Subscription updated successfully");
				} catch (error) {
					console.error("Update error:", error);
					toast.error("Failed to update subscription");
				}
			},
		});

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			selectedFile = target.files[0];
		}
	}
</script>

<Dialog.Content class="sm:max-w-[500px]">
	<form use:form class="grid gap-4 py-4">
		<Dialog.Header>
			<Dialog.Title>Update Subscription</Dialog.Title>
			<Dialog.Description>
				Update details for <span class="font-semibold">{dialogState.selectedRow.subscriptionNo}</span>
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-2">
			<Label for="subscriptionName">Product Name</Label>
			<Tooltip.Root disabled={!$errors.subscriptionName}>
				<Tooltip.Trigger class="w-full">
					<Input
						name="subscriptionName"
						id="subscriptionName"
						placeholder="Enter product name"
						class="w-full"
					/>
				</Tooltip.Trigger>
				<Tooltip.Content>{$errors.subscriptionName}</Tooltip.Content>
			</Tooltip.Root>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div class="grid gap-2">
				<Label for="price">Price (&#8377;)</Label>
				<Tooltip.Root disabled={!$errors.price}>
					<Tooltip.Trigger class="w-full">
						<Input
							name="price"
							id="price"
							type="number"
							placeholder="Enter price"
							class="w-full"
						/>
					</Tooltip.Trigger>
					<Tooltip.Content>{$errors.price}</Tooltip.Content>
				</Tooltip.Root>
			</div>
			<div class="grid gap-2">
				<Label for="policyNo">Policy No.</Label>
				<Input
					name="policyNo"
					id="policyNo"
					placeholder="Enter policy number"
				/>
			</div>
		</div>

		<div class="grid gap-2">
			<Label for="agentName">Agent Name</Label>
			<Input
				name="agentName"
				id="agentName"
				placeholder="Enter agent name"
			/>
		</div>

		<div class="grid gap-2">
			<Label for="file">Update File</Label>
			<input
				type="file"
				id="file"
				accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx"
				class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
				onchange={handleFileChange}
			/>
			{#if dialogState.selectedRow.fileUpload}
				<p class="text-xs text-muted-foreground">
					Current file: <a href={dialogState.selectedRow.fileUpload} target="_blank" class="text-primary underline">View</a>
				</p>
			{/if}
		</div>

		<div class="grid gap-2">
			<Label for="purpose">Purpose</Label>
			<Tooltip.Root disabled={!$errors.purpose}>
				<Tooltip.Trigger class="w-full">
					<Textarea
						name="purpose"
						id="purpose"
						placeholder="Enter the purpose"
						class="min-h-[80px]"
					/>
				</Tooltip.Trigger>
				<Tooltip.Content>{$errors.purpose}</Tooltip.Content>
			</Tooltip.Root>
		</div>

		<Dialog.Footer>
			<Button type="submit" disabled={$isSubmitting} class="w-full">
				{#if $isSubmitting}
					<Spinner /> Updating
				{:else}
					Update Subscription
				{/if}
			</Button>
		</Dialog.Footer>
	</form>
</Dialog.Content>
