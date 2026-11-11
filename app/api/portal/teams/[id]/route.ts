import { NextResponse } from "next/server";
import { getDb, dbService } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const team = db.teams.find((t) => t.id === id);
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const squad = db.teamPlayers
    .filter((tp) => tp.teamId === id)
    .map((tp) => ({
      ...tp,
      player: db.players.find((p) => p.id === tp.playerId),
    }))
    .sort((a, b) => a.jerseyNumber - b.jerseyNumber);

  return NextResponse.json({ team, squad });
}

