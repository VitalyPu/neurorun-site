import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "neurobeg2024";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password === ADMIN_PASSWORD) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
}
