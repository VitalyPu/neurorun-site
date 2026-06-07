import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { parseRelease } from "@/lib/parseRelease";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "neurobeg2024";

export async function GET() {
  const rows = await sql`SELECT * FROM releases ORDER BY created_at DESC`;
  return NextResponse.json(rows.map((r) => ({
    id: r.id, bandlink: r.bandlink, title: r.title,
    coverUrl: r.cover_url, links: r.links, description: r.description,
  })));
}

export async function POST(req: NextRequest) {
  const { bandlink, password } = await req.json();
  if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  if (!bandlink?.startsWith("http")) return NextResponse.json({ error: "Некорректная ссылка" }, { status: 400 });

  const existing = await sql`SELECT id FROM releases WHERE bandlink = ${bandlink}`;
  if (existing.length > 0) return NextResponse.json({ error: "Этот релиз уже добавлен" }, { status: 409 });

  try {
    const parsed = await parseRelease(bandlink);
    const id = Date.now().toString();
    await sql`
      INSERT INTO releases (id, bandlink, title, cover_url, links, description)
      VALUES (${id}, ${bandlink}, ${parsed.title}, ${parsed.coverUrl}, ${JSON.stringify(parsed.links)}, '')
    `;
    return NextResponse.json({ id, bandlink, title: parsed.title, coverUrl: parsed.coverUrl, links: parsed.links, description: "" }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Ошибка" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { id, description, title, coverUrl, password } = await req.json();
  if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  if (description !== undefined) await sql`UPDATE releases SET description = ${description} WHERE id = ${id}`;
  if (title !== undefined) await sql`UPDATE releases SET title = ${title} WHERE id = ${id}`;
  if (coverUrl !== undefined) await sql`UPDATE releases SET cover_url = ${coverUrl} WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id, password } = await req.json();
  if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  await sql`DELETE FROM releases WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
