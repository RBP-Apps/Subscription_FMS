export default async function (file: File, folderId: string): Promise<string> {
	const base64: string = await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const base64String = (reader.result as string)?.split(",")[1]; // Remove data:type;base64, prefix
			resolve(base64String);
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});

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

	return res.fileUrl as string;
}
