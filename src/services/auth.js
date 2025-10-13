// --------------------------------------------------------------------------------------
// Servicio de autenticación.
// - Intenta usar un backend real si existe EXPO_PUBLIC_API_URL.
// - Si no hay backend, cae en un MOCK local (útil durante desarrollo).
// - Persiste la sesión completa ({ token, user }) en almacenamiento seguro.
// - API pública: login, register, logout, getSession, sendPasswordReset.
// -------------------------------------------------------------------------------------
//
// Backend esperado (ajustar con tu equipo):
// POST /auth/login      -> { token, user: {...} }
// POST /auth/register   -> { token, user: {...} }
// POST /auth/forgot     -> { ok: true }
// Si el backend usa otras claves (profile/data/access_token), las mapeamos abajo.
//

import { saveSecure, readSecure, deleteSecure } from "./storage";

// ----- Configuración -----------------------------------------------------------------

// Clave única donde guardamos toda la sesión (versionable)
const SESSION_KEY = "session.v1";

// Tomamos la URL pública del backend (si existe) y la normalizamos SIN "/" final
const RAW_BASE_URL = process.env.EXPO_PUBLIC_API_URL || null;
const BASE_URL = RAW_BASE_URL ? RAW_BASE_URL.replace(/\/$/, "") : null;

// Email considerado "admin" en modo MOCK (configurable por ENV)
const ADMIN_EMAILS = (process.env.EXPO_PUBLIC_ADMIN_EMAILS || "admin@vendoyo.es")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

// helper para saber si un email debe ser admin en el mock
function isAdminEmail(email = "") {
    return ADMIN_EMAILS.includes(email.toLowerCase());
}

// ----- Utilidades internas -----------------------------------------------------------

/** Simula latencia de red en mocks */
const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

/** Crea un Error consistente para UI/logging */
function raise(message, status, payload) {
    const err = new Error(message || "Network error");
    if (status != null) err.status = status;
    if (payload != null) err.payload = payload;
    throw err;
}

/**
 * POST JSON al backend real.
 * @param {string} path - Ruta que empieza con "/" (p.ej. "/auth/login")
 * @param {object} body - Objeto a serializar como JSON
 */

async function postJSON(path, body) {
    if (!BASE_URL) raise("No hay BASE_URL configurada (EXPO_PUBLIC_API_URL)",0);

    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body || {}),
    });

    // Intentamos parsear JSON; si no hay, leemos texto
    const ct = res.headers.get("content-type") || "";
    const isJson = ct.includes("application/json");
    const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

    if (!res.ok) {
        const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
        raise(msg, res.status, data);
    }

    return data;
}

/**
 *  Mapea una respuesta flexible del backend a nuestra sesión estándar.
 *  Acepta varios nombres de campos para compatibilidad (token/user, access_token/profile, etc.)
 */
function toSessionFrom(response) {
    if (!response) raise("Respuesta vacía del servidor");
    const token =
        response.token ??
        response.access_token ??
        null;

    const user =
        response.user ??
        response.profile ??
        response.data ??
        null;
    
        if (!token) raise("Respuesta sin token del servidor");
        if (!user) raise("Respuesta sin usuario del servidor");

        // si el usuario es admin, le damos un rol especial
        if (user && !user.role) {
            user.role = isAdminEmail(user.email) ? "admin" : "user";
        }

        return { token, user };
}

/** Persiste la sesión completa de forma segura */
async function persistSession(session) {
    await saveSecure(SESSION_KEY, session);   // storage.js ya serializa si hace falta
}

// ----- Mocks (solo si no hay BACKEND) ------------------------------------------------

async function mockLogin({ email, password }) {
    await delay(700);
    if (!email || !email.includes("@")) raise("E-mail no válido");
    if (!password || password.length < 6) raise("La contraseña debe tener al menos 6 caracteres");

    // Asignamos rol en función del email (mock admin)
    const role = isAdminEmail(email) ? "admin" : "user";

    return {
        token: `mock_${Math.random().toString(36).slice(2)}_${Date.now()}`,
        user: {
            id: "u_" + Math.random().toString(36).slice(2, 8),
            email,
            name: email.split("@")[0],
            role,
        },
    };
}

async function mockRegister({ name, email, password }) {
    await delay(900);
    if (!name || name.trim().length < 2) raise("Escribe tu nombre completo");
    if (!email || !email.includes("@")) raise("E-mail no válido");
    if (!password || password.length < 6) raise("La contraseña debe tener al menos 6 caracteres");

    // Devolvemos sesión iniciada respetando el nombre y el rol mock
    const role = isAdminEmail(email) ? "admin" : "user";
    return {
        token: `mock_${Math.random().toString(36).slice(2)}_${Date.now()}`,
        user: {
            id: "u_" + Math.random().toString(36).slice(2, 8),
            email,
            name: name.trim(),
            role,
        },
    };
}

async function mockForgot(email) {
    await delay(800);
    if (!email || !email.includes("@")) raise("E-mail no válido");
    return { ok: true };
}

// ----- API pública del servicio ------------------------------------------------------

/**
 * Inicia sesión:
 *  - Con backend: POST /auth/login
 *  - Sin backend: mock local
 *  - Persiste { token, user } y la devuelve
 */
export async function login({ email, password }) {
    const res = BASE_URL
        ? await postJSON("/auth/login", { email, password })
        : await mockLogin({ email, password });

    const session = toSessionFrom(res);
    await persistSession(session);
    return session;   // { token, user }
}

/**
 *  Registro de usuario:
 *  - Con backend: POST /auth/register
 *  - Sin backend: mock local (y quedas logueado)
 */
export async function register({ name, email, password }) {
    const res = BASE_URL
        ? await postJSON("/auth/register", { name, email, password })
        : await mockRegister({ name, email, password });

    const session = toSessionFrom(res);
    await persistSession(session);
    return session;   // { token, user }
}

/** Cierra la sesión actual (borra storage seguro) */
export async function logout() {
    await deleteSecure(SESSION_KEY);
    return { ok: true };
}

/** Devuelve la sesión persistida (o null) */
export async function getSession() {
    const maybe = await readSecure(SESSION_KEY);
    if (!maybe) return null;
    return typeof maybe === "string" ? JSON.parse(maybe) : maybe;
}

/**
 *  Envia e-mail de restablecimiento:
 *  - Con backend: POST /auth/forgot (ajusta la ruta si tu API usa otra)
 *  - Sin backend: mock local
 */
export async function sendPasswordReset(email) {
    const res = BASE_URL
        ? await postJSON("/auth/forgot", { email })
        : await mockForgot(email);

    return res;   // { ok: true }
}