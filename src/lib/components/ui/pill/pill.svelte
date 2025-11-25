<script lang="ts" module>
	import type { WithElementRef } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import type { VariantProps } from "tailwind-variants";
	import { tv } from "tailwind-variants";
	import { cn } from "$lib/utils/cn";

	const pillVariants = tv({
		variants: {
			variant: {
				primary: "bg-purple-500/5 text-purple-500 border-purple-500",
				success: "bg-green-500/5 text-green-500 border-green-500",
				warning: "bg-yellow-500/5 text-yellow-500 border-yellow-500",
				destructive: "bg-destructive/5 text-destructive border-destructive",
				default: "bg-foreground/5 text-foreground border-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type PillVariant = VariantProps<typeof pillVariants>["variant"];

	export type PillProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: PillVariant;
	};
</script>

<script lang="ts">
	let {
		class: className,
		variant = "default",
		ref = $bindable(null),
		children,
		...restProps
	}: PillProps = $props();
</script>

<div
	bind:this={ref}
	class={cn(
		"text-xs rounded-full px-2 py-1 border text-center font-semibold",
		pillVariants({ variant }),
		className,
	)}
>
	{@render children?.()}
</div>
