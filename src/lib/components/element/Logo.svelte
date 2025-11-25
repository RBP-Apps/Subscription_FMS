<script lang="ts">
	import { LayoutDashboard } from "@lucide/svelte";
	let { size = 24 }: { size?: number | string } = $props();
</script>

<div class="bg-primary text-primary-foreground p-2 rounded-xl shadow-md">
	<LayoutDashboard {size} />
</div>
