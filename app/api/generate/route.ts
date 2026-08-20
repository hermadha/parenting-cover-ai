import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";

export const runtime = "nodejs";

const MASTER_STYLE = `
Create a premium social media cover for parenting, motherhood, babies, children and family education.
FORMAT: portrait 4:5.

PHOTO RULES — HIGHEST PRIORITY:
Use the supplied original child photo as the primary subject/reference. Preserve the child's identity, face, expression, face shape, head/body proportions, skin tone, hair, clothes, pose and recognizable characteristics as closely as possible. Do NOT face-replace, invent a new face, change age, beautify excessively, cartoonize, or distort the child. Do NOT stretch the photo. Use natural crop/repositioning only. Keep the child photorealistic.

VISUAL DNA:
Warm Pastel Parenting + Playful Editorial + Cute Scrapbook + Sticker Design. Premium Instagram parenting cover, cute, warm, playful, friendly, modern, aesthetic, cheerful, relatable, child-friendly, motherhood, educational. Avoid corporate, school-poster, generic Canva, cold or overly minimal design.

PALETTE:
Cream, ivory, warm beige, soft tan; sage green, muted olive, moss green; terracotta, burnt orange; dark warm brown. Low-to-medium saturation. Soft, warm, muted and cohesive. No neon or highly saturated colors.

COMPOSITION:
Portrait 4:5. Large dominant typography balanced with the real child photo and decorative framing. Keep typography away from the child's face. Use negative space intelligently. Moderately playful density: decorative but not crowded.

TYPOGRAPHY:
Extra-bold, rounded, chunky, playful, soft, friendly, bubble-like, highly readable. Handmade parenting-poster feel. Use dark brown + sage + terracotta. Strong hierarchy: most important words largest; supporting words smaller. Use thick cream/ivory sticker outline, subtle secondary outline and soft shadow. Typography should look like premium cut-out stickers.

DECORATION:
Organic blobs, curved shapes, wavy borders, rounded blobs, abstract patches, irregular frames, soft brush strokes. Hand-drawn doodles such as leaves, hearts, stars, motion lines, dots, sun, smiley, sparkles, arrows and tiny flowers. Keep doodles as accents. Subtle paper texture / soft grain only.

TEXT RULE — ABSOLUTE:
Display ONLY the exact title supplied by the user. Do not add subtitle, tagline, CTA, caption, website, username, logo, watermark, quote, number, label, decorative words, or any other text. If the title is long, break it creatively into readable lines while preserving the exact wording. Do not invent or paraphrase the title.

FINAL FEEL:
Premium parenting Instagram cover, consistent brand series, warm, playful, cute, modern, educational, relatable, aesthetic, professional.
`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY belum diatur. Salin .env.example menjadi .env.local lalu isi API key." }, { status: 500 });

    const form = await req.formData();
    const image = form.get("image");
    const title = String(form.get("title") || "").trim();
    if (!(image instanceof File)) return NextResponse.json({ error: "File foto tidak ditemukan." }, { status: 400 });
    if (!title) return NextResponse.json({ error: "Judul wajib diisi." }, { status: 400 });
    if (title.length > 240) return NextResponse.json({ error: "Judul terlalu panjang. Maksimal 240 karakter." }, { status: 400 });
    if (!image.type.startsWith("image/")) return NextResponse.json({ error: "File harus berupa gambar." }, { status: 400 });
    if (image.size > 20 * 1024 * 1024) return NextResponse.json({ error: "Ukuran foto maksimal 20 MB." }, { status: 400 });

    const bytes = Buffer.from(await image.arrayBuffer());
    const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
    const prompt = `${MASTER_STYLE}\n\nEXACT COVER TITLE:\n"${title}"\n\nImportant: reproduce the supplied title exactly, with no extra words.`;

    const fd = new FormData();
    fd.append("model", model);
    fd.append("prompt", prompt);
    fd.append("size", "1024x1280");
    fd.append("quality", "medium");
    fd.append("output_format", "png");
    fd.append("n", "1");
    fd.append("image", new Blob([bytes], { type: image.type }), image.name || "child-photo.jpg");

    let response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: fd,
    });

    // If a deployment temporarily rejects gpt-image-2 on the edit endpoint,
    // retry with gpt-image-1, which is the compatibility fallback.
    if (!response.ok && model === "gpt-image-2") {
      const firstText = await response.text();
      if (firstText.toLowerCase().includes("invalid value") || firstText.toLowerCase().includes("model")) {
        const fallback = new FormData();
        fallback.append("model", "gpt-image-1");
        fallback.append("prompt", prompt);
        fallback.append("size", "1024x1536");
        fallback.append("quality", "high");
        fallback.append("n", "1");
        fallback.append("image", new Blob([bytes], { type: image.type }), image.name || "child-photo.jpg");
        response = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers: { Authorization: `Bearer ${apiKey}` }, body: fallback });
      } else {
        return NextResponse.json({ error: `OpenAI error: ${firstText}` }, { status: response.status });
      }
    }

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: `OpenAI error: ${text}` }, { status: response.status });
    }

    const data = await response.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return NextResponse.json({ error: "OpenAI tidak mengembalikan gambar." }, { status: 502 });

    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected server error" }, { status: 500 });
  }
}
