"use client";

import { useState, useEffect, useRef } from "react";
import { Release, Video } from "@/lib/types";

const ADMIN_LOGIN = "neurorun";
const PWD_KEY = "nb_pwd";
const ATTEMPTS_KEY = "nb_attempts";
const LOCKOUT_KEY = "nb_lockout";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 30;

const STATIC_ARTS = [
  "0. Пролог.png","1. Ex Machine.png","2. Бессмертие.png","3. Вавилон.png",
  "4. Все, как один.png","5. Любовь.png","6. Последняя притча.png","7. Хранитель глубины.png",
];

// ---- helpers ----
function getStoredPwd() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(PWD_KEY) || "";
}
function isLockedOut() {
  if (typeof window === "undefined") return false;
  const t = localStorage.getItem(LOCKOUT_KEY);
  if (!t) return false;
  return Date.now() < parseInt(t);
}
function lockoutMinutesLeft() {
  const t = localStorage.getItem(LOCKOUT_KEY);
  if (!t) return 0;
  return Math.ceil((parseInt(t) - Date.now()) / 60000);
}
function getAttempts() {
  return parseInt(localStorage.getItem(ATTEMPTS_KEY) || "0");
}
function recordFailedAttempt() {
  const a = getAttempts() + 1;
  localStorage.setItem(ATTEMPTS_KEY, String(a));
  if (a >= MAX_ATTEMPTS) {
    localStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_MINUTES * 60000));
    localStorage.setItem(ATTEMPTS_KEY, "0");
  }
  return a;
}
function clearAttempts() {
  localStorage.removeItem(ATTEMPTS_KEY);
  localStorage.removeItem(LOCKOUT_KEY);
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [pwdInput, setPwdInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [locked, setLocked] = useState(false);
  const [lockMins, setLockMins] = useState(0);

  // Config
  const [tagline, setTagline] = useState(["Нейромузыкант", "Киберпанк", "Психоделика"]);
  const [bio, setBio] = useState("");
  const [configMsg, setConfigMsg] = useState("");

  // Art descriptions
  const [artDescriptions, setArtDescriptions] = useState<Record<string, string>>({});
  const [uploadedArts, setUploadedArts] = useState<string[]>([]);
  const [artMsg, setArtMsg] = useState("");
  const artInputRef = useRef<HTMLInputElement>(null);

  // Releases
  const [releases, setReleases] = useState<Release[]>([]);
  const [newBandlink, setNewBandlink] = useState("");
  const [relMsg, setRelMsg] = useState("");
  const [relLoading, setRelLoading] = useState(false);
  const [editingRelease, setEditingRelease] = useState<string | null>(null);
  const [relDesc, setRelDesc] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCoverId, setUploadingCoverId] = useState<string | null>(null);

  // Videos
  const [videos, setVideos] = useState<Video[]>([]);
  const [newYtUrl, setNewYtUrl] = useState("");
  const [newVTitle, setNewVTitle] = useState("");
  const [newVDesc, setNewVDesc] = useState("");
  const [videoMsg, setVideoMsg] = useState("");
  const [editingVideo, setEditingVideo] = useState<string | null>(null);

  // Active section tab
  const [tab, setTab] = useState<"config" | "releases" | "arts" | "videos">("config");

  useEffect(() => {
    setLocked(isLockedOut());
    setLockMins(lockoutMinutesLeft());
    const interval = setInterval(() => {
      if (isLockedOut()) { setLocked(true); setLockMins(lockoutMinutesLeft()); }
      else { setLocked(false); }
    }, 10000);

    const saved = sessionStorage.getItem(PWD_KEY);
    if (saved) { setAuthed(true); loadData(saved); }
    return () => clearInterval(interval);
  }, []);

  async function loadData(pwd: string) {
    const cfg = await fetch("/api/config").then((r) => r.json()).catch(() => ({}));
    if (cfg.tagline) setTagline(cfg.tagline);
    if (cfg.bio) setBio(cfg.bio);
    if (cfg.artDescriptions) setArtDescriptions(cfg.artDescriptions);
    if (cfg.arts) setUploadedArts(cfg.arts);

    const rels = await fetch("/api/releases").then((r) => r.json()).catch(() => []);
    setReleases(rels);

    const vids = await fetch("/api/videos").then((r) => r.json()).catch(() => []);
    setVideos(vids);
  }

  async function login() {
    if (isLockedOut()) { setLocked(true); return; }
    if (loginInput !== ADMIN_LOGIN) {
      const a = recordFailedAttempt();
      if (a >= MAX_ATTEMPTS) { setLocked(true); setLoginError(`Слишком много попыток. Блокировка на ${LOCKOUT_MINUTES} мин.`); }
      else setLoginError(`Неверный логин или пароль. Попыток осталось: ${MAX_ATTEMPTS - a}`);
      return;
    }
    // Verify password via API
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwdInput }),
    });
    if (res.ok) {
      clearAttempts();
      sessionStorage.setItem(PWD_KEY, pwdInput);
      setAuthed(true);
      loadData(pwdInput);
    } else {
      const a = recordFailedAttempt();
      if (a >= MAX_ATTEMPTS) { setLocked(true); setLoginError(`Слишком много попыток. Блокировка на ${LOCKOUT_MINUTES} мин.`); }
      else setLoginError(`Неверный логин или пароль. Попыток осталось: ${MAX_ATTEMPTS - a}`);
    }
  }

  // --- Config ---
  async function saveConfig() {
    const pwd = getStoredPwd();
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwd, tagline, bio, artDescriptions }),
    });
    setConfigMsg(res.ok ? "✅ Сохранено" : "❌ Ошибка");
    setTimeout(() => setConfigMsg(""), 3000);
  }

  // --- Releases ---
  async function addRelease() {
    if (!newBandlink) return;
    setRelLoading(true); setRelMsg("");
    const pwd = getStoredPwd();
    const res = await fetch("/api/releases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bandlink: newBandlink, password: pwd }),
    });
    const data = await res.json();
    if (res.ok) { setReleases((p) => [data, ...p]); setNewBandlink(""); setRelMsg("✅ Добавлен"); }
    else setRelMsg(`❌ ${data.error}`);
    setRelLoading(false);
    setTimeout(() => setRelMsg(""), 4000);
  }

  async function uploadCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadingCoverId) return;
    const pwd = getStoredPwd();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("releaseId", uploadingCoverId);
    formData.append("password", pwd);
    const res = await fetch("/api/upload-cover", { method: "POST", body: formData });
    if (res.ok) {
      const { coverUrl } = await res.json();
      setReleases((p) => p.map((r) => r.id === uploadingCoverId ? { ...r, coverUrl } : r));
    }
    setUploadingCoverId(null);
    e.target.value = "";
  }

  async function saveReleaseDesc(id: string, description: string) {
    const pwd = getStoredPwd();
    await fetch("/api/releases", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, description, password: pwd }),
    });
    setReleases((p) => p.map((r) => r.id === id ? { ...r, description } : r));
    setEditingRelease(null);
  }

  async function deleteRelease(id: string) {
    if (!confirm("Удалить?")) return;
    const pwd = getStoredPwd();
    const res = await fetch("/api/releases", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password: pwd }),
    });
    if (res.ok) setReleases((p) => p.filter((r) => r.id !== id));
  }

  // --- Arts ---
  async function uploadArt(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const pwd = getStoredPwd();
    setArtMsg("Загружаю...");
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", pwd);
      const res = await fetch("/api/upload-art", { method: "POST", body: formData });
      if (!res.ok) { const d = await res.json(); setArtMsg(`❌ ${d.error}`); return; }
      const { filename } = await res.json();
      setUploadedArts((p) => [...p, filename]);
    }
    setArtMsg("✅ Загружено");
    setTimeout(() => setArtMsg(""), 3000);
  }

  async function deleteArt(filename: string) {
    if (!confirm("Удалить?")) return;
    const pwd = getStoredPwd();
    const res = await fetch("/api/upload-art", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, password: pwd }),
    });
    if (res.ok) setUploadedArts((p) => p.filter((a) => a !== filename));
  }

  async function saveArtDescriptions() {
    const pwd = getStoredPwd();
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwd, artDescriptions }),
    });
    setArtMsg(res.ok ? "✅ Сохранено" : "❌ Ошибка");
    setTimeout(() => setArtMsg(""), 3000);
  }

  // --- Videos ---
  function extractYtId(url: string) {
    const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  async function addVideo() {
    const ytId = extractYtId(newYtUrl);
    if (!ytId) { setVideoMsg("❌ Неверная ссылка YouTube"); return; }
    const isShort = newYtUrl.includes("/shorts/");
    const pwd = getStoredPwd();
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtubeId: ytId, title: newVTitle, description: newVDesc, isShort, password: pwd }),
    });
    const data = await res.json();
    if (res.ok) { setVideos((p) => [...p, data]); setNewYtUrl(""); setNewVTitle(""); setNewVDesc(""); setVideoMsg("✅ Добавлено"); }
    else setVideoMsg(`❌ ${data.error}`);
    setTimeout(() => setVideoMsg(""), 3000);
  }

  async function saveVideoEdit(v: Video) {
    const pwd = getStoredPwd();
    await fetch("/api/videos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: v.id, title: v.title, description: v.description, password: pwd }),
    });
    setEditingVideo(null);
  }

  async function deleteVideo(id: string) {
    if (!confirm("Удалить?")) return;
    const pwd = getStoredPwd();
    const res = await fetch("/api/videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password: pwd }),
    });
    if (res.ok) setVideos((p) => p.filter((v) => v.id !== id));
  }

  // ---- Login screen ----
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-white text-center tracking-widest uppercase neon-text">Нейробег</h1>
          <p className="text-white/40 text-center text-sm">Панель управления</p>
          {locked ? (
            <div className="text-center p-4 rounded-lg border border-red-500/30 bg-red-500/10">
              <p className="text-red-400 text-sm">Доступ заблокирован на {lockMins} мин.</p>
            </div>
          ) : (
            <>
              <input type="text" placeholder="Логин" value={loginInput} onChange={(e) => setLoginInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition" />
              <input type="password" placeholder="Пароль" value={pwdInput} onChange={(e) => setPwdInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition" />
              {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
              <button onClick={login} className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition">Войти</button>
            </>
          )}
        </div>
      </div>
    );
  }

  const TABS = [
    { key: "config", label: "Сайт" },
    { key: "releases", label: "Релизы" },
    { key: "arts", label: "Арты" },
    { key: "videos", label: "Видео" },
  ] as const;

  // ---- Admin UI ----
  return (
    <div className="min-h-screen bg-[#050507] text-white px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-widest uppercase neon-text">Админ-панель</h1>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-white/40 hover:text-cyan-400 transition">← На сайт</a>
            <button onClick={() => { sessionStorage.removeItem(PWD_KEY); setAuthed(false); }}
              className="text-xs text-white/30 hover:text-red-400 transition">Выйти</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-1">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm rounded-t-lg transition ${tab === t.key ? "bg-cyan-500 text-black font-bold" : "text-white/50 hover:text-white"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* === CONFIG === */}
        {tab === "config" && (
          <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/3">
            <h2 className="text-sm font-semibold tracking-wider text-cyan-400 uppercase">Настройки сайта</h2>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider">Описание музыканта</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                className="mt-1 w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition resize-none text-sm" />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider">Тэглайн (до 5 слов, пустые не отображаются)</label>
              <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <input key={i} value={tagline[i] || ""} placeholder={`Слово ${i + 1}`}
                    onChange={(e) => {
                      const u = [...tagline];
                      while (u.length < 5) u.push("");
                      u[i] = e.target.value;
                      setTagline(u);
                    }}
                    className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400 transition placeholder-white/20" />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={saveConfig} className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition text-sm">Сохранить</button>
              {configMsg && <span className="text-sm text-white/60">{configMsg}</span>}
            </div>
          </div>
        )}

        {/* === RELEASES === */}
        {tab === "releases" && (
          <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/3">
            <h2 className="text-sm font-semibold tracking-wider text-cyan-400 uppercase">Релизы</h2>
            <div className="flex gap-2">
              <input type="url" placeholder="https://band.link/..." value={newBandlink} onChange={(e) => setNewBandlink(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRelease()}
                className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition text-sm" />
              <button onClick={addRelease} disabled={relLoading}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold rounded-lg transition text-sm whitespace-nowrap">
                {relLoading ? "..." : "+ Добавить"}
              </button>
            </div>
            {relMsg && <p className="text-sm text-white/60">{relMsg}</p>}

            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={uploadCover} />
            <div className="space-y-3">
              {releases.map((r) => (
                <div key={r.id} className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-12 h-12 rounded overflow-hidden border border-white/20 shrink-0 cursor-pointer hover:border-cyan-400 transition relative group"
                        onClick={() => { setUploadingCoverId(r.id); coverInputRef.current?.click(); }}
                      >
                        {r.coverUrl
                          ? <img src={r.coverUrl} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20 text-lg">🖼</div>
                        }
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-cyan-400 text-xs">↑</div>
                      </div>
                      <p className="text-sm font-medium truncate">{r.title}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => { setEditingRelease(editingRelease === r.id ? null : r.id); setRelDesc(r.description || ""); }}
                        className="text-xs text-cyan-400/60 hover:text-cyan-400 transition">Описание</button>
                      <button onClick={() => deleteRelease(r.id)} className="text-xs text-red-400/60 hover:text-red-400 transition">Удалить</button>
                    </div>
                  </div>
                  {editingRelease === r.id && (
                    <div className="space-y-2">
                      <textarea value={relDesc} onChange={(e) => setRelDesc(e.target.value)} rows={4}
                        placeholder="Описание релиза..."
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-xs resize-none focus:outline-none focus:border-cyan-400 transition" />
                      <div className="flex gap-2">
                        <button onClick={() => saveReleaseDesc(r.id, relDesc)}
                          className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-lg transition">Сохранить</button>
                        <button onClick={() => setEditingRelease(null)} className="text-xs text-white/40 hover:text-white transition">Отмена</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {releases.length === 0 && <p className="text-white/30 text-sm">Нет релизов</p>}
            </div>
          </div>
        )}

        {/* === ARTS === */}
        {tab === "arts" && (
          <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/3">
            <h2 className="text-sm font-semibold tracking-wider text-cyan-400 uppercase">Арты</h2>
            <div className="flex items-center gap-3">
              <button onClick={() => artInputRef.current?.click()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm">
                + Загрузить арт
              </button>
              <input ref={artInputRef} type="file" accept="image/*" multiple className="hidden" onChange={uploadArt} />
              {artMsg && <span className="text-sm text-white/60">{artMsg}</span>}
            </div>

            <div className="space-y-4">
              {[...STATIC_ARTS, ...uploadedArts].map((filename) => {
                const label = filename.replace(/^\d+\.\s*/, "").replace(/\.[^.]+$/, "");
                const isUploaded = uploadedArts.includes(filename);
                return (
                  <div key={filename} className="flex gap-3 items-start p-3 rounded-lg bg-white/5 border border-white/10">
                    <img src={`/images/${filename}`} alt={label}
                      className="w-16 h-16 rounded object-cover shrink-0 border border-white/10" />
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-xs text-white/60 truncate">{label}</p>
                      <textarea
                        value={artDescriptions[filename] || ""}
                        onChange={(e) => setArtDescriptions((p) => ({ ...p, [filename]: e.target.value }))}
                        rows={2}
                        placeholder="Описание арта..."
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs resize-none focus:outline-none focus:border-cyan-400 transition"
                      />
                    </div>
                    {isUploaded && (
                      <button onClick={() => deleteArt(filename)} className="text-xs text-red-400/60 hover:text-red-400 transition shrink-0">✕</button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={saveArtDescriptions}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black font-bold rounded-lg transition text-sm select-none">
                Сохранить описания
              </button>
              {artMsg && <span className="text-sm text-white/60">{artMsg}</span>}
            </div>
          </div>
        )}

        {/* === VIDEOS === */}
        {tab === "videos" && (
          <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/3">
            <h2 className="text-sm font-semibold tracking-wider text-cyan-400 uppercase">Видео</h2>
            <div className="space-y-2">
              <input type="url" placeholder="Ссылка YouTube (обычное или Short)" value={newYtUrl}
                onChange={(e) => setNewYtUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition text-sm" />
              <input type="text" placeholder="Название (необязательно)" value={newVTitle}
                onChange={(e) => setNewVTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition text-sm" />
              <textarea placeholder="Описание (необязательно)" value={newVDesc} rows={2}
                onChange={(e) => setNewVDesc(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 transition text-sm resize-none" />
              <button onClick={addVideo}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition text-sm">
                + Добавить
              </button>
              {videoMsg && <p className="text-sm text-white/60">{videoMsg}</p>}
            </div>

            <div className="space-y-3">
              {videos.map((v) => (
                <div key={v.id} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`} alt=""
                        className="w-16 h-10 rounded object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-white/80 truncate">{v.title || v.youtubeId}</p>
                        {v.isShort && <span className="text-xs text-purple-400">Short</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setEditingVideo(editingVideo === v.id ? null : v.id)}
                        className="text-xs text-cyan-400/60 hover:text-cyan-400 transition">Изменить</button>
                      <button onClick={() => deleteVideo(v.id)} className="text-xs text-red-400/60 hover:text-red-400 transition">Удалить</button>
                    </div>
                  </div>
                  {editingVideo === v.id && (
                    <div className="space-y-2">
                      <input type="text" value={v.title} placeholder="Название"
                        onChange={(e) => setVideos((p) => p.map((x) => x.id === v.id ? { ...x, title: e.target.value } : x))}
                        className="w-full bg-white/5 border border-white/20 rounded px-3 py-1 text-white text-xs focus:outline-none focus:border-cyan-400" />
                      <textarea value={v.description} rows={2} placeholder="Описание"
                        onChange={(e) => setVideos((p) => p.map((x) => x.id === v.id ? { ...x, description: e.target.value } : x))}
                        className="w-full bg-white/5 border border-white/20 rounded px-3 py-1 text-white text-xs resize-none focus:outline-none focus:border-cyan-400" />
                      <div className="flex gap-2">
                        <button onClick={() => saveVideoEdit(v)}
                          className="px-3 py-1 bg-cyan-500 text-black text-xs font-bold rounded transition">Сохранить</button>
                        <button onClick={() => setEditingVideo(null)} className="text-xs text-white/40 hover:text-white transition">Отмена</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {videos.length === 0 && <p className="text-white/30 text-sm">Нет видео</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
