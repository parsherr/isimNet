const DRIVE_API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

async function findFileId(
  token: string,
  fileName: string
): Promise<string | null> {
  const res = await fetch(
    `${DRIVE_API}/files?spaces=appDataFolder&q=name='${fileName}'&fields=files(id)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

export async function readDriveFile<T>(
  token: string,
  fileName: string
): Promise<T[] | null> {
  const fileId = await findFileId(token, fileName);
  if (!fileId) return null;

  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;

  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function writeDriveFile<T>(
  token: string,
  fileName: string,
  data: T[]
): Promise<void> {
  const body = JSON.stringify(data);
  const fileId = await findFileId(token, fileName);

  if (fileId) {
    await fetch(`${UPLOAD_API}/files/${fileId}?uploadType=media`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
    });
  } else {
    const metadata = JSON.stringify({ name: fileName, parents: ["appDataFolder"] });
    const boundary = "isimnet_boundary";
    const multipart =
      `--${boundary}\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      `${metadata}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      `${body}\r\n` +
      `--${boundary}--`;

    await fetch(`${UPLOAD_API}/files?uploadType=multipart&spaces=appDataFolder`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipart,
    });
  }
}