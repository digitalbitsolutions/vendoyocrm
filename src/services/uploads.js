// -------------------------------------------------------------------------------------
// Servicio de subida de imágenes (avatar, logos, adjuntos...)
// - Si hay BACKEND (EXPO_PUBLIC_API_URL): usa http.upload() -> devuelve { url }
// - Si NO hay backend (modo mock): devuelve la uri local como "url" (sirve para ver el cambio)
// -------------------------------------------------------------------------------------
import { http, isMockMode } from "./http";

// Infere nombre y tipo (MIME) desde la URI cuando no vienen dados
function inferFileMeta(uri = "", fallbackName = "upload.jpg") {
  const lower = uri.toLowerCase();
  const ext = lower.endsWith(".png")
    ? "png"
    : lower.endsWith(".jpg") || lower.endsWith(".jpeg")
    ? "jpg"
    : lower.endsWith(".webp")
    ? "webp"
    : "jpg";
  const type =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  const name = fallbackName.includes(".") ? fallbackName : `upload.${ext}`;
  return { name, type };
}

/**
 * Sube una imagen devuelve { url }
 * @param {object} file - { uri, name?, type? } (Image Picker entrega { uri, ...})
 * @param {object} opts - { folder?: "avatars" | "logos" | ... }
 */
export async function uploadImage(file, opts = {}) {
  if (!file?.uri) throw new Error("Archivo inválido");

  // Modo MOCK: devolvemos la misma URI local (para previsualizar cambios)
  if (isMockMode()) {
    return { url: file.uri };
  }

  // Backend real: multipart/form-data
  const meta = inferFileMeta(file.uri, file.name);
  const form = new FormData();
  form.append("file", {
    uri: file.uri,
    name: file.name || meta.name,
    type: file.type || meta.type,
  });
  if (opts.folder) form.append("folder", opts.folder);

  // Ajusta la ruta según tu backend; esperamos { url: "https://..." }
  const res = await http.upload("/uploads/image", form, { auth: true });
  return res;
}
