<script lang="ts">
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import * as Select from "$lib/components/ui/select";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import Spinner from "$lib/components/element/Spinner.svelte";

	import { createForm } from "felte";
	import { validator } from "@felte/validator-zod";
	import { z } from "zod";
	import { postSheet, uploadFile } from "$lib/api";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { toast } from "svelte-sonner";
	import { useAuth } from "$lib/state/auth.svelte";

	let sheetState = useSheets();
	let authState = useAuth();

	// Simple file state using Svelte 5 runes
	let selectedFile = $state<File | null>(null);

	const schema = z.object({
		companyName: z.string().min(1, "Please enter company name"),
		subscriberName: z.string().min(1, "Please enter subscriber name"),
		subscriptionName: z.string().min(1, "Please enter subscription name"),
		price: z.preprocess(
			(val) => Number(val),
			z.number().gt(0, "The price should at least be 0"),
		),
		frequency: z.enum(
			["Monthly", "Annually", "Quarterly", "Semi-Annually"],
			"Please select a valid option",
		),
		policyNo: z.string().optional(),
		agentName: z.string().optional(),
		purpose: z.string().min(1, "Please enter the purpose"),
	});

	const { form, setFields, setTouched, errors, data, isSubmitting, reset } =
		createForm<z.infer<typeof schema>>({
			extend: [validator({ schema })],
			onSubmit: async ({
				companyName,
				frequency,
				price,
				purpose,
				subscriberName: subName,
				subscriptionName,
				policyNo,
				agentName,
			}) => {
				try {
					let subscriberName = subName;
					if (authState.user && authState.user?.role !== "admin") {
						subscriberName = authState.user.name;
					}

					const isNewCompany =
						!sheetState.masterSheet.companyName.includes(companyName);

					// File upload handling
					let fileUrl = "";

					console.log(
						"📎 File check before upload:",
						selectedFile?.name || "No file",
					);

					if (selectedFile) {
						const fileObject = selectedFile;

						// File validation
						const allowedTypes = [
							"application/pdf",
							"image/jpeg",
							"image/png",
							"application/msword",
							"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
							"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
						];

						if (!allowedTypes.includes(fileObject.type)) {
							toast.error(
								"File type not allowed. Please upload PDF, JPG, PNG, DOC, or XLSX files.",
							);
							return;
						}

						// File size validation (5MB)
						if (fileObject.size > 5 * 1024 * 1024) {
							toast.error("File size exceeds 5MB limit.");
							return;
						}

						try {
							console.log("Uploading file:", fileObject.name, fileObject.type);

							// Upload to the correct Google Drive folder from .env
							fileUrl = await uploadFile(
								fileObject,
								import.meta.env.VITE_ATTACHMENT_FOLDER,
							);

							console.log("File uploaded successfully! URL:", fileUrl);
							toast.success("File uploaded to Drive");
						} catch (uploadError) {
							console.error("Upload error:", uploadError);
							toast.warning("File upload failed, continuing without file...");
							// Continue without file
						}
					}

					const rows = [];

					// SUBSCRIPTION sheet data with Y, Z, AA columns
					const subscriptionRow = {
						sheetName: "SUBSCRIPTION",
						timestamp: new Date().toISOString(),
						price: price.toString(),
						companyName,
						frequency,
						purpose,
						subscriberName,
						subscriptionName,
						policyNo: policyNo || "", // Column Y
						agentName: agentName || "", // Column Z
						fileUpload: fileUrl || "", // Column AA - This is the file URL
					};
					rows.push(subscriptionRow);

					if (isNewCompany) {
						rows.push({
							sheetName: "MASTER",
							companyName,
						});
					}

					console.log("Submitting data:", rows);

					const response = await postSheet({
						action: "insert",
						rows,
					});

					console.log("Response:", response);
					sheetState.updateSubscription();
					toast.success("Request for new subscription has been submitted");

					// Reset file state
					selectedFile = null;
					reset();
				} catch (error) {
					console.error("Submission error:", error);
					toast.error(error?.message || "Failed to submit");
					throw error;
				}
			},
		});

	$effect(() => {
		if (authState.user && authState.user?.role !== "admin") {
			setFields("subscriberName", authState.user.name);
		}
	});

	// Handle file input change
	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];
			console.log("✅ File selected:", file.name, file.type, file.size);
			selectedFile = file;

			console.log("✅ State updated, file is now:", selectedFile?.name);
		} else {
			console.log("❌ No file selected");
			selectedFile = null;
		}
	}
</script>

