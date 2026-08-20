"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useHistory } from "./hooks/useHistory";
import Gallery from "./components/Gallery";

const DEFAULT_TITLE = 'Hati-hati kebiasaan ini diam-diam mencetak "MONSTER KECIL" saat anak tantrum atau susah diatur';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("/demo.jpg");
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { history, loaded, addCover, removeCover, clearAll } = useHistory();

  const titleCount = useMemo(() => title.trim().length, [title]);

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0];
    if (!next) return;
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setResult("");
    setError("");
  }

  async function generate() {
    if (!file) {
      setError("Upload foto anak terlebih dahulu.");
      return;
    }
    if (!title.trim()) {
      setError("Masukkan judul cover.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const body = new FormData();
      body.append("image", file);
      body.append("title", title.trim());

      const res = await fetch("/api/generate", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat cover.");
      setResult(data.image);
      await addCover(title.trim(), data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <div className="eyebrow">PARENTING COVER AI</div>
          <h1>Foto asli + judul.<br /><span>Cover parenting siap upload.</span></h1>
          <p className="lead">Master style sudah dikunci: warm pastel, scrapbook editorial, bold rounded typography, sticker, doodle, dan foto anak tetap natural.</p>
        </div>
        <div className="brand-dot">4:5</div>
      </section>

      <section className="workspace">
        <div className="panel controls">
          <div className="panel-title">01 · Foto anak</div>
          <label className="upload">
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFileChange} />
            <div className="upload-icon">＋</div>
            <strong>{file ? file.name : "Upload foto asli"}</strong>
            <span>JPG, PNG atau WEBP · maksimal 20 MB</span>
          </label>

          <div className="panel-title space">02 · Judul cover</div>
          <textarea value={title} onChange={(e) => setTitle(e.target.value)} maxLength={240} />
          <div className="counter">{titleCount}/240</div>

          <div className="rules">
            <div><b>STYLE TERKUNCI</b><span>Warm pastel · scrapbook · sticker</span></div>
            <div><b>FOTO</b><span>Natural crop · no stretch · no identity change</span></div>
            <div><b>TEKS</b><span>Hanya judul yang kamu masukkan</span></div>
          </div>

          <button className={`generate${loading ? " loading-pulse" : ""}`} onClick={generate} disabled={loading}>
            {loading ? "Sedang membuat cover…" : "✨ GENERATE COVER"}
          </button>
          {error && <div className="error">{error}</div>}
        </div>

        <div className="panel preview-panel">
          <div className="panel-title">03 · Preview</div>
          <div className="canvas-wrap">
            {loading ? (
              <div className="loading-overlay">
                <div className="loading-spinner" />
                <div className="loading-dots"><span /><span /><span /></div>
                <div className="loading-text">
                  Membuat cover kamu…
                  <span>Butuh waktu 10-30 detik, sabar ya ☺️</span>
                </div>
              </div>
            ) : result ? (
              <img src={result} alt="Hasil cover parenting" className="result" />
            ) : (
              <div className="placeholder">
                <img src={preview} alt="Preview foto" />
                <div className="placeholder-copy">
                  <span>PREVIEW 4:5</span>
                  <strong>Hasil cover<br />akan muncul di sini.</strong>
                </div>
              </div>
            )}
          </div>
          {result && (
            <a className="download" href={result} download="parenting-cover.png">↓ Download PNG</a>
          )}
          <p className="note">Tip: jika hasil pertama belum pas, generate ulang dengan judul yang sama untuk mendapatkan variasi komposisi.</p>
        </div>
      </section>

      {loaded && history.length > 0 && (
        <Gallery items={history} onRemove={removeCover} onClearAll={clearAll} />
      )}

      <footer>Parenting Cover AI · 4:5 · Warm Pastel Brand DNA</footer>
    </main>
  );
}
