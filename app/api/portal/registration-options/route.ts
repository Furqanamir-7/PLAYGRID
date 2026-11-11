import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  // Open tournaments
  const tournaments = db.tournaments.filter(
    (t) => t.status === "REGISTRATION_OPEN" || t.status === "ONGOING"
  );

  // Teams managed by user (or available teams)
  let teams = db.teams.filter((t) => t.managerId === user.id);
  if (teams.length === 0) {
    teams = db.teams.slice(0, 4);
  }

  return NextResponse.json({ tournaments, teams });
}

