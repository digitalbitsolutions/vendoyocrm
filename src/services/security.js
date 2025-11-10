// ---------------------------------------------------------------------------------------------
// Servicio de seguridad (cambio de contraseña)
// - Si hay backend: PUT /users/me/password { currentPassword, newPassword }
// - Si no hay backend (mock): valida que currentPassword === "123456" (de demo) y guarda marca
// ---------------------------------------------------------------------------------------------
import AsyncStorage from "@react-native-async-storage/async-storage";
import { http, isMockMode } from "./http";

const KEY_LAST_PASSWORD_CHANGE = "security.lastPasswordChangeAt.v1";

// Contraseña "actual" válida en modo MOCK (para demo)
export const MOCK_DEMO_CURRENT_PASSWORD = "123456";

// ---------- Utilidades ----------
function httpError(message, status) {
    const err = new Error(message || "Error de validación");
    if (status != null) err.status = status;
    return err;
}

/** Normaliza respuestas del backend: { ok: true } | { success: true } | 204 sin cuerpo */
function normalizeOk(response, statusCode) {
    if (statusCode === 204) return { ok: true };
    if (!response || typeof response !== "object") return { ok: true };
    if ("ok" in response) return { ok: !!response.ok };
    if ("success" in response) return { ok: !!response.success };
    return { ok: true };
}

/** Valida mínimamente la nueva contraseña */
function validateNewPassword(currentPassword, newPassword) {
    if (!newPassword || newPassword.length < 6) {
        throw httpError("La nueva contraseña debe tener al menos 6 caracteres", 422);
    }
    if (newPassword === currentPassword) {
        throw httpError("La nueva contraseña no puede ser igual a la actual", 422);
    }
}

// ---------- Mock ----------
async function mockChangePassword({ currentPassword, newPassword }) {
    // Validaciones mínimas (DX)
    validateNewPassword(currentPassword, newPassword);

    if (currentPassword !== MOCK_DEMO_CURRENT_PASSWORD) {
        throw httpError("La contraseña actual no es correcta (demo)", 400);
    }

    // Marca de último cambio (para mostrar en UI)
    await AsyncStorage.setItem(KEY_LAST_PASSWORD_CHANGE, new Date().toISOString());
    return { ok: true };
}

// ---------- API real ----------
async function apiChangePassword(payload){
    // Ajusta si tu backend usa otra ruta o verbo
    const res = await http.put("/users/me/password", payload);
    // No todos los backends devuelven cuerpo; devolvemos algo estándar
    return normalizeOk(res, 200);
}

// ---------- API pública ----------
/**
 * Cambia la contraseña del usuario
 * @param {{ currentPassword: string, newPassword: string }} params
 * @returns {{ ok: boolean }}
 */
export async function changePassword({ currentPassword, newPassword }) {
    // Validaciones generales antes de tocar red/mock
    validateNewPassword(currentPassword, newPassword);

    let out;
    if (isMockMode()) {
        out = await mockChangePassword({ currentPassword, newPassword });
    } else {
        out = await apiChangePassword({ currentPassword, newPassword });
    }

    // Guardamos marca local de último cambio también en modo API (útil para mostrar en UI)
    try {
        await AsyncStorage.setItem(KEY_LAST_PASSWORD_CHANGE, new Date().toISOString());
    }   catch {}

    return out;
}

/**
 * Devuelve el ISO string del último cambio de contraseña guardado localmente (o null)
 */
export async function getLastPasswordChangeISO() {
    return (await AsyncStorage.getItem(KEY_LAST_PASSWORD_CHANGE)) || null;
}