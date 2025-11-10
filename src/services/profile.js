// ------------------------------------------------------------------------------------
// Servicio de perfil de usuario
// - Obtiene y actualiza los datos del usuario autenticado
// - Funciona con backend real o en modo mock (sin backend)
// - Depende de http.js y storage.js
// -------------------------------------------------------------------------------------

import { http, isMockMode } from "./http";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Clave usada para almacenar el perfil local en modo mock
const PROFILE_KEY = "user.profile.v1";

// Datos simulados por defecto
const DEFAULT_PROFILE = {
    id: "mock-user-001",
    name: "Miguel Yesan",
    email: "manager@digitalbitsolutions.com",
    phone: "+34 600 000 000",
    role : "admin",
    avatarUrl: null,
    createdAt: "2025-06-21T10:00:00Z",
    updatedAt: "2025-06-21T10:00:00Z",
};

// -------------------------------------------------------------------------------------
// MOCK MODE (sin backend): usamos AsyncStorage local
// -------------------------------------------------------------------------------------
async function mockGetProfile() {
    try {
        const saved = await AsyncStorage.getItem(PROFILE_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
        return DEFAULT_PROFILE;
    }
}

async function mockUpdateProfile(data) {
    const current = await mockGetProfile();
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    return updated;
}

async function mockDeleteProfile() {
    await AsyncStorage.removeItem(PROFILE_KEY);
    return { ok: true };
}

// -------------------------------------------------------------------------------------
// API MODE (con backend real)
// -------------------------------------------------------------------------------------
async function apiGetProfile() {
    return await http.get("/users/me"); // Ruta estándar REST
}

async function apiUpdateProfile(data) {
    return await http.put("/users/me", data);
}

async function apiDeleteProfile() {
    return await http.delete("/users/me");
}

// -------------------------------------------------------------------------------------
// API pública del servicio
// -------------------------------------------------------------------------------------

/**
 * Obtiene el perfil actual del usuario.
 * (mock o real según el modo)
 */
export async function getProfile() {
    if (isMockMode()) return await mockGetProfile();
    return await apiGetProfile();
}

/**
 * Actualiza los datos del perfil (nombre, email, teléfono, etc.)
 */
export async function updateProfile(data) {
    if (isMockMode()) return await mockUpdateProfile(data);
    return await apiUpdateProfile(data);
}

/**
 * Elimina la cuenta del usuario actual (con confirmación previa)
 */
export async function deleteAccount() {
    if (isMockMode()) return await mockUpdateProfile(data);
    return await apiUpdateProfile(data);
}


