import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const adminUser = process.env.ADMIN_USER || "EL JEFAZO";
    const adminPass = process.env.ADMIN_PASS || "berzosa15031980";

    const ok =
      username.trim().toLowerCase() === adminUser.toLowerCase() &&
      password === adminPass;

    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
