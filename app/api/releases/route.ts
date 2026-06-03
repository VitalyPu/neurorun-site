import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { Release } from "@/lib/types";
import { parseRelease } from "@/lib/parseRelease";

const RELEASES_FILE = path.join(process.cwd(), "public", "releases.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "neurobeg2024";

function readReleases(): Release[] {
  try {
    return JSON.parse(readFileSync(RELEASES_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeReleases(releases: Release[]) {
  writeFileSync(RELEASES_FILE, JSON.stringify(releases, null, 2));
}

// GET — return all releases
export async function GET() {
  const releases = readReleases();
  return NextResponse.json(releases);
}

// POST — add new release
export async function POST(req: NextRequest) {
  const { bandlink, password } = await req.json();

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  if (!bandlink || !bandlink.startsWith("http")) {
    return NextResponse.json({ error: "Некорректная ссылка" }, { status: 400 });
  }

  try {
    const parsed = await parseRelease(bandlink);
    const releases = readReleases();

    // Check for duplicate
    if (releases.find((r) => r.bandlink === bandlink)) {
      return NextResponse.json({ error: "Этот релиз уже добавлен" }, { status: 409 });
    }

    const newRelease: Release = {
      id: Date.now().toString(),
      bandlink,
      title: parsed.title,
      coverUrl: parsed.coverUrl,
      links: parsed.links,
    };

    releases.unshift(newRelease);
    writeReleases(releases);

    return NextResponse.json(newRelease, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ошибка парсинга";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH — update release description
export async function PATCH(req: NextRequest) {
  const { id, description, password } = await req.json();
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }
  const releases = readReleases();
  const idx = releases.findIndex((r) => r.id === id);
  if (idx === -1) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  releases[idx] = { ...releases[idx], description };
  writeReleases(releases);
  return NextResponse.json(releases[idx]);
}

// DELETE — remove release by id
export async function DELETE(req: NextRequest) {
  const { id, password } = await req.json();

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  const releases = readReleases();
  const filtered = releases.filter((r) => r.id !== id);

  if (filtered.length === releases.length) {
    return NextResponse.json({ error: "Релиз не найден" }, { status: 404 });
  }

  writeReleases(filtered);
  return NextResponse.json({ success: true });
}
