import { fetchAll, fetchSheet } from "$lib/api";
import type {
	ApprovalRow,
	PaymentRow,
	RenewalRow,
	SubscriptionRow,
	UserRow,
	Master,
} from "$lib/types/sheets";
import { getContext, setContext } from "svelte";
import { toast } from "svelte-sonner";

export class SheetState {
	subscriptionSheet = $state<SubscriptionRow[]>([]);
	renewalSheet = $state<RenewalRow[]>([]);
	approvalSheet = $state<ApprovalRow[]>([]);
	paymentSheet = $state<PaymentRow[]>([]);
	userSheet = $state<UserRow[]>([]);
	masterSheet = $state<Master>({ companyName: [] });

	subscriptionLoading = $state(true);
	renewalLoading = $state(true);
	approvalLoading = $state(true);
	paymentLoading = $state(true);
	userLoading = $state(true);
	allLoading = $state(true);

	async updateSubscription() {
		this.subscriptionLoading = true;
		try {
			const { data: res } = await fetchSheet({ sheet: "SUBSCRIPTION" });
			this.subscriptionSheet = res as SubscriptionRow[];
		} catch (e) {
			throw e;
		} finally {
			this.subscriptionLoading = false;
		}
	}

	async updateRenewal() {
		this.renewalLoading = true;
		try {
			const { data: res } = await fetchSheet({ sheet: "RENEWAL" });
			this.renewalSheet = res as RenewalRow[];
		} catch (e) {
			throw e;
		} finally {
			this.renewalLoading = false;
		}
	}

	async updateApproval() {
		this.approvalLoading = true;
		const { data: res } = await fetchSheet({ sheet: "APPROVAL" });
		this.approvalSheet = res as ApprovalRow[];
		this.approvalLoading = false;
	}

	async updatePayment() {
		this.paymentLoading = true;
		try {
			const { data: res } = await fetchSheet({ sheet: "PAYMENT" });
			this.paymentSheet = res as PaymentRow[];
		} catch (e) {
			throw e;
		} finally {
			this.paymentLoading = false;
		}
	}

	async updateUser() {
		this.userLoading = true;
		try {
			const { data: res } = await fetchSheet({ sheet: "USER" });
			this.userSheet = res as UserRow[];
		} catch (e) {
			throw e;
		} finally {
			this.userLoading = false;
		}
	}

	async updateMaster() {
		const { data: res } = await fetchSheet({ sheet: "USER" });
		this.masterSheet = res as Master;
	}

	async updateAll() {
		this.subscriptionLoading = true;
		this.renewalLoading = true;
		this.approvalLoading = true;
		this.paymentLoading = true;
		this.userLoading = true;
		this.allLoading = true;
		try {
			const {
				approvalSheet,
				masterSheet,
				paymentSheet,
				renewalSheet,
				subscriptionSheet,
				userSheet,
			} = await fetchAll();
			this.subscriptionSheet = subscriptionSheet;
			this.renewalSheet = renewalSheet;
			this.approvalSheet = approvalSheet;
			this.paymentSheet = paymentSheet;
			this.userSheet = userSheet;
			this.masterSheet = masterSheet;
		} catch (e) {
			throw e;
		} finally {
			this.subscriptionLoading = false;
			this.renewalLoading = false;
			this.approvalLoading = false;
			this.paymentLoading = false;
			this.userLoading = false;
			this.allLoading = false;
		}
	}

	constructor() {
		toast.promise(this.updateAll(), {
			loading: "Fetching data from sheets",
			success: "Fetched all data from sheets",
			error: "Failed to fetch data from sheets",
		});
	}
}

const SHEET_KEY = "sheet-state";

export function setSheet(): SheetState {
	return setContext(Symbol.for(SHEET_KEY), new SheetState());
}

export function useSheets(): SheetState {
	return getContext(Symbol.for(SHEET_KEY));
}
