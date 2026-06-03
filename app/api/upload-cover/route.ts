import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync } from "fs";
import path from "path";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const RELEASES_FILE = path.join(process.cwd(), "public", "releases.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "neurobeg2024";

function readReleases() {
  try { return JSON.parse(readFileSync(RELEASES_FILE, "utf-8")); }
  catch { return []; }
}
function writeReleases(data: object) {
  writeFileSync(RELEASES_FILE, JSON.stringify(data, null, 2));
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const password = formData.get("password") as string;
  const releaseId = formData.get("releaseId") as string;
  const file = formData.get("file") as File;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }
  if (!file || !releaseId) {
    return NextResponse.json({ error: "Файл или ID не указан" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `cover-${releaseId}.${ext}`;
  const bytes = await file.arrayBuffer();
  writeFileSync(path.join(IMAGES_DIR, filename), Buffer.from(bytes));

  // Update coverUrl in releases.json
  const releases = readReleases();
  const idx = releases.findIndex((r: { id: string }) => r.id === releaseId);
  if (idx !== -1) {
    releases[idx].coverUrl = `/images/${filename}`;
    writeReleases(releases);
  }

  return NextResponse.json({ coverUrl: `/images/${filename}` });
}
