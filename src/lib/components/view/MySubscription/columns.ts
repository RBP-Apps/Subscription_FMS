import SortingButton from "$lib/components/element/SortingButton.svelte";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table";
import { Pill } from "$lib/components/ui/pill";
import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import ActionButton from "./action-button.svelte";
import FileCell from "./file-cell.svelte";

export type SubscriptionData = {
	subscriptionNo: string;
	companyName: string;
	subscriberName: string;
	subscriptionName: string;
	policyNo: string;
	agentName: string;
	fileUpload: string;
	price: string;
	startDate: Date;
	endDate: Date;
	status: string;
	raw: any;
};

export const subscriptionColumns: ColumnDef<SubscriptionData>[] = [
	{
		id: "action",
		header: () =>
			renderSnippet(
				createRawSnippet(() => ({
					render: () => `<div class="text-center">Action</div>`,
				})),
				"",
			),
		cell: ({ row }) =>
			renderComponent(ActionButton, { currentRow: row.original }),
		enableGlobalFilter: false,
	},
	{
		accessorKey: "subscriptionNo",
		header: "Subscription No.",
		enableGlobalFilter: false,
	},
	{
		accessorKey: "companyName",
		header: "Company Name",
	},
	{
		accessorKey: "subscriberName",
		header: "Subscriber Name",
	},
	{
		accessorKey: "subscriptionName",
		header: "Product Name",
		cell: ({ row }) => {
			const cellSnippet = createRawSnippet((getName: () => string) => ({
				render: () => `<div class="text-primary font-bold">${getName()}</div>`,
			}));
			return renderSnippet(cellSnippet, row.getValue("subscriptionName"));
		},
	},
	{
		accessorKey: "policyNo",
		header: "Policy No.",
	},
	{
		accessorKey: "agentName",
		header: "Agent Name",
	},
	{
		accessorKey: "fileUpload",
		header: "Upload File",
		cell: ({ row }) => {
			return renderComponent(FileCell, { url: row.getValue("fileUpload") || "" });
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
				!value || isNaN(value.getTime())
					? "Not yet decided"
					: formatter.format(value),
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
				!value || isNaN(value.getTime())
					? "Not yet decided"
					: formatter.format(value),
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
