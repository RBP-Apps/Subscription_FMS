import "sv-router";
import { Icon } from "@lucide/svelte";
import type { SubscriptionRow } from "$lib/types/sheets";

declare module "sv-router" {
	interface RouteMeta {
		title: string;
		subtext: string;
		icon: typeof Icon;
		admin: boolean;
		notifications?: (sheets: SubscriptionRow[]) => number;
	}
}
