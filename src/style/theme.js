// src/style/theme.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

let setBackgroundColorAsync = async () => {};
try {
  const m = require("expo-system-ui");
  if (m && m.setBackgroundColorAsync) setBackgroundColorAsync = m.setBackgroundColorAsync;
} catch (e) {}

/* ------------------------------------------
 * Tokens base (compartidos por light/dark)
 * ------------------------------------------ */
const base = {
  spacing: { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, xxl: 36 },
  radius: { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 },
  font: { h1: 28, h2: 24, h3: 20, body: 16, small: 14, tiny: 12 },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  zIndex: { base: 1, header: 10, modal: 100, toast: 1000 },
  opacity: { disabled: 0.5, pressed: 0.7 },
  hitSlop: { top: 10, right: 10, bottom: 10, left: 10 },
};

/* ------------------------------------------
 * Paletas de color (Brand Vendoyo)
 *  - primary  : #36AAA7 (turquesa)
 *  - Variantes: para hover/pressed
 * ------------------------------------------ */
const brand = {
  primary500: "#36AAA7",
  primary400: "#58C5C1",
  primary600: "#2F9693",
  primary700: "#257A78",
};

/* Light mode */
const lightColors = {
  // Core brand
  primary: brand.primary500,
  primary400: brand.primary400,
  primary600: brand.primary600,
  primary700: brand.primary700,

  // UI accents
  secondary: "#0F4C4A",          // verde petróleo suave para iconos/acento
  accent:    "#FFD166",          // acento cálido (chips/badges)

  // Feedback
  success:   "#2E7D32",
  warning:   "#F59E0B",
  danger:    "#E53935",
  error:     "#E53935",

  // Surfaces & text
  background: "#F7FBFA",         // casi blanco con tinte menta
  surface:    "#FFFFFF",
  border:     "#DAE9E7",         // gris-menta (borde suave)
  text:       "#0E1B1B",
  textMuted:  "#4F6665",

  // Overlays & contrasts
  overlay:     "rgba(0,0,0,0.40)",
  muted:       "#6B7280",
  onAccent:    "#FFFFFF",        // contraste sobre primary
  onSecondary: "#FFFFFF",
  onDanger:    "#FFFFFF",
};

/* Dark mode */
const darkColors = {
  // Core brand (ligeramente más brillante en dark)
  primary: brand.primary400,
  primary400: brand.primary400,
  primary600: brand.primary600,
  primary700: brand.primary700,

  // UI accents
  secondary: "#6AD3CF",          // acento claro para iconos sobre dark
  accent:    "#FFD166",

  // Feedback
  success:   "#81C784",
  warning:   "#FFB74D",
  danger:    "#EF5350",
  error:     "#EF5350",

  // Surfaces & text
  background: "#0A1414",
  surface:    "#111C1C",
  border:     "#1E2B2B",
  text:       "#E6F4F3",
  textMuted:  "#9EC6C4",

  // Overlays & contrasts
  overlay:     "rgba(0,0,0,0.60)",
  muted:       "#9EA7B3",
  onAccent:    "#0B0F14",        // contraste oscuro si usas accent claro
  onSecondary: "#0B0F14",
  onDanger:    "#0B0F14",
};

/* ------------------------------------------
 * Fábrica de temas (light/dark)
 * ------------------------------------------ */
export const createTheme = (mode = "light") => {
  const colors = mode === "dark" ? darkColors : lightColors;
  return {
    ...base,
    colors,
    brand,                 // por si quieres acceder a la escala directamente
    mode,
    statusBarStyle: mode === "dark" ? "light" : "dark",
    statusBarBg: colors.background,
  };
};

/* ------------------------------------------
 * Contexto + Provider + hook
 * ------------------------------------------ */
const ThemeCtx = createContext({
  theme: createTheme("light"),
  mode: "light",
  setMode: (_m) => {},
  toggleMode: () => {},
});

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [mode, setMode] = useState("light");

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("@pref-theme");
        if (saved === "light" || saved === "dark") {
          setMode(saved);
        } else if (system === "dark" || system === "light") {
          setMode(system);
        }
      } catch {}
    })();
  }, [system]);

  const value = useMemo(() => {
    const theme = createTheme(mode);

    const toggleMode = async () => {
      const next = mode === "light" ? "dark" : "light";
      setMode(next);
      await AsyncStorage.setItem("@pref-theme", next);
    };

    const setModePersist = async (m) => {
      setMode(m);
      await AsyncStorage.setItem("@pref-theme", m);
    };

    return { theme, mode, setMode: setModePersist, toggleMode };
  }, [mode]);

  useEffect(() => {
    (async () => {
      try {
        const bg = createTheme(mode).colors.background;
        await setBackgroundColorAsync(bg);
      } catch {}
    })();
  }, [mode]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);

/* ------------------------------------------
 * Export legacy (modo claro fijo)
 * ------------------------------------------ */
export const theme = createTheme("light");

/* ------------------------------------------
 * (Opcional) Copia estática por referencia
 * ------------------------------------------ */
export const themeStatic = {
  colors: lightColors,
  ...base,
};
