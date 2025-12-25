export const subscriptionHeaders = [
	"timestamp",
	"subscriptionNo",
	"companyName",
	"subscriberName",
	"subscriptionName",
	"price",
	"frequency",
	"purpose",
	"planned1",
	"actual1",
	"timeDelay1",
	"renewalStatus",
	"renewalCount",
	"planned2",
	"actual2",
	"timeDelay2",
	"approvalStatus",
	"planned3",
	"actual3",
	"timeDelay3",
	"startDate",
	"endDate",
	"",
	"",
	"policyNo",
	"agentName",
	"fileUpload"
] as const;

export const renewalHeaders = [
	"timestamp",
	"renewalNo",
	"subscriptionNo",
	"approvedBy",
	"renewalStatus",
	"price"
] as const;

export const approvalHeaders = [
	"timestamp",
	"approvalNo",
	"subscriptionNo",
	"approvedBy",
	"approvalStatus",
	"requestedOn",
	"note",
] as const;

export const paymentHeaders = [
	"timestamp",
	"subscriptionNo",
	"paymentMode",
	"transactionId",
	"startDate",
	"insuranceDocument",
	"endDate",
	"updatedPrice",
	"paymentRiciept",
] as const;

export const userHeaders = [
	"username",
	"name",
	"email",
	"password",
	"role",
	"lastLogin",
] as const;

export type SubscriptionRow = Record<
	(typeof subscriptionHeaders)[number],
	string
>;
export type RenewalRow = Record<(typeof renewalHeaders)[number], string>;
export type ApprovalRow = Record<(typeof approvalHeaders)[number], string>;
export type PaymentRow = Record<(typeof paymentHeaders)[number], string>;
export type UserRow = Record<(typeof userHeaders)[number], string>;
export type Master = { companyName: string[]; subscriberName: string[] };

export type Sheets =
	| "SUBSCRIPTION"
	| "RENEWAL"
	| "APPROVAL"
	| "PAYMENT"
	| "USER"
	| "MASTER";
