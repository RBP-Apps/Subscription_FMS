<script lang="ts">
	import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils/cn";
	import { tv, type VariantProps } from "tailwind-variants";

	const justifyVariants = tv({
		variants: {
			justify: {
				center: "justify-center",
				end: "justify-end",
				start: "justify-start",
			},
		},
		defaultVariants: {
			justify: "start",
		},
	});

	let {
		onclick,
		header,
		justify = "start",
	}: {
		onclick?: (event: unknown) => void;
		header: string;
		justify?: VariantProps<typeof justifyVariants>["justify"];
	} = $props();
</script>

<div class={cn("flex", justifyVariants({ justify }))}>
	<Button
		variant="ghost"
		class="has-[>svg]:px-0 hover:bg-transparent"
		{onclick}
	>
		{header}
		<ArrowUpDownIcon class="ml-1" />
	</Button>
</div>
