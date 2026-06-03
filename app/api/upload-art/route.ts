import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, unlinkSync, readFileSync } from "fs";
import path from "path";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const CONFIG_FILE = path.join(process.cwd(), "public", "site-config.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "neurobeg2024";

function readConfig() {
  try { return JSON.parse(readFileSync(CONFIG_FILE, "utf-8")); }
  catch { return {}; }
}

function writeConfig(data: object) {
  writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const password = formData.get("password") as string;
  const file = formData.get("file") as File;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  if (!file) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `art-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  writeFileSync(path.join(IMAGES_DIR, filename), buffer);

  // Register in config
  const config = readConfig();
  if (!config.arts) config.arts = [];
  config.arts.push(filename);
  writeConfig(config);

  return NextResponse.json({ filename });
}

export async function DELETE(req: NextRequest) {
  const { filename, password } = await req.json();

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  // Safety: only allow files in images dir, no path traversal
  if (filename.includes("..") || filename.includes("/")) {
    return NextResponse.json({ error: "Недопустимое имя файла" }, { status: 400 });
  }

  try {
    unlinkSync(path.join(IMAGES_DIR, filename));
  } catch { /* file may not exist */ }

  // Remove from config
  const config = readConfig();
  if (config.arts) {
    config.arts = config.arts.filter((a: string) => a !== filename);
    writeConfig(config);
  }

  return NextResponse.json({ success: true });
}
