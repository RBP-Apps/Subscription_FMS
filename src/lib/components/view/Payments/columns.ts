import SortingButton from "$lib/components/element/SortingButton.svelte";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import PaymentButton from "./action-button.svelte";
import { createRawSnippet } from "svelte";

export type PendingPaymentsData = {
	subscriptionNo: string;
	company: string;
	subscriptionName: string;
	subscriberName: string;
	purpose: string;
	price: string;
	frequency: string;
	approvedOn: Date;
};

export type paymentHistoryData = {
	paymentDate: Date;
	subscriptionNo: string;
	subscriber: string;
	company: string;
	paymentMode: string;
	transactionId: string;
	insuranceDocument: string;
	startDate: Date;
};

export const pendingPaymentsColumns: ColumnDef<PendingPaymentsData>[] = [
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
			renderComponent(PaymentButton, { currentRow: row.original }),
	},
	{
		accessorKey: "subscriptionNo",
		header: "Subscription No",
	},
	{
		accessorKey: "company",
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
		accessorKey: "purpose",
		header: "Description",
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
		accessorKey: "approvedOn",
		header: ({ column }) =>
			renderComponent(SortingButton, {
				header: "Approved On",
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
				formatter.format(row.getValue("approvedOn")),
			);
		},
	},
];

export const paymentHistoryColumns: ColumnDef<paymentHistoryData>[] = [
	{
		accessorKey: "paymentDate",
		header: ({ column }) =>
			renderComponent(SortingButton, {
				header: "Payment Date",
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
				formatter.format(row.getValue("paymentDate")),
			);
		},
	},
	{
		accessorKey: "subscriptionNo",
		header: "Subscription No",
	},
	{
		accessorKey: "subscriber",
		header: "Subscriber",
	},
	{
		accessorKey: "company",
		header: "Company",
	},
	{
		accessorKey: "paymentMode",
		header: "Payment Mode",
	},
	{
		accessorKey: "transactionId",
		header: "Transaction ID",
	},
	{
		accessorKey: "insuranceDocument",
		header: "Insurance Document",
		cell: ({ row }) => {
			const cellSnippet = createRawSnippet((getUrl: () => string) => ({
				render: () => {
					if (!getUrl()) {
						return `<span class="text-muted-foreground">N/A</span>`;
					}
					return `<a class="font-semibold text-accent-foreground underline" href="${getUrl()}">File</a>`;
				},
			}));

			return renderSnippet(cellSnippet, row.getValue("insuranceDocument"));
		},
	},
	{
		accessorKey: "startDate",
		header: ({ column }) =>
			renderComponent(SortingButton, {
				header: "Start Date",
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
				formatter.format(row.getValue("startDate")),
			);
		},
	},
];
