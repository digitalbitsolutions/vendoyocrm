// src/style/theme.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

let setBackgroundColorAsync = async () => {}; // fallback vacío
try {
  const m = require("expo-system-ui");
  if (m && m.setBackgroundColorAsync) setBackgroundColorAsync = m.setBackgroundColorAsync;
} catch (e) {
  // sin módulo → sin problema
}

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
 * Paletas de color
 * ------------------------------------------ */
const lightColors = {
  primary:    "#FF3333",
  secondary:  "#0066CC",
  accent:     "#FFD600",
  success:    "#2E7D32",
  warning:    "#FFB020",
  background: "#FAFAFA",
  surface:    "#FFFFFF",
  border:     "#E5E7EB",
  text:       "#111827",
  textMuted:  "#6B7280",
  overlay:    "rgba(0,0,0,0.4)",
  muted:      "#6B7280",
  error:      "#FF3333",
  onAccent:   "#111827",
  onSecondary:"#FFFFFF",
  danger:     "#FF4D4D",
  onDanger:   "#FFFFFF",
};

const darkColors = {
  primary:    "#FF6666",
  secondary:  "#4CA3FF",
  accent:     "#FFE066",
  success:    "#8BD694",
  warning:    "#FFC366",
  background: "#0B0F14",
  surface:    "#151B22",
  border:     "#243041",
  text:       "#E5EAF0",
  textMuted:  "#97A6B3",
  overlay:    "rgba(0,0,0,0.6)",
  muted:      "#97A6B3",
  error:      "#FF6666",
  onAccent:   "#111827",
  onSecondary:"#0B0F14",
  danger:     "#FF7B7B",
  onDanger:   "#0B0F14",
};

/* ------------------------------------------
 * Fábrica de temas (light/dark)
 * ------------------------------------------ */
export const createTheme = (mode = "light") => {
  const colors = mode === "dark" ? darkColors : lightColors;
  return {
    ...base,
    colors,
    mode,
    // Derivados útiles (para centralizar criterio del StatusBar, etc.)
    statusBarStyle: mode === "dark" ? "light" : "dark",
    statusBarBg: colors.background, // úsalo si lo prefieres en layouts
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
  const system = useColorScheme(); // "light" | "dark" | null
  const [mode, setMode] = useState("light");

  // 1) Carga preferencia guardada; si no hay, usa el modo del sistema
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

  // 2) Memo del tema + helpers para cambiar/persistir
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

  // 3) Ajusta el color de fondo del sistema (Android nav bar, splash flash)
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
 *  - Mantiene vivas pantallas que aún lo importan estático,
 *    pero para UI dinámica usa SIEMPRE useTheme()
 * ------------------------------------------ */
export const theme = createTheme("light");

/* ------------------------------------------
 * (Opcional) Copia estática por referencia
 * ------------------------------------------ */
export const themeStatic = {
  colors: lightColors,
  ...base,
};