<div class="h-full p-5 md:p-5 md:pt-0 pt-0">
	<form
		use:form
		class="md:p-10 bg-background p-5 sm:border h-full rounded-xl shadow-md"
	>
		<div class="grid gap-6">
			<div class="grid md:grid-cols-3 gap-6">
				<div class="grid gap-2">
					<Label for="companyName">Company Name</Label>
					<Tooltip.Root disabled={!$errors.companyName}>
						<Tooltip.Trigger>
							<Input
								list="company-list"
								name="companyName"
								id="companyName"
								placeholder="Select or enter company name"
								on:input={() => setTouched("companyName", true)}
							/>
							<datalist id="company-list">
								{#each sheetState.masterSheet.companyName as company}
									<option value={company}></option>
								{/each}
							</datalist>
						</Tooltip.Trigger>
						<Tooltip.Content>
							{$errors.companyName}
						</Tooltip.Content>
					</Tooltip.Root>
				</div>
				<div class="grid gap-2">
					<Label for="subscriberName">Subscriber Name</Label>
					{#if authState.user?.role === "admin"}
						<Select.Root
							type="single"
							bind:value={$data.subscriberName}
							name="subscriberName"
							onValueChange={() => setTouched("subscriberName", true)}
						>
							<Tooltip.Root disabled={!$errors.subscriberName}>
								<Tooltip.Trigger>
									<Select.Trigger
										class="w-full"
										aria-invalid={$errors.subscriberName ? true : undefined}
									>
										{$data.subscriberName
											? sheetState.userSheet.find(
													(s) => s.username === $data.subscriberName,
												)?.name
											: "Select Subscriber"}
									</Select.Trigger>
								</Tooltip.Trigger>
								<Tooltip.Content>
									{$errors.subscriberName}
								</Tooltip.Content>
							</Tooltip.Root>
							<Select.Content>
								{#each sheetState.userSheet as { username, name }}
									<Select.Item value={username}>{name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{:else}
						<Tooltip.Root disabled={!$errors.subscriberName}>
							<Tooltip.Trigger>
								<Input
									name="subscriberName"
									id="subscriberName"
									placeholder="Enter subscriber name"
									readonly
								/>
							</Tooltip.Trigger>
							<Tooltip.Content>{$errors.subscriberName}</Tooltip.Content>
						</Tooltip.Root>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="subscriptionName">Subscription Name</Label>
					<Tooltip.Root disabled={!$errors.subscriptionName}>
						<Tooltip.Trigger>
							<Input
								name="subscriptionName"
								id="subscriptionName"
								placeholder="Enter subscription name"
							/>
						</Tooltip.Trigger>
						<Tooltip.Content>{$errors.subscriptionName}</Tooltip.Content>
					</Tooltip.Root>
				</div>
			</div>
			<div class="grid sm:grid-cols-2 gap-6">
				<div class="grid gap-2">
					<Label for="price">Price (&#8377;)</Label>
					<Tooltip.Root disabled={!$errors.price}>
						<Tooltip.Trigger>
							<Input
								name="price"
								id="price"
								type="number"
								placeholder="Enter price"
							/>
						</Tooltip.Trigger>
						<Tooltip.Content>{$errors.price}</Tooltip.Content>
					</Tooltip.Root>
				</div>
				<div class="grid gap-2">
					<Label>Frequency</Label>
					<Select.Root
						type="single"
						bind:value={$data.frequency}
						name="frequency"
						onValueChange={() => setTouched("frequency", true)}
					>
						<Tooltip.Root disabled={!$errors.frequency}>
							<Tooltip.Trigger>
								<Select.Trigger
									class="w-full"
									aria-invalid={$errors.frequency ? true : undefined}
								>
									{$data.frequency ? $data.frequency : "Select frequency"}
								</Select.Trigger>
							</Tooltip.Trigger>
							<Tooltip.Content>
								{$errors.frequency}
							</Tooltip.Content>
						</Tooltip.Root>
						<Select.Content>
							<Select.Item value="Monthly">Monthly</Select.Item>
							<Select.Item value="Quarterly">Quarterly</Select.Item>
							<Select.Item value="Semi-Annually">Semi-Annually</Select.Item>
							<Select.Item value="Annually">Annually</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="grid sm:grid-cols-2 gap-6">
					<div class="grid gap-2">
						<Label for="policyNo">Policy No.</Label>
						<Tooltip.Root disabled={!$errors.policyNo}>
							<Tooltip.Trigger>
								<Input
									name="policyNo"
									id="policyNo"
									placeholder="Enter policy number"
								/>
							</Tooltip.Trigger>
							<Tooltip.Content>{$errors.policyNo}</Tooltip.Content>
						</Tooltip.Root>
					</div>
					<div class="grid gap-2">
						<Label for="agentName">Agent Name</Label>
						<Tooltip.Root disabled={!$errors.agentName}>
							<Tooltip.Trigger>
								<Input
									name="agentName"
									id="agentName"
									placeholder="Enter agent name"
								/>
							</Tooltip.Trigger>
							<Tooltip.Content>{$errors.agentName}</Tooltip.Content>
						</Tooltip.Root>
					</div>
				</div>
				<div class="grid gap-2">
					<Label for="file">Upload File (Optional)</Label>
					<input
						type="file"
						id="file"
						accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
						onchange={handleFileChange}
					/>
					{#if selectedFile}
						<p class="text-xs text-green-600 font-medium">
							✓ Selected: {selectedFile.name}
						</p>
					{/if}
					<p class="text-xs text-muted-foreground">
						Supported formats: PDF, JPG, PNG, DOC, XLSX (Max 5MB)
					</p>
				</div>
			</div>
			<div class="grid gap-2">
				<Label for="purpose">Purpose of Subscription</Label>
				<Tooltip.Root disabled={!$errors.purpose}>
					<Tooltip.Trigger>
						<Textarea
							class="min-h-30"
							name="purpose"
							id="purpose"
							placeholder="Enter the purpose of subscription"
						/>
					</Tooltip.Trigger>
					<Tooltip.Content>
						{$errors.purpose}
					</Tooltip.Content>
				</Tooltip.Root>
			</div>

			<Button type="submit" disabled={$isSubmitting}>
				{#if $isSubmitting}
					<Spinner /> Submitting
				{:else}
					Submit
				{/if}
			</Button>
		</div>
	</form>
</div>
