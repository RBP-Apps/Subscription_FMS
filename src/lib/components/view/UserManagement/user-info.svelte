<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar";
	import { getInitials } from "$lib/utils/parsers";

	let { name, email }: { name: string; email: string } = $props();
</script>

<div class="flex gap-2 items-center">
	<Avatar.Root class="border border-foreground">
		<Avatar.Fallback>{getInitials(name)}</Avatar.Fallback>
	</Avatar.Root>

	<div class="grid gap">
		<p class="text-sm">{name}</p>
		<p class="text-xs text-muted-foreground">{email}</p>
	</div>
</div>
