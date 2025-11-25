import type { SubscriptionRow } from "$lib/types/sheets";

export function toCamelCase(str: string) {
	if (typeof str !== "string" || str.trim() === "") {
		return "";
	}

	return str
		.trim()
		.replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
		.replace(/\s+/g, " ") // Normalize multiple spaces
		.toLowerCase() // Make everything lowercase
		.split(" ") // Split into words
		.map((word, index) => {
			if (index === 0) return word;
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join("");
}

export function getStatus(row: SubscriptionRow): string {
	if (
		row.renewalStatus !== "Renewed" &&
		row.planned2 !== "" &&
		row.actual2 === ""
	) {
		return "Created";
	} else if (
		row.renewalStatus === "Renewed" &&
		row.planned2 !== "" &&
		row.actual2 === ""
	) {
		return "Renewal";
	} else if (row.planned3 === "" && row.actual2 !== "") {
		return "Rejected";
	} else if (row.planned3 !== "" && row.actual3 === "") {
		return "Approved";
	} else if (row.endDate !== "" && new Date(row.endDate) > new Date()) {
		return "Active";
	} else if (row.planned1 !== "" && row.actual1 === "") {
		return "Ended";
	} else if (
		row.planned1 !== "" &&
		row.actual1 !== "" &&
		row.renewalStatus !== "Renewed"
	) {
		return "Expired";
	}
	return "";
}

export function getInitials(name: string) {
	return name
		.split(" ")
		.filter((word) => word.length > 0)
		.map((word) => word[0].toUpperCase())
		.join("");
}

export function calculateEndDate(
	startDateString: string,
	frequency: "Annually" | "Semi-Annually" | "Quarterly" | "Monthly",
): string {
	// Returns a string
	// 1. Parse the start date string (yyyy-mm-dd) into a Date object
	const parts = startDateString.split("-");
	if (parts.length !== 3) {
		return ""; // Return empty string for invalid format
	}

	const year = parseInt(parts[0], 10); // First part is now year
	const month = parseInt(parts[1], 10); // Second part is month (1-indexed from input)
	const day = parseInt(parts[2], 10); // Third part is day

	// Create a Date object. Month in Date constructor is 0-indexed (0-11).
	const startDate = new Date(year, month - 1, day);

	// Validate if the parsed date is a valid date
	// Check if year, month, and day match the input after Date object normalization
	if (
		isNaN(startDate.getTime()) || // Checks for "Invalid Date"
		startDate.getFullYear() !== year ||
		startDate.getMonth() !== month - 1 ||
		startDate.getDate() !== day
	) {
		return ""; // Return empty string for invalid date value
	}

	// Create a mutable copy of the date to perform calculations
	const endDate = new Date(startDate);

	// 2. Calculate the end date based on frequency
	switch (frequency) {
		case "Annually":
			endDate.setFullYear(endDate.getFullYear() + 1);
			break;
		case "Semi-Annually":
			endDate.setMonth(endDate.getMonth() + 6);
			break;
		case "Quarterly":
			endDate.setMonth(endDate.getMonth() + 3);
			break;
		case "Monthly":
			endDate.setMonth(endDate.getMonth() + 1);
			break;
		default:
			return ""; // Return empty string for invalid frequency
	}

	// 3. Format the end date back to "yyyy-mm-dd"
	// Manually construct the string to ensure yyyy-mm-dd format regardless of locale
	const newYear = endDate.getFullYear();
	const newMonth = String(endDate.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed, so add 1
	const newDay = String(endDate.getDate()).padStart(2, "0");

	return `${newYear}-${newMonth}-${newDay}`;
}
