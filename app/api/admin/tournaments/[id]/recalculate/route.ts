import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
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
  try {
    dbService.recalculateStandings(id);
    return NextResponse.json({ success: true, message: "Standings recalculated" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Recalculation failed" }, { status: 500 });
  }
}

