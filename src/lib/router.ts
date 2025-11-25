import { createRouter, type RouteMeta } from "sv-router";
import Dashboard from "$lib/components/view/Dashboard.svelte";
import Login from "$lib/components/view/Login.svelte";
import SidebarLayout from "$lib/components/element/SidebarLayout.svelte";
import NotFound from "$lib/components/element/NotFound.svelte";
import Loading from "$lib/components/element/Loading.svelte";
import {
	ClipboardList,
	CreditCard,
	Home,
	MonitorCheck,
	RotateCcw,
	TicketPlus,
	Users,
} from "@lucide/svelte";
import NewSubscription from "$lib/components/view/NewSubscription.svelte";
import PendingApproval from "$lib/components/view/PendingApproval/page.svelte";
import Payments from "$lib/components/view/Payments/page.svelte";
import Renewals from "$lib/components/view/Renewals/page.svelte";
import UserManagement from "$lib/components/view/UserManagement/page.svelte";
import MySubscriptions from "$lib/components/view/MySubscription/page.svelte";
import type { SubscriptionRow } from "./types/sheets";

export const routes = {
	"/app": {
		"/": {
			"/": Dashboard,
			meta: {
				title: "Dashboard",
				subtext: "View your Subscription analytics",
				icon: Home,
				admin: false,
			},
		},

		"/new-subscription": {
			"/": NewSubscription,
			meta: {
				title: "Add Subscription",
				subtext: "Fill in the details to request a new subscription",
				icon: TicketPlus,
				admin: false,
			},
		},
		"/my-subscriptions": {
			"/": MySubscriptions,
			meta: {
				title: "My Subscriptions",
				subtext: "Manage and track all your subscription services",
				icon: ClipboardList,
				admin: false,
			},
		},
		"/renewals": {
			"/": Renewals,
			meta: {
				title: "Renewals",
				subtext: "Renew subscriptions that have passed end date",
				icon: RotateCcw,
				admin: false,
				notifications: (sheets: SubscriptionRow[]) =>
					sheets.filter((s) => s.planned1 !== "" && s.actual1 === "").length,
			},
		},
		"/pending-approvals": {
			"/": PendingApproval,
			meta: {
				title: "Pending Approval",
				subtext: "Subscriptions requests pending for approval",
				icon: MonitorCheck,
				admin: true,
				notifications: (sheets: SubscriptionRow[]) =>
					sheets.filter((s) => s.actual2 === "" && s.planned2 !== "").length,
			},
		},
		"/payments": {
			"/": Payments,
			meta: {
				title: "Payments",
				subtext: "Manage and process payments for approved subscriptions",
				icon: CreditCard,
				admin: false,
				notifications: (sheets: SubscriptionRow[]) =>
					sheets.filter((s) => s.actual3 === "" && s.planned3 !== "").length,
			},
		},
		"/user-management": {
			"/": UserManagement,
			meta: {
				title: "User Management",
				subtext: "Manage user accounts and permissions",
				icon: Users,
				admin: true,
			},
		},
		layout: SidebarLayout,
	},
	"/auth/login": Login,
	"*": NotFound,
	layout: Loading,
};

export const { isActive, navigate, p, route } = createRouter(routes);
