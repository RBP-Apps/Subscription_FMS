import {
	type SubscriptionRow,
	type RenewalRow,
	type ApprovalRow,
	type PaymentRow,
	type UserRow,
	type Sheets,
	subscriptionHeaders,
	renewalHeaders,
	approvalHeaders,
	paymentHeaders,
	userHeaders,
} from "$lib/types/sheets";

const headers = {
	SUBSCRIPTION: subscriptionHeaders,
	RENEWAL: renewalHeaders,
	APPROVAL: approvalHeaders,
	PAYMENT: paymentHeaders,
	USER: userHeaders,
	MASTER: ["companyName"],
};

type Rows = SubscriptionRow | RenewalRow | ApprovalRow | PaymentRow | UserRow;

interface PostParams {
	action: "insert" | "update" | "delete";
	rows: Partial<
	Rows & { rowIndex: string; sheetName: Exclude<Sheets, never> }
	>[];
}

export default async function ({ rows, action = "insert" }: PostParams) {
	const formData = new FormData();
	const rowsData = rows.map((row) => {
		const values: Partial<string | null>[] = headers[row.sheetName!].map(
			(h) => {
				const val = (row[h as keyof typeof row] as string) ?? "";
				if (h.startsWith("timeDelay") || h.startsWith("planned")) {
					return null;
				}
				return val;
			},
		);
		return {
			sheetName: row.sheetName,
			rowIndex: row.rowIndex,
			values,
		};
	});
	formData.append("action", action);
	formData.append("rows", JSON.stringify(rowsData));

	const response = await fetch(import.meta.env.VITE_APPS_SCRIPT, {
		body: formData,
		method: "POST",
	});

	if (!response.ok) throw new Error("Failed to post data");
	const result = await response.json();
	if (!result.success) throw new Error(result.message);
	return result;
}
