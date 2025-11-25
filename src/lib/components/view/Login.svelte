<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import Logo from "$lib/components/element/Logo.svelte";
	import { Eye, EyeClosed } from "@lucide/svelte";
	import { z } from "zod";
	import { validator } from "@felte/validator-zod";
	import { createForm } from "felte";
	import { useAuth } from "$lib/state/auth.svelte";
	import Spinner from "$lib/components/element/Spinner.svelte";
	import { toast } from "svelte-sonner";
	import { navigate } from "$lib/router";

	const authState = useAuth();

	let showPassword = $state(false);

	const schema = z.object({
		username: z.string().nonempty("Please fill the username"),
		password: z.string().nonempty("Please fill the password"),
	});

	const { form, errors, isSubmitting } = createForm<z.infer<typeof schema>>({
		extend: [validator({ schema })],
		onSubmit: async (values) => {
			if (await authState.login(values)) {
				toast.success("Logged In successfully");
			} else {
				throw Error("Invalid username or password");
			}
		},
		onError: (e: any) => {
			console.log(e);
			toast.error(e.message);
		},
	});

	$effect(() => {
		if (authState.loggedin) {
			navigate("/app/");
			return;
		}
	});
</script>

<form use:form>
	<div class="w-full h-screen grid place-items-center bg-sidebar">
		<Card.Root class="min-h-fit">
			<Card.Header class="flex flex-col items-center">
				<Logo size={42} />
				<Card.Title class="text-xl">Subscription Manager</Card.Title>
				<Card.Description>Please login to your account</Card.Description>
			</Card.Header>
			<Card.Content class="md:min-w-100 grid gap-4">
				<div class="grid gap-2">
					<Label for="username">Username</Label>
					<Tooltip.Root disabled={Boolean(!$errors.username)}>
						<Tooltip.Trigger>
							<Input
								id="username"
								name="username"
								placeholder="Enter your username"
							/>
						</Tooltip.Trigger>
						<Tooltip.Content>{$errors.username}</Tooltip.Content>
					</Tooltip.Root>
				</div>
				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<Tooltip.Root disabled={Boolean(!$errors.password)}>
						<Tooltip.Trigger>
							<div class="relative">
								<Input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
								/>
								<Button
									class="absolute right-0 top-0 hover:bg-transparent"
									variant="ghost"
									type="button"
									onclick={(e) => {
										e.preventDefault();
										showPassword = !showPassword;
									}}
								>
									{#if showPassword}
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
			</Card.Content>
			<Card.Footer>
				<Button type="submit" class="w-full" disabled={$isSubmitting}>
					{#if $isSubmitting}
						<Spinner /> Logging in
					{:else}
						Login
					{/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	</div>
</form>
