import { NextResponse } from "next/server";
import { logoutUser } from "@/lib/auth";

export async function POST(req: Request) {
  await logoutUser();
  const url = new URL("/", req.url);
  return NextResponse.redirect(url, { status: 303 });
}

