<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import { Button } from "$lib/components/ui/button";
	import { Download, ExternalLink, FileText } from "@lucide/svelte";

	let { url = "" } = $props<{ url: string }>();

	function getDriveId(link: string) {
		if (!link || typeof link !== "string") return null;
		
		// Match anything that looks like a Drive ID (25+ characters of alphanumeric/dashes/underscores)
		// but only if it's within a Google Drive or Docs domain
		if (link.includes("drive.google.com") || link.includes("docs.google.com")) {
			// Try matching /d/ID
			const dMatch = link.match(/\/d\/([\w-]+)/);
			if (dMatch) return dMatch[1];
			
			// Try matching id=ID
			const idMatch = link.match(/[?&]id=([\w-]+)/);
			if (idMatch) return idMatch[1];
			
			// Fallback: If no /d/ or id=, just look for a long string that looks like an ID
			const longStrMatch = link.match(/[-\w]{25,}/);
			if (longStrMatch) return longStrMatch[0];
		}
		return null;
	}

	function getDirectUrl(link: string) {
		const id = getDriveId(link);
		if (id) {
			return `https://drive.google.com/uc?id=${id}&export=download`;
		}
		return link;
	}

	function getPreviewUrl(link: string) {
		const id = getDriveId(link);
		if (id) {
			// thumbnail endpoint is fast and usually works for many file types
			return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
		}
		return link;
	}

	const isImage = $derived(
		url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/) ||
		getDriveId(url) !== null
	);

	const displayUrl = $derived(getPreviewUrl(url));
	const downloadUrl = $derived(getDirectUrl(url));

	let isOpen = $state(false);
</script>

{#if !url || url === "" || url === "[object Object]"}
	<span class="text-muted-foreground text-xs italic">N/A</span>
{:else if isImage}
	<Dialog.Root bind:open={isOpen}>
		<Dialog.Trigger>
			<button class="relative group cursor-pointer overflow-hidden rounded-md border border-border w-16 h-10 flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors">
				<img 
					src={displayUrl} 
					alt="Preview" 
					class="w-full h-full object-cover"
					onerror={(e) => {
						// Fallback if not actually an image or Drive preview fails
						const target = e.target as HTMLImageElement;
						target.style.display = 'none';
						target.nextElementSibling?.classList.remove('hidden');
					}}
				/>
				<div class="hidden absolute inset-0 flex items-center justify-center">
					<FileText class="w-5 h-5 text-muted-foreground" />
				</div>
				<div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
					<ExternalLink class="w-4 h-4 text-white" />
				</div>
			</button>
		</Dialog.Trigger>
		<Dialog.Content class="sm:max-w-[700px] p-0 overflow-hidden">
			<div class="flex flex-col h-full max-h-[90vh]">
				<Dialog.Header class="p-4 border-b">
					<Dialog.Title>File Preview</Dialog.Title>
				</Dialog.Header>
				
				<div class="flex-1 overflow-auto bg-muted/20 flex items-center justify-center min-h-[300px] p-4 relative">
					<img 
						src={displayUrl} 
						alt="Direct Preview" 
						class="max-w-full max-h-[60vh] object-contain shadow-lg rounded-sm"
						onerror={(e) => {
							const target = e.target as HTMLImageElement;
							target.style.display = 'none';
							target.nextElementSibling?.classList.remove('hidden');
						}}
					/>
					<div class="hidden flex flex-col items-center gap-2 text-muted-foreground">
						<FileText class="w-12 h-12" />
						<p>Preview not available for this file type</p>
					</div>
				</div>

				<div class="p-4 border-t bg-background flex justify-between items-center">
					<p class="text-xs text-muted-foreground truncate max-w-[300px]">
						{url}
					</p>
					<div class="flex gap-2">
						<Button variant="outline" size="sm" href={url} target="_blank">
							<ExternalLink class="w-4 h-4 mr-2" />
							Open Original
						</Button>
						<Button size="sm" href={downloadUrl} download>
							<Download class="w-4 h-4 mr-2" />
							Download Image
						</Button>
					</div>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<a class="font-semibold text-primary underline flex items-center gap-1" href={url} target="_blank">
		<ExternalLink class="w-3 h-3" />
		View File
	</a>
{/if}
