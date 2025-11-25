import { renderComponent, renderSnippet } from "$lib/components/ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import ReviewButton from "./action-button.svelte";
import SortingButton from "$lib/components/element/SortingButton.svelte";
import { Pill } from "$lib/components/ui/pill";

export type PendingApprovalData = {
	subscriptionNo: string;
	companyName: string;
	subscriberName: string;
	subscriptionName: string;
	price: string;
	frequency: string;
	requestedOn: Date;
	purpose: string;
};

export type ApprovalHistoryData = {
	approvalNo: string;
	subscriptionNo: string;
	companyName: string;
	subscriberName: string;
	subscriptionName: string;
	price: string;
	frequency: string;
	purpose: string;
	approvalStatus: string;
	requestedOn: Date;
	reviewedOn: Date;
};

export const pendingApprovalColumns: ColumnDef<PendingApprovalData>[] = [
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
			renderComponent(ReviewButton, { currentRow: row.original }),
	},
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
		accessorKey: "frequency",
		header: "Frequency",
	},
	{
		accessorKey: "requestedOn",
		enableGlobalFilter: false,
		header: ({ column }) =>
			renderComponent(SortingButton, {
				header: "Requested On",
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
				formatter.format(row.getValue("requestedOn")),
			);
		},
	},
];

export const approvalHistoryColumns: ColumnDef<ApprovalHistoryData>[] = [
	{
		accessorKey: "approvalNo",
		header: "Approval No",
		enableGlobalFilter: false,
	},
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
				end: true,
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
		accessorKey: "frequency",
		header: "Frequency",
	},
	{
		accessorKey: "purpose",
		header: () => {
			const headerSnippet = createRawSnippet(() => ({
				render: () => `<div class="text-center">Purpose</div>`,
			}));

			return renderSnippet(headerSnippet, "");
		},
		cell: ({ row }) => {
			const cellSnippet = createRawSnippet((getPurpose: () => string) => ({
				render: () =>
					`<div class="flex justify-center"><div class="text-wrap text-center max-w-50 w-full bg-muted text-muted-foreground rounded-sm">${getPurpose()}</div></div>`,
			}));

			return renderSnippet(cellSnippet, row.getValue("purpose"));
		},
	},

	{
		accessorKey: "approvalStatus",
		header: () => {
			const headerSnippet = createRawSnippet(() => ({
				render: () => `<div class="text-center">Status</div>`,
			}));

			return renderSnippet(headerSnippet, "");
		},
		cell: ({ row }) => {
			const textSnippet = createRawSnippet(() => ({
				render: () => `<div>${row.original.approvalStatus}</div>`,
			}));

			return renderComponent(Pill, {
				children: textSnippet,
				variant:
					row.original.approvalStatus === "Approved"
						? "success"
						: "destructive",
			});
		},
	},

	{
		accessorKey: "requestedOn",
		enableGlobalFilter: false,
		header: ({ column }) =>
			renderComponent(SortingButton, {
				header: "Requested On",
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
				formatter.format(row.getValue("requestedOn")),
			);
		},
	},
	{
		accessorKey: "reviewedOn",
		enableGlobalFilter: false,
		header: ({ column }) =>
			renderComponent(SortingButton, {
				header: "Reviewed On",
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
				formatter.format(row.getValue("reviewedOn")),
			);
		},
	},
];
