import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "neurobeg2024";

async function readConfig() {
  const rows = await sql`SELECT key, value FROM site_config`;
  const config: Record<string, unknown> = {};
  for (const row of rows) {
    config[row.key] = row.value;
  }
  return config;
}

export async function GET() {
  try {
    const config = await readConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ tagline: ["Нейромузыкант", "Киберпанк", "Психоделика"], bio: "", artDescriptions: {}, arts: [] });
  }
}

export async function POST(req: NextRequest) {
  const { password, ...data } = await req.json();
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }
  try {
    for (const [key, value] of Object.entries(data)) {
      await sql`
        INSERT INTO site_config (key, value) VALUES (${key}, ${JSON.stringify(value)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }
    return NextResponse.json(await readConfig());
  } catch (e) {
    const message = e instanceof Error ? e.message : "DB error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
