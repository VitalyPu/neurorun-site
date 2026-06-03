import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, unlinkSync } from "fs";
import path from "path";
import { sql } from "@/lib/db";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "neurobeg2024";

async function getArts(): Promise<string[]> {
  const rows = await sql`SELECT value FROM site_config WHERE key = 'arts'`;
  return rows.length > 0 ? (rows[0].value as string[]) : [];
}

async function saveArts(arts: string[]) {
  await sql`
    INSERT INTO site_config (key, value) VALUES ('arts', ${JSON.stringify(arts)})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const password = formData.get("password") as string;
  const file = formData.get("file") as File;

  if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  if (!file) return NextResponse.json({ error: "Файл не найден" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const filename = `art-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  try {
    writeFileSync(path.join(IMAGES_DIR, filename), Buffer.from(bytes));
  } catch { /* read-only on Vercel */ }

  const arts = await getArts();
  arts.push(filename);
  await saveArts(arts);

  return NextResponse.json({ filename });
}

export async function DELETE(req: NextRequest) {
  const { filename, password } = await req.json();
  if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  if (filename.includes("..") || filename.includes("/")) return NextResponse.json({ error: "Недопустимо" }, { status: 400 });

  try { unlinkSync(path.join(IMAGES_DIR, filename)); } catch { /* ok */ }

  const arts = await getArts();
  await saveArts(arts.filter((a: string) => a !== filename));

  return NextResponse.json({ success: true });
}
