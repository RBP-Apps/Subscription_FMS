import { toCamelCase } from "$lib/utils/parsers";
import type {
	Sheets,
	SubscriptionRow,
	RenewalRow,
	ApprovalRow,
	PaymentRow,
	UserRow,
	Master,
} from "$lib/types/sheets";

interface FetchParams {
	sheet: Sheets;
	offset?: number;
	limit?: number;
}

type FetchData =
	| SubscriptionRow[]
	| RenewalRow[]
	| ApprovalRow[]
	| PaymentRow[]
	| UserRow[]
	| Master;

type FetchMeta = {
	offset: number;
	limit: number;
	nextOffset: number;
};

export default async function ({
	sheet,
	offset = 1,
	limit,
}: FetchParams): Promise<{ data: FetchData; meta: FetchMeta }> {
	let url = `${import.meta.env.VITE_APPS_SCRIPT
		}?sheetName=${sheet}&offset=${offset}`;
	if (limit) {
		url += `&limit=${limit}`;
	}

	const response = await fetch(url);

	if (!response.ok) throw Error("Failed to fetch data");
	let result = await response.json();
	if (!result.success) throw Error(result.message);

	const data: string[][] = result.values;
	const headerRow = sheet === "SUBSCRIPTION" ? 4 : 0;

	const headers = data[headerRow].map(toCamelCase);

	if (sheet === "MASTER") {
		return {
			meta: result.meta,
			data: {
				companyName: data.slice(1).map((row) => row[0]),
				subscriberName: data.slice(1).map((row) => row[1]),
			},
		};
	}

	return {
		meta: result.meta,
		data: data
			.slice(headerRow + 1)
			.filter((s) => s[0] !== "")
			.map((row, i) => {
				const obj = Object.fromEntries(
					headers.map((h, j) => {
						const value = row[j] ?? ""; // Ensure fallback to empty string if column is missing
						return [h, value];
					}),
				);

				obj.rowIndex = (i + headerRow + 2).toString();
				obj.sheetName = sheet;
				return obj;
			}) as FetchData,
	};
}
