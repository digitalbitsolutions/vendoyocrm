// Almacenamiento seguro de credenciales.
// En nativo usa expo-secure-store; en web cae a AsyncStorage.
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isWeb = typeof document !== "undefined";

// Política por defecto (segura y recomendada):
// - Accesible SOLO cuando el dispositivo está desbloqueado
// - NO se sincroniza (permanece en este dispositivo)
const DEFAULT_ACCESS = SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY;

/**
 * Guarda un valor (string u objeto) de forma segura.
 * En web cae a AsyncStorage (usa HTTPS + HTTPSOnly cookies en backend para tokens reales).
 */
export async function saveSecure(key, value, options = {}) {
  const data = typeof value === "string" ? value : JSON.stringify(value);
  if (isWeb) return AsyncStorage.setItem(key, data);
  return SecureStore.setItemAsync(key, data, {
    keychainAccessible: DEFAULT_ACCESS,
    ...options, // te permite sobreescribir la política en llamadas puntuales
  });
}

/**
 * Lee un valor seguro. Si fue guardado como objeto, lo parsea.
 */
export async function readSecure(key) {
  const raw = isWeb
    ? await AsyncStorage.getItem(key)
    : await SecureStore.getItemAsync(key);

  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw; // era string plano
  }
}

/**
 * Elimina un valor seguro.
 */

export async function deleteSecure(key) {
  if (isWeb) return AsyncStorage.removeItem(key);
  return SecureStore.deleteItemAsync(key);
}
