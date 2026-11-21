// Center-crops a photo to a square and shrinks it before upload, so every card looks consistent
// and each photo stays small (roughly 30–60 KB), which keeps bandwidth within free-tier limits.

const OUTPUT_SIZE = 480;
const QUALITY = 0.82;

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_INPUT_BYTES = 10 * 1024 * 1024;

export async function resizePhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - side) / 2;
    const sy = (bitmap.height - side) / 2;
    const size = Math.min(OUTPUT_SIZE, side);

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available in this browser.");
    context.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Could not process the photo."))),
        "image/jpeg",
        QUALITY,
      );
    });
  } finally {
    bitmap.close();
  }
}
