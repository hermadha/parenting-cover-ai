"use client";

import type { CoverEntry } from "../hooks/useHistory";

interface GalleryProps {
  items: CoverEntry[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "Baru saja";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const d = Math.floor(hr / 24);
  return `${d} hari lalu`;
}

export default function Gallery({ items, onRemove, onClearAll }: GalleryProps) {
  if (items.length === 0) return null;

  return (
    <section className="gallery-section">
      <div className="gallery-header">
        <div>
          <div className="panel-title">COVER SEBELUMNYA</div>
          <p className="gallery-subtitle">
            {items.length} cover tersimpan di browser ini
          </p>
        </div>
        <button className="clear-btn" onClick={onClearAll}>
          Hapus Semua
        </button>
      </div>

      <div className="gallery-grid">
        {items.map((entry) => (
          <div key={entry.id} className="gallery-card">
            <div className="gallery-thumb">
              <img src={entry.image} alt={entry.title} />
            </div>
            <div className="gallery-meta">
              <p className="gallery-title">{entry.title}</p>
              <span className="gallery-time">{timeAgo(entry.createdAt)}</span>
            </div>
            <div className="gallery-actions">
              <a
                className="gallery-dl"
                href={entry.image}
                download={`cover-${entry.id}.png`}
              >
                ↓ Download
              </a>
              <button
                className="gallery-rm"
                onClick={() => onRemove(entry.id)}
                title="Hapus"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
