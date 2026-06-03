import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const VIDEOS_FILE = path.join(process.cwd(), "public", "videos.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "neurobeg2024";

function readVideos() {
  try { return JSON.parse(readFileSync(VIDEOS_FILE, "utf-8")); }
  catch { return []; }
}
function writeVideos(data: object) {
  writeFileSync(VIDEOS_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  return NextResponse.json(readVideos());
}

export async function POST(req: NextRequest) {
  const { password, youtubeId, title, description, isShort } = await req.json();
  if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  const videos = readVideos();
  const video = { id: Date.now().toString(), youtubeId, title: title || "", description: description || "", isShort: !!isShort };
  videos.push(video);
  writeVideos(videos);
  return NextResponse.json(video, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { password, id, title, description } = await req.json();
  if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  const videos = readVideos();
  const idx = videos.findIndex((v: { id: string }) => v.id === id);
  if (idx === -1) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  videos[idx] = { ...videos[idx], title, description };
  writeVideos(videos);
  return NextResponse.json(videos[idx]);
}

export async function DELETE(req: NextRequest) {
  const { password, id } = await req.json();
  if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  const videos = readVideos();
  writeVideos(videos.filter((v: { id: string }) => v.id !== id));
  return NextResponse.json({ success: true });
}
