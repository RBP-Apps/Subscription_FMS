import SortingButton from "$lib/components/element/SortingButton.svelte";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table";
import { Pill } from "$lib/components/ui/pill";
import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";

export type SubscriptionData = {
	subscriptionNo: string;
	companyName: string;
	subscriberName: string;
	subscriptionName: string;
	price: string;
	endDate: Date;
	status: string;
};

export const subscriptionColumns: ColumnDef<SubscriptionData>[] = [
	{
		accessorKey: "subscriptionNo",
		header: "Subscription No",
		enableGlobalFilter: false,
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
		accessorKey: "startDate",
		enableGlobalFilter: false,
		header: ({ column }) =>
			renderComponent(SortingButton, {
				header: "Start Date",
				onclick: column.getToggleSortingHandler(),
			}),
		cell: ({ row }) => {
			const formatter = Intl.DateTimeFormat("en-IN", {
				dateStyle: "medium",
			});
			const value = row.getValue("startDate") as Date;
			const cellSnippet = createRawSnippet((getDate: () => string) => ({
				render: () => `<p>${getDate()}</p>`,
			}));
			return renderSnippet(
				cellSnippet,
				isNaN(value.getTime())
					? "Not yet decided"
					: formatter.format(row.getValue("startDate")),
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
			const value = row.getValue("endDate") as Date;
			const cellSnippet = createRawSnippet((getDate: () => string) => ({
				render: () => `<p>${getDate()}</p>`,
			}));
			return renderSnippet(
				cellSnippet,
				isNaN(value.getTime())
					? "Not yet decided"
					: formatter.format(row.getValue("endDate")),
			);
		},
	},

	{
		accessorKey: "status",
		header: () => {
			const headerSnippet = createRawSnippet(() => ({
				render: () => `<div class="text-center">Status</div>`,
			}));

			return renderSnippet(headerSnippet, "");
		},
		cell: ({ row }) => {
			const textSnippet = createRawSnippet(() => ({
				render: () => `<div>${row.original.status}</div>`,
			}));

			const statusVariants: Record<
				string,
				"primary" | "warning" | "success" | "destructive"
			> = {
				Created: "primary",
				Renewal: "primary",
				Approved: "warning",
				Active: "success",
				Rejected: "destructive",
				Ended: "destructive",
				Expired: "destructive",
			};

			return renderComponent(Pill, {
				children: textSnippet,
				variant: statusVariants[row.original.status],
			});
		},
	},
];
