import { renderSnippet, renderComponent } from "$lib/components/ui/data-table";
import SortingButton from "$lib/components/element/SortingButton.svelte";
import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import ActionButton from "./action-button.svelte";
import { Pill } from "$lib/components/ui/pill";

export type PendingRenewalData = {
	subscriptionNo: string;
	companyName: string;
	subscriberName: string;
	subscriptionName: string;
	frequency: string;
	price: string;
	endDate: Date;
};

export type RenewalHistoryData = {
	renewalNo: string;
	subscriptionNo: string;
	companyName: string;
	subscriberName: string;
	subscriptionName: string;
	frequency: string;
	price: string;
	renewalStatus: string;
	renewalDate: Date;
};

export const pendingRenewalColumns: ColumnDef<PendingRenewalData>[] = [
	{
		id: "action",
		header: () =>
			renderSnippet(
				createRawSnippet(() => ({
					render: () => `<div class="text-center">Action</div>`,
				})),
			),
		enableGlobalFilter: false,
		cell: ({ row }) =>
			renderComponent(ActionButton, { currentRow: row.original }),
	},
	{
		accessorKey: "subscriptionNo",
		header: "Subscription No",
	},
	{
		accessorKey: "companyName",
		header: "Company",
	},
	{
		accessorKey: "subscriberName",
		header: "Subscriber",
	},
	{
		accessorKey: "subscriptionName",
		header: "Subscription",
		cell: ({ row }) => {
			const cellSnippet = createRawSnippet((getName: () => string) => ({
				render: () => `<div class="text-primary font-bold">${getName()}</div>`,
			}));
			return renderSnippet(cellSnippet, row.getValue("subscriptionName"));
		},
	},
	{
		accessorKey: "frequency",
		header: "Frequency",
	},
	{
		accessorKey: "price",
		header: ({ column }) =>
			renderComponent(SortingButton, {
				header: "Price",
				onclick: column.getToggleSortingHandler(),
				justify: "end",
			}),
		cell: ({ row }) => {
			const formatter = Intl.NumberFormat("en-IN", {
				style: "currency",
				currency: "INR",
			});

			const cellSnippet = createRawSnippet((getAmount: () => string) => ({
				render: () => `<div class="text-right font-bold">${getAmount()}</div>`,
			}));

			return renderSnippet(
				cellSnippet,
				formatter.format(parseFloat(row.getValue("price"))),
			);
		},
	},
	{
		accessorKey: "endDate",
		enableGlobalFilter: false,
		header: ({ column }) =>
			renderComponent(SortingButton, {
				header: "End Date",
				onclick: column.getToggleSortingHandler(),
			}),
		cell: ({ row }) => {
			const formatter = Intl.DateTimeFormat("en-IN", {
				dateStyle: "medium",
			});

			const cellSnippet = createRawSnippet((getDate: () => string) => ({
				render: () => `<p>${getDate()}</p>`,
			}));
			return renderSnippet(
				cellSnippet,
				formatter.format(row.getValue("endDate")),
			);
		},
	},
];

export const renewalHistoryColumns: ColumnDef<RenewalHistoryData>[] = [
	{
		accessorKey: "renewalDate",
		enableGlobalFilter: false,
		header: ({ column }) =>
			renderComponent(SortingButton, {
				header: "Renewal Date",
				onclick: column.getToggleSortingHandler(),
			}),
		cell: ({ row }) => {
			const formatter = Intl.DateTimeFormat("en-IN", {
				dateStyle: "medium",
			});

			const cellSnippet = createRawSnippet((getDate: () => string) => ({
				render: () => `<p>${getDate()}</p>`,
			}));
			return renderSnippet(
				cellSnippet,
				formatter.format(row.getValue("renewalDate")),
			);
		},
	},
	{
		accessorKey: "renewalNo",
		header: "Renewal No",
	},
	{
		accessorKey: "subscriptionNo",
		header: "Subscription No",
	},
	{
		accessorKey: "companyName",
		header: "Company",
	},
	{
		accessorKey: "subscriberName",
		header: "Subscriber",
	},
	{
		accessorKey: "subscriptionName",
		header: "Subscription",
		cell: ({ row }) => {
			const cellSnippet = createRawSnippet((getName: () => string) => ({
				render: () => `<div class="text-primary font-bold">${getName()}</div>`,
			}));
			return renderSnippet(cellSnippet, row.getValue("subscriptionName"));
		},
	},
	{
		accessorKey: "frequency",
		header: "Frequency",
	},
	{
		accessorKey: "renewalStatus",
		header: () => {
			const headerSnippet = createRawSnippet(() => ({
				render: () => `<div class="text-center">Status</div>`,
			}));

			return renderSnippet(headerSnippet, "");
		},
		cell: ({ row }) => {
			const textSnippet = createRawSnippet(() => ({
				render: () => `<div>${row.original.renewalStatus}</div>`,
			}));

			return renderComponent(Pill, {
				children: textSnippet,
				variant:
					row.original.renewalStatus === "Renewed" ? "success" : "destructive",
			});
		},
	},
	{
		accessorKey: "price",
		header: ({ column }) =>
			renderComponent(SortingButton, {
				header: "Price",
				onclick: column.getToggleSortingHandler(),
				justify: "end",
			}),
		cell: ({ row }) => {
			const formatter = Intl.NumberFormat("en-IN", {
				style: "currency",
				currency: "INR",
			});

			const cellSnippet = createRawSnippet((getAmount: () => string) => ({
				render: () => `<div class="text-right font-bold">${getAmount()}</div>`,
			}));

			return renderSnippet(
				cellSnippet,
				formatter.format(parseFloat(row.getValue("price"))),
			);
		},
	},
];
