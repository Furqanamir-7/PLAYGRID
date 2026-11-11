import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ORGANIZER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      matchId,
      homeScore,
      awayScore,
      homePenalties,
      awayPenalties,
      homeFouls,
      awayFouls,
      manOfTheMatchPlayerId,
      events,
    } = await req.json();

    if (!matchId) {
      return NextResponse.json({ error: "Match ID is required" }, { status: 400 });
    }

    const result = dbService.recordMatchResult({
      matchId,
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      homePenalties: homePenalties != null ? Number(homePenalties) : null,
      awayPenalties: awayPenalties != null ? Number(awayPenalties) : null,
      homeFouls: Number(homeFouls || 0),
      awayFouls: Number(awayFouls || 0),
      manOfTheMatchPlayerId,
      recordedById: user.id,
      events,
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to record result" }, { status: 500 });
  }
}

