import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const user = await registerUser({
      name,
      email,
      passwordPlain: password,
      phone,
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Registration failed" }, { status: 400 });
  }
}

