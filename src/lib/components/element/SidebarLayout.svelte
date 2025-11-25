<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar";
	import Logo from "$lib/components/element/Logo.svelte";
	import { Button } from "$lib/components/ui/button";
	import { routes, navigate, isActive, route } from "$lib/router";
	import type { Component } from "svelte";
	import type { RouteMeta } from "sv-router";
	import { useAuth } from "$lib/state/auth.svelte";
	import { setSheet } from "$lib/state/sheets.svelte";
	import { LogOut, RotateCcw } from "@lucide/svelte";
	import * as Avatar from "$lib/components/ui/avatar";

	let { children } = $props();

	let authState = useAuth();
	let sheetState = setSheet();

	const items = Object.entries(routes["/app"])
		.filter((r: any) => {
			const view = true;
			if (r[1]?.meta?.admin) {
				if (authState.user?.role !== "admin") {
					return false;
				}
			}
			return r[0] !== "layout" && view;
		})
		.map(([p, r]) => {
			const { meta } = r as {
				"/": Component;
				meta: RouteMeta;
			};

			return {
				path: `/app${p}`,
				...meta,
			} as { path: "/app/" } & RouteMeta;
		});
</script>

<Sidebar.Provider>
	<Sidebar.Root variant="inset" collapsible="offcanvas" class="px-2">
		<Sidebar.Header>
			<div class="flex justify-between">
				<div class="flex items-center gap-3">
					<Logo />
					<h1 class="font-bold text-base text-primary">
						<p>Subscription</p>
						<p>Manager</p>
					</h1>
				</div>
				<Button
					variant="ghost"
					size="icon"
					disabled={sheetState.allLoading}
					onclick={() => sheetState.updateAll()}><RotateCcw /></Button
				>
			</div>
		</Sidebar.Header>

		<Sidebar.Separator />

		<Sidebar.Content class="my-2">
			<Sidebar.Menu class="space-y-1">
				{#each items as { path, title, icon, notifications } (path)}
					{@const Icon = icon}
					{@const notifs = notifications?.(sheetState.subscriptionSheet)}
					<Sidebar.MenuItem class="flex flex-col items-center">
						<Sidebar.MenuButton
							class="flex items-center justify-between w-full p-3 py-4"
							isActive={isActive(path)}
							onclick={() => {
								navigate(path);
							}}
						>
							<div class="flex items-center gap-2">
								<Icon size={20} />
								{title}
							</div>
							{#if notifs}
								<span class="text-secondary-foreground font-bold">
									{notifs}
								</span>
							{/if}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Content>
		<Sidebar.Separator />
		<Sidebar.Footer>
			<div class="grid gap-2">
				<div class="flex gap-2 items-center">
					<Avatar.Root class="border border-foreground">
						<Avatar.Fallback>{authState.user?.name.charAt(0)}</Avatar.Fallback>
					</Avatar.Root>
					<div class="text-xs text-muted-foreground">
						<p>
							Name: <span class="font-semibold">{authState.user?.name}</span>
						</p>
						<p>
							Username: <span class="font-semibold"
								>{authState.user?.username}</span
							>
						</p>
					</div>
				</div>
				<Button variant="outline" onclick={() => authState.logout()}
					><LogOut /> Logout</Button
				>
			</div>
			<Sidebar.Separator />
			<p class="text-sm text-center">
				Powered by - <a
					class="text-primary underline"
					href="https://botivate.in"
					target="_blank">Botivate</a
				>
			</p>
		</Sidebar.Footer>
	</Sidebar.Root>

	<Sidebar.Inset>
		<main class="bg-secondary min-h-full rounded-xl flex flex-col">
			{#snippet header()}
				{@const Icon = route.meta.icon}
				<header
					class=" text-secondary-foreground p-5 flex justify-between items-center"
				>
					<div class="flex gap-4 items-center">
						<Icon size={50} />
						<div>
							<p class="font-extrabold text-2xl">
								{route.meta.title}
							</p>
							<p class="text-sm">{route.meta.subtext}</p>
						</div>
					</div>
					<Sidebar.SidebarTrigger />
				</header>
			{/snippet}
			{@render header()}
			<div class="flex-1">
				{@render children()}
			</div>
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
