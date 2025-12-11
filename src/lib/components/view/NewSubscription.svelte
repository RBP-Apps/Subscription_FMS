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
	import { postSheet } from "$lib/api";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { toast } from "svelte-sonner";
	import { useAuth } from "$lib/state/auth.svelte";

	let sheetState = useSheets();
	let authState = useAuth();

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
		purpose: z.string().min(1, "Please enter the purpose"),
	});

	const {
		form,
		setFields,
		setTouched,
		errors,
		data,
		isSubmitting,
		reset,
	} = // Add reset here
		createForm<z.infer<typeof schema>>({
			extend: [validator({ schema })],
		onSubmit: async ({
    companyName,
    frequency,
    price,
    purpose,
    subscriberName: subName,
    subscriptionName,
}) => {
    try {
        let subscriberName = subName;
        if (authState.user && authState.user?.role !== "admin") {
            subscriberName = authState.user.name;
        }

        // Check if company name is new and add it to master sheet
        const isNewCompany = !sheetState.masterSheet.companyName.includes(companyName);
        
        const rows = [
            {
                sheetName: "SUBSCRIPTION",
                timestamp: new Date().toISOString(),
                price: price.toString(),
                companyName,
                frequency,
                purpose,
                subscriberName,
                subscriptionName,
            },
        ];

        // If new company, add it to MASTER sheet
        if (isNewCompany) {
            rows.push({
                sheetName: "MASTER",
                companyName,
            });
        }

        console.log("Submitting data:", rows); // Debug log

        const response = await postSheet({
            action: "insert",
            rows,
        });
        
        console.log("Response:", response); // Debug log
        
        sheetState.updateSubscription();
        toast.success("Request for new subscription has been submitted");
        reset();
    } catch (error) {
        console.error("Submission error:", error); // Error log
        toast.error(error?.message || "Failed to submit");
        throw error; // Re-throw to trigger onError
    }
},
		});

	$effect(() => {
		if (authState.user && authState.user?.role !== "admin") {
			setFields("subscriberName", authState.user.name);
		}
	});
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
