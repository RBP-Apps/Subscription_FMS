<script lang="ts" generics="TData, TValue">
	import {
		type ColumnDef,
		type ColumnFiltersState,
		getCoreRowModel,
		getFilteredRowModel,
		getSortedRowModel,
		type GlobalFilterTableState,
		type SortingState,
	} from "@tanstack/table-core";
	import { createSvelteTable, FlexRender } from "$lib/components/ui/data-table";
	import * as Table from "$lib/components/ui/table";
	import { Input } from "$lib/components/ui/input";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import { ScrollArea } from "$lib/components/ui/scroll-area";
	import { Clipboard } from "@lucide/svelte";
	import Button from "../ui/button/button.svelte";
	import type { Snippet } from "svelte";
	import { cn } from "$lib/utils/cn";

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		loading: boolean;
		children?: Snippet;
		class?: string;
	};

	let {
		data,
		columns,
		loading = $bindable(),
		children,
		class: className,
	}: DataTableProps<TData, TValue> = $props();
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let globalFilter = $state<GlobalFilterTableState>();
	let searchValue = $state("");
	$effect(() => {
		table.setGlobalFilter(searchValue);
	});

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		globalFilterFn: "includesString",
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: (updater) => {
			if (typeof updater === "function") {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === "function") {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onGlobalFilterChange: (updater) => {
			if (typeof updater === "function") {
				globalFilter = updater(globalFilter);
			} else {
				globalFilter = updater;
			}
		},
		state: {
			get sorting() {
				return sorting;
			},
			get columnFilters() {
				return columnFilters;
			},
			get globalFilter() {
				return globalFilter;
			},
		},
	});
</script>

<div class="grid gap-2 w-full">
	<div class="flex gap-2">
		<Input bind:value={searchValue} placeholder="Search..." />
		{@render children?.()}
	</div>

	<div class="relative max-w-full overflow-x-auto">
		<ScrollArea
			orientation="both"
			class={cn("rounded-sm border h-[80dvh] md:h-[75dvh]", className)}
		>
			<Table.Root>
				<Table.Header class="bg-muted sticky top-0 z-10">
					{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
						<Table.Row>
							{#each headerGroup.headers as header (header.id)}
								<Table.Head colspan={header.colSpan} class="font-medium">
									{#if !header.isPlaceholder}
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
									{/if}
								</Table.Head>
							{/each}
						</Table.Row>
					{/each}
				</Table.Header>
				<Table.Body>
					{#if loading}
						{#each Array.from({ length: 15 }) as _}
							<Table.Row>
								{#each columns as _}
									<Table.Cell>
										<Skeleton class="h-4 my-2 w-full" />
									</Table.Cell>
								{/each}
							</Table.Row>
						{/each}
					{:else}
						{#each table.getRowModel().rows as row (row.id)}
							<Table.Row data-state={row.getIsSelected() && "selected"}>
								{#each row.getVisibleCells() as cell (cell.id)}
									<Table.Cell>
										<FlexRender
											content={cell.column.columnDef.cell}
											context={cell.getContext()}
										/>
									</Table.Cell>
								{/each}
							</Table.Row>
						{:else}
							<Table.Row class="hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-transparent">
								<Table.Cell
									colspan={columns.length}
									class="h-[71dvh] text-center text-xl"
								>
									<div
										class="flex flex-col items-center justify-center w-full gap-1 font-semibold"
									>
										<Clipboard size={42} />
										No Data Available
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</ScrollArea>
	</div>
</div>
