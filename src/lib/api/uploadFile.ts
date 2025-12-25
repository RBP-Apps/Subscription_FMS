export default async function (file: File, folderId: string): Promise<string> {
	console.log("☁️ uploadFile called with folderId:", folderId);
	// Convert file to base64
	const base64: string = await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const base64String = (reader.result as string)?.split(",")[1]; // Remove data:type;base64, prefix
			resolve(base64String);
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});

	// Call Apps Script "upload" action (same project that handles sheets)
	const form = new FormData();
	form.append("action", "upload");
	form.append("fileName", file.name);
	form.append("mimeType", file.type);
	form.append("fileData", base64);
	form.append("folderId", folderId);

	const response = await fetch(import.meta.env.VITE_APPS_SCRIPT, {
		method: "POST",
		body: form,
	});

	if (!response.ok) throw new Error("Failed to upload file");
	const res = await response.json();
	if (!res.success) throw new Error(res.message);

	// Apps Script returns:
	// { success, fileId, fileUrl, downloadUrl, webViewLink }
	// direct view link ke liye uc?id= format best hai
	return `https://drive.google.com/uc?id=${res.fileId}`;
}