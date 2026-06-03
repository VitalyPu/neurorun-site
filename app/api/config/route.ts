import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const CONFIG_FILE = path.join(process.cwd(), "public", "site-config.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "neurobeg2024";

function readConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return { tagline: ["Нейромузыкант", "Киберпанк", "Психоделика"], bio: "", albums: {} };
  }
}

export async function GET() {
  return NextResponse.json(readConfig());
}

export async function POST(req: NextRequest) {
  const { password, ...data } = await req.json();
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }
  const current = readConfig();
  const updated = { ...current, ...data };
  writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2));
  return NextResponse.json(updated);
}
