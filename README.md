# Parenting Cover AI

MVP web app untuk membuat cover parenting 4:5 dari foto asli anak + satu judul. Master visual DNA sudah ditanam di backend agar workflow konsisten.

## Kebutuhan
- Node.js 20+
- OpenAI API key dengan akses image generation

## Jalankan

```bash
npm install
cp .env.example .env.local
```

Isi `.env.local`:

```env
OPENAI_API_KEY=sk-xxxx
OPENAI_IMAGE_MODEL=gpt-image-2
```

Lalu:

```bash
npm run dev
```

Buka http://localhost:3000

## Catatan
- API key hanya dipakai server-side di route `/api/generate`.
- Foto tidak disimpan oleh aplikasi ini; file diterima oleh route untuk satu request lalu dikirim ke OpenAI.
- Model default `gpt-image-2`; route memiliki fallback kompatibilitas ke `gpt-image-1` bila endpoint edit sementara menolak model utama.
- Untuk produksi, tambahkan authentication, rate limiting, logging, storage/history, dan batas biaya per user.
