import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { readGitHubFile, writeGitHubFile } from "@/lib/github";

const FILES = ["customers", "products", "sales", "payments", "debts"] as const;
type FileName = (typeof FILES)[number];

export async function GET() {
  const session = await auth();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.userId;

  try {
    const results = await Promise.all(
      FILES.map((f) => readGitHubFile(userId, `${f}.json`))
    );

    const data: Record<string, unknown[]> = {};
    const shas: Record<string, string | null> = {};
    FILES.forEach((f, i) => {
      data[f] = results[i].data ?? [];
      shas[f] = results[i].sha;
    });

    return NextResponse.json({ ...data, shas });
  } catch (e) {
    console.error("GitHub read error:", e);
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.userId;

  try {
    const body = await req.json();
    const shas: Record<string, string | null> = body.shas ?? {};

    const newShas = await Promise.all(
      FILES.map((f: FileName) =>
        writeGitHubFile(userId, `${f}.json`, body[f] ?? [], shas[f] ?? null)
      )
    );

    const updatedShas: Record<string, string | null> = {};
    FILES.forEach((f, i) => {
      updatedShas[f] = newShas[i];
    });

    return NextResponse.json({ ok: true, shas: updatedShas });
  } catch (e) {
    console.error("GitHub write error:", e);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}