import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getDb } from "./db";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ORGANIZER" | "TEAM_MANAGER" | "VIEWER";
  phone?: string | null;
}

const COOKIE_NAME = "playgrid_session";

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    const parsed = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString("utf-8"));
    if (!parsed?.id) return null;

    const db = getDb();
    const user = db.users.find((u) => u.id === parsed.id && u.isActive);
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };
  } catch {
    return null;
  }
}

export async function loginUser(email: string, passwordPlain: string): Promise<SessionUser> {
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("Your account has been deactivated. Please contact support.");
  }

  const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  };

  const cookieStore = await cookies();
  const sessionToken = Buffer.from(JSON.stringify(sessionUser)).toString("base64");

  cookieStore.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return sessionUser;
}

export async function registerUser(params: {
  name: string;
  email: string;
  passwordPlain: string;
  phone?: string;
}): Promise<SessionUser> {
  const db = getDb();
  const normalizedEmail = params.email.trim().toLowerCase();

  const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(params.passwordPlain, 10);
  const newUser = {
    id: `usr_${Date.now()}`,
    name: params.name.trim(),
    email: normalizedEmail,
    passwordHash,
    phone: params.phone || null,
    role: "TEAM_MANAGER" as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.users.push(newUser);

  const sessionUser: SessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    phone: newUser.phone,
  };

  const cookieStore = await cookies();
  const sessionToken = Buffer.from(JSON.stringify(sessionUser)).toString("base64");

  cookieStore.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return sessionUser;
}

export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAuth(allowedRoles?: Array<"SUPER_ADMIN" | "ORGANIZER" | "TEAM_MANAGER">): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}

