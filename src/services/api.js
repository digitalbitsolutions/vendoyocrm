// src/services/api.js
// Adaptador entre mocks y cliente real (http + auth)
import * as mock from "./mockApi";
import { http, isMockMode } from "./http";
import * as auth from "./auth";

const useMocks = (process.env.EXPO_USE_MOCKS === "true") || isMockMode();

/** Listar propiedades */
export const getProperties = (opts = {}) => {
  if (useMocks) return mock.getProperties(opts);
  return http.get("/properties", opts);
};

/** Obtener propiedad por id */
export const getPropertyById = (id, opts = {}) => {
  if (useMocks) return mock.getPropertyById(id, opts);
  return http.get(`/properties/${id}`, opts);
};

/** Login */
export const login = async (payload) => {
  if (useMocks) return mock.login(payload);
  if (auth && typeof auth.login === "function") {
    return auth.login(payload);
  }
  return http.post("/auth/login", payload);
};

/** Alias útil */
export const getProperty = getPropertyById;
