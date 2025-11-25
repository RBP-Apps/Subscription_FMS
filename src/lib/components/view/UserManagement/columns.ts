import SortingButton from "$lib/components/element/SortingButton.svelte";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table";
import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import UserInfo from "./user-info.svelte";
import ActionButton from "./action-button.svelte";

export type UserData = {
	user: {
		name: string;
		email: string;
	};
	username: string;
	role: string;
	password: string;
	lastLogin: Date;
};

export const userColumns: ColumnDef<UserData>[] = [
	{
		accessorKey: "action",
		header: "",
		cell: ({ row }) => {
			return renderComponent(ActionButton, {
				currentRow: row.original,
			});
		},
	},
	{
		accessorKey: "user",
		header: "User",
		cell: ({ row }) => {
			return renderComponent(UserInfo, row.getValue("user"));
		},
	},
	{
		accessorKey: "username",
		header: "Username",
	},
	{
		accessorKey: "role",
		header: "Role",
	},
	{
		accessorKey: "lastLogin",
		enableGlobalFilter: false,
		header: ({ column }) =>
			renderComponent(SortingButton, {
				header: "Last Login",
				onclick: column.getToggleSortingHandler(),
			}),
		cell: ({ row }) => {
			const formatter = Intl.DateTimeFormat("en-IN", {
				dateStyle: "medium",
				timeStyle: "medium",
			});
			const value = row.getValue("lastLogin") as Date;
			const cellSnippet = createRawSnippet((getDate: () => string) => ({
				render: () => `<p>${getDate()}</p>`,
			}));
			return renderSnippet(
				cellSnippet,
				isNaN(value.getTime()) ? "No login yet" : formatter.format(value),
			);
		},
	},
];
