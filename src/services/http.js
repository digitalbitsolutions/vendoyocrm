// ------------------------------------------------------------------------------------
// Capa HTTP única para toda la app.
// - Detecta si hay BACKEND real (EXPO_PUBLIC_API_URL). Si no, "modo mock".
// - Inyecta el token de sesión (si existe) en Authorization: Bearer <token>
// - Ofrece helpers: get/post/put/patch/delete, json(), upload()
// - Normaliza errores y timeouts
// ------------------------------------------------------------------------------------

import { readSecure } from "./storage";

// Clave donde guardamos la sesión completa (la usa tu auth.js)
const SESSION_KEY = "session.v1";

// Tomamos la URL base del backend; si no existe, trabajamos en modo mock.
const RAW_BASE_URL = process.env.EXPO_PUBLIC_API_URL || null;
const BASE_URL = RAW_BASE_URL ? RAW_BASE_URL.replace(/\/$/, "") : null;

// ---------- Utils de bajo nivel ----------

/** Une base + path sin duplicar barras */
function joinURL(base, path) {
    if (!base) return path;
    if (!path) return base;
    return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Rechaza con un Error consistente (para catch en UI) */
function httpError(message, status, payload) {
    const err = new Error(message || "Network error");
    if (status != null) err.status = status;
    if (payload != null) err.payload = payload;
    return err;
}

/** Envuelve un fetch con timeout */
function fetchWithTimeout(url, opts = {}, ms = 15000) {
    return new Promise((resolve, reject) => {
        const id = setTimeout(() => reject(httpError("Timeout de red", 408)), ms);
        fetch(url, opts)
            .then((res) => {
                clearTimeout(id);
                resolve(res);
            })
            .catch((e) => {
                clearTimeout(id);
                reject(httpError(e?.message || "Fallo de conexión"));
            });
    });
}

/** Lee JSON si hay, si no texto. Nunca explota por parseo. */
async function safeParse(res) {
    const ct = res.headers.get("content-type") || "";
    const isJson = ct.includes("application/json");
    try {
        return isJson ? await res.json() : await res.text();
    } catch {
        return null;
    }
}

/** Carga el token (si hay sesión persistida) */
async function getAuthToken() {
    const session = await readSecure(SESSION_KEY);
    const data = typeof session === "string" ? JSON.parse(session) : session;
    return data?.token || null;
}

// ---------- Ejecutor principal ----------

/**
 * Ejecuta una petición HTTP:
 * @param {string} path - ruta, p.ej. "/settings"
 * @param {object} opts - { method, headers, body, timroutMs, auth?: boolean }
 * @returns payload ya parseado (JSON o texto)
 */
export async function api(path, opts = {}) {
    // Si no hay BACKEND configurado, devuelve error claro.
    if (!BASE_URL) {
        throw httpError(
            "NO hay EXPO_PUBLIC_API_URL configurada; backend no disponible (modo mock).",
            0
        );
    }

    const url = joinURL(BASE_URL, path);
    const headers = new Headers(opts.headers || {});
    const method = (opts.method || "GET").toUpperCase();
    const timeoutMs = opts.timeoutMs ?? 15000;

    // Si el body es objeto y no traes Content-Type, lo tratamos como JSON
    let body = opts.body;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    if (body && typeof body === "object" && !isFormData && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(body);
    }

    // Cabeceras base
    headers.set("Accept", "application/json, text/plain;q=0.9,*/*;q=0.8");
    headers.set("X-Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");

    // Auth opcional (por defecto sí)
    const mustAuth = opts.auth ?? true;
    if (mustAuth) {
        const token = await getAuthToken();
        if (token) headers.set("Authorization", `Bearer ${token}`);
    }

    // Llamada
    const res = await fetchWithTimeout(
        url,
        {
            method,
            headers,
            body,
            credentials: "omit", // tokens por header; cookies no necesarias
            ...("signal" in opts ? { signal: opts.signal } : null),
        },
        timeoutMs
    );
    const payload = await safeParse(res);

    // Si HTTP no es OK, envolvemos un error con mensaje útil
    if (!res.ok) {
        const msg =
            (payload && (payload.message || payload.error)) ||
            `HTTP ${res.status} - ${res.statusText}`;
        throw httpError(msg, res.status, payload);
    }

    return payload;
}

// ---------- Atajos semánticos ----------

export const http = {
    get: (path, opts) => api(path, { ...(opts || {}), method: "GET" }),
    delete: (path, opts) => api(path, { ...(opts || {}), method: "DELETE" }),
    post: (path, body, opts) => api(path, { ...(opts || {}), method: "POST", body }),
    put: (path, body, opts) => api(path, { ...(opts || {}), method: "PUT", body }),
    patch: (path, body, opts) => api(path, { ...(opts || {}), method: "PATCH", body }),

    /**
     * Subida de archivos (multipart/form-data)
     * @param {string} path
     * @param {object|FormData} data - puede ser FormData o un objeto que convertimos
     */
    upload: async (path, data, opts) => {
        let form;
        if (typeof FormData !== "undefined" && data instanceof FormData) {
            form = data;
        } else {
            form = new FormData();
            Object.entries(data || {}).forEach(([k, v]) => form.append(k, v));
        }
        // NO pongas Content-Type manual para FormData (el boundary lo maneja el runtime)
        return api(path, { ...(opts || {}), method: "POST", body: form });
    },
};

// ---------- Exposición de "modo mock" para capas superiores ----------

/** Devuelve tru si NO hay backend y deberías usar mocks en ese servicio */
export const isMockMode = () => !BASE_URL;

/** Útil si quieres inspeccionar/mostrar a soporte */
export const getBaseURL = () => BASE_URL;