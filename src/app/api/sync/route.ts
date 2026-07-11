import { NextRequest, NextResponse } from "next/server";
import { writeDriveFile } from "@/lib/drive";

export async function POST(req: NextRequest) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { customers, products, sales, payments } = await req.json();
    await Promise.all([
      writeDriveFile(token, "customers.json", customers),
      writeDriveFile(token, "products.json",  products),
      writeDriveFile(token, "sales.json",     sales),
      writeDriveFile(token, "payments.json",  payments),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Sync error:", e);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}