// -------------------------------------------------------------------------------------
// Servicio de configuraciones generales
// - Lee/guarda preferencias globales de la app (apariencia, empresa, formatos)
// - Soporta modo "mock" (sin backend) usando AsyncStorage local
// - Usa http.js para backend real
// -------------------------------------------------------------------------------------

import AsyncStorage from "@react-native-async-storage/async-storage";
import { http, isMockMode } from "./http";

// Clave de almacenamiento local (en modo mock)
const SETTINGS_KEY = "settings.v1";

// Configuración por defecto (si aún no existe nada guardado)
const DEFAULT_SETTINGS = {
  ui: {
    mode: "light", // "light" | "dark"
  },
  account: {
    company: {
      name: "Vendoyo",
      taxId: "B12345678",
      address: "Carrer de la empresa",
      phone: "+34 600 000 000",
      whatsapp: "+34 600 000 000",
      email: "contacto@vendoyo.com",
      logoUrl: null,
    },
  },
  workflow: {
    refPrefix: "CV-",
    autoNumber: true,
    counter: 37,
    dateFormat: "DD/MM/YYYY",
    timezone: "Europe/Madrid",
  },
};

// ------------------------------------------------------------------------------------
// MOCK MODE (sin backend): guardamos en AsyncStorage local
// ------------------------------------------------------------------------------------
async function mockGetSettings() {
  try {
    const saved = await AsyncStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function mockSaveSettings(data) {
  const merged = { ...DEFAULT_SETTINGS, ...data };
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  return merged;
}

// ------------------------------------------------------------------------------------
// API MODE (con backend real)
// ------------------------------------------------------------------------------------
async function apiGetSettings() {
  return await http.get("/settings");
}

async function apiSaveSettings(data) {
  return await http.put("/settings", data);
}

// ------------------------------------------------------------------------------------
// API pública del servicio
// ------------------------------------------------------------------------------------

/**
 * Obtiene la configuración actual (mock o real según el modo)
 */
export async function getSettings() {
  if (isMockMode()) return await mockGetSettings();
  return await apiGetSettings();
}

/**
 * Guarda cambios en la configuración (mock o real)
 */
export async function saveSettings(data) {
  if (isMockMode()) return await mockSaveSettings(data);
  return await apiSaveSettings(data);
}

/**
 * Restaura configuración de fábrica (solo modo mock)
 */
export async function resetSettings() {
  if (isMockMode()) {
    await AsyncStorage.removeItem(SETTINGS_KEY);
    return DEFAULT_SETTINGS;
  }
  // En backend real, opcionalmente podrías hacer DELETE /settings/reset
  return DEFAULT_SETTINGS;
}
