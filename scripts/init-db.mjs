import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("🚀 Создаю схему базы данных...");

  // Releases
  await sql`
    CREATE TABLE IF NOT EXISTS releases (
      id TEXT PRIMARY KEY,
      bandlink TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      cover_url TEXT DEFAULT '',
      links JSONB DEFAULT '{}',
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Videos
  await sql`
    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      youtube_id TEXT NOT NULL,
      title TEXT DEFAULT '',
      description TEXT DEFAULT '',
      is_short BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Site config (key-value)
  await sql`
    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL
    )
  `;

  console.log("✅ Схема создана");

  // --- Migrate releases.json ---
  const releasesPath = path.join(__dirname, "../public/releases.json");
  const releases = JSON.parse(readFileSync(releasesPath, "utf-8"));

  for (const r of releases) {
    await sql`
      INSERT INTO releases (id, bandlink, title, cover_url, links, description)
      VALUES (${r.id}, ${r.bandlink}, ${r.title}, ${r.coverUrl || ""}, ${JSON.stringify(r.links || {})}, ${r.description || ""})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        cover_url = EXCLUDED.cover_url,
        links = EXCLUDED.links,
        description = EXCLUDED.description
    `;
    console.log(`  ✅ Релиз: ${r.title}`);
  }

  // --- Migrate videos.json ---
  const videosPath = path.join(__dirname, "../public/videos.json");
  const videos = JSON.parse(readFileSync(videosPath, "utf-8"));

  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    await sql`
      INSERT INTO videos (id, youtube_id, title, description, is_short, sort_order)
      VALUES (${v.id}, ${v.youtubeId}, ${v.title || ""}, ${v.description || ""}, ${v.isShort || false}, ${i})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        is_short = EXCLUDED.is_short,
        sort_order = EXCLUDED.sort_order
    `;
    console.log(`  ✅ Видео: ${v.title || v.youtubeId}`);
  }

  // --- Migrate site-config.json ---
  const configPath = path.join(__dirname, "../public/site-config.json");
  const config = JSON.parse(readFileSync(configPath, "utf-8"));

  await sql`
    INSERT INTO site_config (key, value) VALUES ('tagline', ${JSON.stringify(config.tagline || [])})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
  await sql`
    INSERT INTO site_config (key, value) VALUES ('bio', ${JSON.stringify(config.bio || "")})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
  await sql`
    INSERT INTO site_config (key, value) VALUES ('artDescriptions', ${JSON.stringify(config.artDescriptions || {})})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
  await sql`
    INSERT INTO site_config (key, value) VALUES ('arts', ${JSON.stringify(config.arts || [])})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;

  console.log("  ✅ Site config");
  console.log("\n🎉 Миграция завершена!");
}

main().catch((e) => { console.error("❌ Ошибка:", e); process.exit(1); });
