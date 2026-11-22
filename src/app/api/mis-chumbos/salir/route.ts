import { NextResponse } from "next/server";
import { COOKIE_SESION, opcionesCookie } from "@/lib/sesion";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_SESION, "", { ...opcionesCookie, maxAge: 0 });
  return res;
}
