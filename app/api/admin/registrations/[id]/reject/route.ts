import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ORGANIZER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  try {
    const { reason } = await req.json();
    const reg = db.registrations.find((r) => r.id === id);
    if (!reg) return NextResponse.json({ error: "Registration not found" }, { status: 404 });

    reg.status = "REJECTED";
    reg.reviewedById = user.id;
    reg.reviewedAt = new Date();
    reg.rejectionReason = reason || "Application rejected by tournament organizer";

    return NextResponse.json({ success: true, registration: reg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Rejection failed" }, { status: 500 });
  }
}

