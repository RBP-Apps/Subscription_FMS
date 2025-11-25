import type {
	ApprovalRow,
	Master,
	PaymentRow,
	RenewalRow,
	Sheets,
	SubscriptionRow,
	UserRow,
} from "$lib/types/sheets";
import { toCamelCase } from "$lib/utils/parsers";

type FetchData = {
	subscriptionSheet: SubscriptionRow[];
	renewalSheet: RenewalRow[];
	approvalSheet: ApprovalRow[];
	paymentSheet: PaymentRow[];
	userSheet: UserRow[];
	masterSheet: Master;
};

type ParseData =
	| SubscriptionRow[]
	| RenewalRow[]
	| ApprovalRow[]
	| PaymentRow[]
	| UserRow[]
	| Master;

function parseSheet(sheet: Sheets, data: string[][]): ParseData {
	const headerRow = sheet === "SUBSCRIPTION" ? 4 : 0;

	const headers = data[headerRow].map(toCamelCase);

	if (sheet === "MASTER") {
		return {
			companyName: data
				.slice(1)
				.map((row) => row[0])
				.filter((x) => x !== ""),
		} as Master;
	}

	return data
		.slice(headerRow + 1)
		.filter((s) => s[0] !== "")
		.map((row, i) => {
			const obj = Object.fromEntries(
				headers.map((h, j) => {
					const value = row[j];
					return [h, value];
				}),
			);

			obj.rowIndex = (i + headerRow + 2).toString();
			obj.sheetName = sheet;
			return obj;
		}) as Exclude<ParseData, Master>;
}

export default async function (): Promise<FetchData> {
	let url = `${import.meta.env.VITE_APPS_SCRIPT}?sheetName=ALL`;

	const response = await fetch(url);

	if (!response.ok) throw Error("Failed to fetch data");
	let result = await response.json();
	if (!result.success) throw Error(result.message);

	const values = result.values;
	return {
		subscriptionSheet: parseSheet(
			"SUBSCRIPTION",
			values.subscriptionSheet,
		) as SubscriptionRow[],
		renewalSheet: parseSheet("RENEWAL", values.renewalSheet) as RenewalRow[],
		approvalSheet: parseSheet(
			"APPROVAL",
			values.approvalSheet,
		) as ApprovalRow[],
		paymentSheet: parseSheet("PAYMENT", values.paymentSheet) as PaymentRow[],
		userSheet: parseSheet("USER", values.userSheet) as UserRow[],
		masterSheet: parseSheet("MASTER", values.masterSheet) as Master,
	};
}
