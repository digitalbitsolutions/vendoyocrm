import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../style/theme";

// ✅ util pequeño: aplica alpha a un color hex o rgb(a)
const withAlpha = (color, a = 0.1) => {
  if (!color) return `rgba(0,0,0,${a})`;
  if (color.startsWith("rgba")) return color.replace(/rgba\(([^)]+)\)/, (_, inner) => `rgba(${inner.split(",").slice(0,3).join(",")}, ${a})`);
  if (color.startsWith("rgb(")) {
    const [r,g,b] = color.match(/\d+/g) || [0,0,0];
    return `rgba(${r},${g},${b},${a})`;
  }
  // hex #rrggbb
  let c = color.replace("#", "");
  if (c.length === 3) c = c.split("").map(x => x + x).join("");
  const r = parseInt(c.slice(0,2),16);
  const g = parseInt(c.slice(2,4),16);
  const b = parseInt(c.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
};

/**
 * InlineMessage
 * Props:
 * - type: "success" | "error" | "warning" | "info"
 * - children: texto del mensaje
 * - style: estilos adicionales opcionales
 */
export function InlineMessage({ type = "info", children, style }) {
  const { theme } = useTheme();                 
  const s = mkStyles(theme);                    

  const palette = {
    success: { color: theme.colors.success,   icon: "checkmark-circle" },
    error:   { color: theme.colors.error,     icon: "close-circle" },
    warning: { color: theme.colors.warning,   icon: "alert-circle" },
    info:    { color: theme.colors.secondary, icon: "information-circle" },
  };
  const c = palette[type] || palette.info;

  const bgAlpha = theme.mode === "dark" ? 0.18 : 0.10;
  const bg = withAlpha(c.color, bgAlpha);

  return (
    <View
      style={[s.wrap, { backgroundColor: bg, borderColor: withAlpha(c.color, 0.25) }, style]}
      accessibilityRole="alert"                             
    >
      <Ionicons name={c.icon} size={18} color={c.color} style={{ marginRight: 8 }} />
      <Text style={s.text}>{children}</Text>
    </View>
  );
}

const mkStyles = (theme) =>
  StyleSheet.create({
    wrap: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: theme.radius.md,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderWidth: 1,                                 
    },
    text: {
      fontSize: 14,
      color: theme.colors.text,                           
    },
  });
