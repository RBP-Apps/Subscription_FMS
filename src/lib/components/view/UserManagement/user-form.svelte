<script lang="ts">
	import * as Tooltip from "$lib/components/ui/tooltip";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Select from "$lib/components/ui/select";
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { validator } from "@felte/validator-zod";
	import { createForm } from "felte";
	import z from "zod";
	import type { UserData } from "./columns";
	import { getContext } from "svelte";
	import { Eye, EyeClosed } from "@lucide/svelte";
	import Spinner from "$lib/components/element/Spinner.svelte";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { postSheet } from "$lib/api";
	import { toast } from "svelte-sonner";

	const sheetState = useSheets();

	const dialogState: {
		selectedRow: UserData | undefined;
		open: boolean;
		typeForm: "Edit" | "Create";
	} = getContext(Symbol.for("dialog-state"));

	let passwordVisible = $state(false);

	const schema = z.object({
		username: z.string().nonempty("Please enter a username"),
		name: z.string().nonempty("Please enter a name"),
		password: z.string().nonempty("Please enter a password"),
		email: z.string().nonempty("Please enter an email"),
		role: z.enum(["admin", "user"], "Please select a valid user role"),
	});

	const { form, setTouched, setFields, reset, data, errors, isSubmitting } =
		createForm<z.infer<typeof schema>>({
			extend: [validator({ schema })],
			onSubmit: async (values) => {
				if (
					dialogState.typeForm === "Create" &&
					sheetState.userSheet.find((u) => u.username === values.username)
				) {
					throw Error("Username already exists");
				}
				if (
					dialogState.typeForm === "Edit" &&
					dialogState.selectedRow?.username !== values.username &&
					sheetState.userSheet.find((u) => u.username === values.username)
				) {
					throw Error("Username already exists");
				}

				if (dialogState.typeForm === "Create") {
					await postSheet({
						action: "insert",
						rows: [{ sheetName: "USER", ...values }],
					});
				} else {
					const currentRow = sheetState.userSheet.find(
						(u) => u.username === values.username,
					);
					await postSheet({
						action: "update",
						rows: [
							{
								...currentRow,
								...values,
							},
						],
					});
				}

				dialogState.open = false;
				sheetState.updateUser();
				toast.success(
					`Successfully ${dialogState.typeForm.toLowerCase()}ed user`,
				);
			},
			onError: (e: any) => {
				console.log(e);
				toast.error(e.message);
			},
		});
	$effect(() => {
		if (dialogState.open && dialogState.selectedRow) {
			setFields({
				email: dialogState.selectedRow.user.email,
				name: dialogState.selectedRow.user.name,
				password: dialogState.selectedRow.password,
				role: dialogState.selectedRow.role as "admin" | "user",
				username: dialogState.selectedRow.username,
			});
		} else if (dialogState.open && dialogState.selectedRow === undefined) {
			reset();
		}
	});
</script>

<Dialog.Content>
	<form use:form class="grid gap-4">
		<Dialog.Header>
			<Dialog.Title>{dialogState.typeForm} User</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4 md:grid-cols-2">
			<div class="grid gap-2">
				<Label for="username">Username</Label>
				<Tooltip.Root disabled={!$errors.username}>
					<Tooltip.Trigger>
						<Input name="username" id="username" placeholder="Enter username" />
					</Tooltip.Trigger>
					<Tooltip.Content>{$errors.username}</Tooltip.Content>
				</Tooltip.Root>
			</div>
			<div class="grid gap-2">
				<Label for="password">Password</Label>
				<Tooltip.Root disabled={!$errors.password}>
					<Tooltip.Trigger>
						<div class="relative">
							<Input
								name="password"
								id="passowrd"
								placeholder="Enter password"
								type={passwordVisible ? "text" : "password"}
							/>
							<Button
								class="absolute right-0 top-0 hover:bg-transparent"
								variant="ghost"
								size="icon"
								type="button"
								onclick={() => (passwordVisible = !passwordVisible)}
							>
								{#if passwordVisible}
									<EyeClosed />
								{:else}
									<Eye />
								{/if}
							</Button>
						</div>
					</Tooltip.Trigger>
					<Tooltip.Content>{$errors.password}</Tooltip.Content>
				</Tooltip.Root>
			</div>
			<div class="grid gap-2">
				<Label for="name">Name</Label>
				<Tooltip.Root disabled={!$errors.name}>
					<Tooltip.Trigger
						><Input
							name="name"
							id="name"
							placeholder="Enter name"
						/></Tooltip.Trigger
					>
					<Tooltip.Content>{$errors.name}</Tooltip.Content>
				</Tooltip.Root>
			</div>
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Tooltip.Root disabled={!$errors.email}>
					<Tooltip.Trigger
						><Input
							name="email"
							id="email"
							placeholder="Enter email"
						/></Tooltip.Trigger
					>
					<Tooltip.Content>{$errors.email}</Tooltip.Content>
				</Tooltip.Root>
			</div>
		</div>
		<div class="grid gap-2">
			<Label>Role of User</Label>
			<Select.Root
				name="role"
				type="single"
				bind:value={$data.role}
				onValueChange={() => setTouched("role", true)}
			>
				<Tooltip.Root disabled={!$errors.role}>
					<Tooltip.Trigger>
						<Select.Trigger
							aria-invalid={$errors.role ? true : undefined}
							class="w-full"
							>{$data.role
								? $data.role
								: "Select review option"}</Select.Trigger
						>
					</Tooltip.Trigger>
					<Tooltip.Content>{$errors.role}</Tooltip.Content>
				</Tooltip.Root>
				<Select.Content>
					<Select.Item value="admin">admin</Select.Item>
					<Select.Item value="user">user</Select.Item>
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
