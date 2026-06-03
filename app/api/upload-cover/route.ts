import { NextRequest, NextResponse } from "next/server";
import { writeFileSync } from "fs";
import path from "path";
import { sql } from "@/lib/db";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "neurobeg2024";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const password = formData.get("password") as string;
  const releaseId = formData.get("releaseId") as string;
  const file = formData.get("file") as File;

  if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  if (!file || !releaseId) return NextResponse.json({ error: "Файл или ID не указан" }, { status: 400 });

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `cover-${releaseId}.${ext}`;

  try {
    const bytes = await file.arrayBuffer();
    writeFileSync(path.join(IMAGES_DIR, filename), Buffer.from(bytes));
  } catch {
    // On Vercel filesystem is read-only — skip local write, URL still works if file was committed
  }

  const coverUrl = `/images/${filename}`;
  await sql`UPDATE releases SET cover_url = ${coverUrl} WHERE id = ${releaseId}`;

  return NextResponse.json({ coverUrl });
}
