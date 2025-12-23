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
// $lib/api.ts

export async function uploadFile(file: File, folder: string) {
	// 1) File ko base64 string me convert karo
	const fileBase64: string = await new Promise((resolve, reject) => {
	  const reader = new FileReader();
  
	  reader.onload = () => {
		const result = reader.result as string;
		// "data:application/pdf;base64,AAAA..." se sirf base64 part nikalna
		const base64 = result.split(",")[1];
		resolve(base64);
	  };
  
	  reader.onerror = (err) => reject(err);
	  reader.readAsDataURL(file);
	});
  
	// 2) Apps Script ko POST bhejna
	const body = new URLSearchParams();
	body.append("action", "upload");
	body.append("fileName", file.name);
	body.append("fileData", fileBase64);
	body.append("mimeType", file.type);
  
	const res = await fetch(import.meta.env.VITE_SHEET_URL, {
	  method: "POST",
	  headers: {
		"Content-Type": "application/x-www-form-urlencoded",
	  },
	  body: body.toString(),
	});
  
	const json = await res.json();
	return json;
  }
  