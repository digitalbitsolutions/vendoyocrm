// file: src/services/mockApi.js
// Mocks ligeros para desarrollo: properties + login
// Versión corregida y robusta — reemplaza el actual src/services/mockApi.js

const properties = require("../../mocks/properties.json");

// pequeño helper para simular latencia de red
const wait = (ms = 200) => new Promise((r) => setTimeout(r, ms));

/**
 * Devuelve la lista completa de propiedades (mock)
 */
export const getProperties = async () => {
  await wait();
  return properties;
};

/**
 * Devuelve una propiedad por id (mock)
 */
export const getPropertyById = async (id) => {
  await wait();
  return properties.find((p) => p.id === id) || null;
};

/**
 * Mock de login que acepta ambas firmas:
 *  - login(email, password)
 *  - login({ email, password })
 *
 * Devuelve { token, user } cuando email === 'demo@vendoyo.es'
 */
export const login = async (emailOrPayload, maybePassword) => {
  await wait();

  // Soportamos las dos firmas
  let email;
  let password;
  if (typeof emailOrPayload === "object" && emailOrPayload !== null) {
    email = emailOrPayload.email;
    password = emailOrPayload.password;
  } else {
    email = emailOrPayload;
    password = maybePassword;
  }

  // Validaciones claras
  if (!email || typeof email !== "string" || !email.includes("@")) {
    throw new Error("E-mail no válido (mock)");
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres (mock)");
  }

  // Usuario demo válido
  if (email.toLowerCase() === "demo@vendoyo.es") {
    return {
      token: "demo-token",
      user: { id: "u_demo", email: "demo@vendoyo.es", name: "demo" },
    };
  }

  // Si no coincide el demo
  throw new Error("Invalid credentials (mock)");
};
