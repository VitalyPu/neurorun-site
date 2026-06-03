import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "neurobeg2024";

export async function GET() {
  const rows = await sql`SELECT * FROM videos ORDER BY sort_order ASC, created_at ASC`;
  return NextResponse.json(rows.map((v) => ({
    id: v.id, youtubeId: v.youtube_id, title: v.title,
    description: v.description, isShort: v.is_short,
  })));
}

export async function POST(req: NextRequest) {
  const { password, youtubeId, title, description, isShort } = await req.json();
  if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  const id = Date.now().toString();
  const countRows = await sql`SELECT COUNT(*) as cnt FROM videos`;
  const sortOrder = Number(countRows[0].cnt);
  await sql`
    INSERT INTO videos (id, youtube_id, title, description, is_short, sort_order)
    VALUES (${id}, ${youtubeId}, ${title || ""}, ${description || ""}, ${!!isShort}, ${sortOrder})
  `;
  return NextResponse.json({ id, youtubeId, title: title || "", description: description || "", isShort: !!isShort }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { password, id, title, description } = await req.json();
  if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  await sql`UPDATE videos SET title = ${title}, description = ${description} WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { password, id } = await req.json();
  if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  await sql`DELETE FROM videos WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
