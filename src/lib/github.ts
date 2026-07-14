const BASE = "https://api.github.com";
const owner = process.env.GITHUB_REPO_OWNER!;
const repo = process.env.GITHUB_REPO_NAME!;
const branch = process.env.GITHUB_BRANCH ?? "main";
const token = process.env.GITHUB_TOKEN!;

function filePath(userId: string, fileName: string) {
  return `users/${userId}/${fileName}`;
}

export async function readGitHubFile<T>(
  userId: string,
  fileName: string
): Promise<{ data: T[] | null; sha: string | null }> {
  const path = filePath(userId, fileName);
  const res = await fetch(
    `${BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    }
  );
  if (res.status === 404) return { data: null, sha: null };
  if (!res.ok) return { data: null, sha: null };
  const json = await res.json();
  const data = JSON.parse(
    Buffer.from(json.content, "base64").toString("utf-8")
  );
  return { data, sha: json.sha };
}

export async function writeGitHubFile<T>(
  userId: string,
  fileName: string,
  data: T[],
  sha: string | null
): Promise<string | null> {
  const path = filePath(userId, fileName);
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
  const body: Record<string, unknown> = {
    message: `update ${fileName}`,
    content,
    branch,
  };
  if (sha) body.sha = sha;
  const res = await fetch(`${BASE}/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return (json.content?.sha as string) ?? null;
}