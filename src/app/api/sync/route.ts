import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { readOrMigrateDataFile, writeDataFile, AppData } from "@/lib/github";

export async function GET() {
  const session = await auth();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, sha } = await readOrMigrateDataFile(session.userId);
    if (!data) {
      return NextResponse.json({
        customers: [],
        products: [],
        sales: [],
        payments: [],
        debts: [],
        sha: null,
      });
    }
    return NextResponse.json({ ...data, sha });
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

  try {
    const body = await req.json();
    const data: AppData = {
      customers: body.customers ?? [],
      products:  body.products  ?? [],
      sales:     body.sales     ?? [],
      payments:  body.payments  ?? [],
      debts:     body.debts     ?? [],
    };
    const sha = body.sha ?? null;

    const newSha = await writeDataFile(session.userId, data, sha);
    return NextResponse.json({ ok: true, sha: newSha });
  } catch (e) {
    console.error("GitHub write error:", e);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}