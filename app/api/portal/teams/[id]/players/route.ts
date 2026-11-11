import { NextResponse } from "next/server";
import { getDb, dbService } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: teamId } = await params;
  const db = getDb();
  const team = db.teams.find((t) => t.id === teamId);
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  try {
    const { fullName, preferredPosition, jerseyNumber, isCaptain } = await req.json();

    if (!fullName || !jerseyNumber) {
      return NextResponse.json({ error: "Name and jersey number are required" }, { status: 400 });
    }

    // Determine current tournament for this team
    const registration = db.registrations.find((r) => r.teamId === teamId);
    const tournamentId = registration ? registration.tournamentId : db.tournaments[0].id;

    // Create player record
    const newPlayerId = `ply_usr_${Date.now()}`;
    const newPlayer = {
      id: newPlayerId,
      fullName: fullName.trim(),
      dateOfBirth: new Date("2000-01-01"),
      cnic: `42101-${Math.floor(1000000 + Math.random() * 9000000)}-1`,
      phone: "+92 300 0000000",
      preferredPosition,
      photoUrl: null,
      createdAt: new Date(),
    };

    db.players.push(newPlayer);

    // Call service enforcing database constraints & triggers
    const teamPlayer = dbService.addPlayerToSquad({
      tournamentId,
      teamId,
      playerId: newPlayerId,
      jerseyNumber: Number(jerseyNumber),
      isCaptain: !!isCaptain,
    });

    return NextResponse.json({ success: true, teamPlayer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to add player" }, { status: 400 });
  }
}

