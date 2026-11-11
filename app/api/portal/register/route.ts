import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  try {
    const { tournamentId, teamId, paymentMethod, transactionRef } = await req.json();

    if (!tournamentId || !teamId || !paymentMethod || !transactionRef) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const tournament = db.tournaments.find((t) => t.id === tournamentId);
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Check unique constraint on (tournament_id, team_id)
    const existing = db.registrations.find(
      (r) => r.tournamentId === tournamentId && r.teamId === teamId
    );
    if (existing) {
      return NextResponse.json(
        { error: "This team is already registered for this tournament!" },
        { status: 400 }
      );
    }

    const regId = `reg_dyn_${Date.now()}`;
    const newReg = {
      id: regId,
      tournamentId,
      teamId,
      status: "PENDING",
      submittedAt: new Date(),
      reviewedById: null,
      reviewedAt: null,
      rejectionReason: null,
    };

    db.registrations.push(newReg);

    // Create payment slip
    const newPayment = {
      id: `pay_dyn_${Date.now()}`,
      registrationId: regId,
      amountPkr: tournament.entryFeePkr,
      method: paymentMethod,
      transactionRef: transactionRef.trim(),
      status: "PENDING",
      paidAt: new Date(),
      verifiedById: null,
    };

    db.payments.push(newPayment);

    return NextResponse.json({ success: true, registration: newReg, payment: newPayment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to register" }, { status: 500 });
  }
}

