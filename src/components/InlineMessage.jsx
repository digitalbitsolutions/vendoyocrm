import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../style/theme";

/* ---------------- utils ---------------- */
const withAlpha = (color, a = 0.1) => {
  if (!color) return `rgba(0,0,0,${a})`;
  if (color.startsWith("rgba")) {
    const m = color.match(/rgba?\(([^)]+)\)/);
    if (!m) return color;
    const [r, g, b] = m[1]
      .split(",")
      .slice(0, 3)
      .map((s) => parseFloat(s));
    return `rgba(${r},${g},${b},${a})`;
  }
  if (color.startsWith("rgb(")) {
    const nums = color.match(/\d+/g) || [0, 0, 0];
    const [r, g, b] = nums.map((n) => parseInt(n, 10));
    return `rgba(${r},${g},${b},${a})`;
  }
  let c = color.replace("#", "");
  if (c.length === 3)
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

/* ---------------- component ---------------- */
/**
 * InlineMessage
 * Props:
 * - type: "success" | "error" | "warning" | "info" (default "info")
 * - variant: "soft" | "outline" | "solid" (default "soft")
 * - title?: string
 * - children?: ReactNode (texto/explicación)
 * - compact?: boolean (reduce paddings y tamaños)
 * - onClose?: () => void  (muestra botón de cerrar si se pasa)
 * - actions?: Array<{ label: string, onPress: () => void }>
 * - style?: ViewStyle
 * - testID?: string
 */
export function InlineMessage({
  type = "info",
  variant = "soft",
  title,
  children,
  compact = false,
  onClose,
  actions = [],
  style,
  testID,
}) {
  const { theme } = useTheme();
  const s = useMemo(() => mkStyles(theme), [theme]);

  const palette = useMemo(
    () => ({
      success: { color: theme.colors.success, icon: "checkmark-circle" },
      error: { color: theme.colors.error, icon: "close-circle" },
      warning: { color: theme.colors.warning, icon: "alert-circle" },
      info: { color: theme.colors.primary, icon: "information-circle" },
    }),
    [theme]
  );

  const tone = palette[type] ?? palette.info;

  // backgrounds/borders según variante
  const bg =
    variant === "solid"
      ? tone.color
      : variant === "outline"
      ? "transparent"
      : /* soft */ withAlpha(tone.color, theme.mode === "dark" ? 0.18 : 0.12);

  const borderColor =
    variant === "outline"
      ? withAlpha(tone.color, 0.45)
      : withAlpha(tone.color, 0.25);

  const textColor =
    variant === "solid"
      ? theme.mode === "dark"
        ? theme.colors.onDanger
        : theme.colors.onAccent
      : theme.colors.text;

  const iconColor =
    variant === "solid"
      ? theme.mode === "dark"
        ? theme.colors.onDanger
        : theme.colors.onAccent
      : tone.color;

  const padY = compact ? 8 : 12;
  const padX = compact ? 10 : 14;

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        s.wrap,
        {
          paddingVertical: padY,
          paddingHorizontal: padX,
          backgroundColor: bg,
          borderColor,
        },
        style,
      ]}
    >
      {/* icono */}
      <Ionicons
        name={tone.icon}
        size={compact ? 16 : 18}
        color={iconColor}
        style={s.icon}
      />

      {/* contenido */}
      <View style={{ flex: 1 }}>
        {!!title && (
          <Text
            style={[s.title, { color: textColor, fontSize: compact ? 13 : 14 }]}
            numberOfLines={2}
          >
            {title}
          </Text>
        )}
        {children ? (
          <Text
            style={[
              s.text,
              {
                color: textColor,
                marginTop: title ? 2 : 0,
                fontSize: compact ? 13 : 14,
              },
            ]}
          >
            {children}
          </Text>
        ) : null}

        {/* acciones inline */}
        {Array.isArray(actions) && actions.length > 0 && (
          <View style={[s.actionsRow, { marginTop: 8 }]}>
            {actions.map((a, idx) => (
              <Pressable
                key={`${a.label}-${idx}`}
                onPress={a.onPress}
                hitSlop={theme.hitSlop}
                accessibilityRole="button"
                style={({ pressed }) => [
                  s.actionBtn,
                  pressed && { opacity: theme.opacity.pressed },
                ]}
              >
                <Text style={[s.actionText, { color: tone.color }]}>
                  {a.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* botón cerrar */}
      {typeof onClose === "function" && (
        <Pressable
          onPress={onClose}
          hitSlop={theme.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Cerrar mensaje"
          android_ripple={{
            color: withAlpha(tone.color, 0.25),
            borderless: true,
          }}
          style={s.closeBtn}
        >
          <Ionicons name="close" size={compact ? 16 : 18} color={iconColor} />
        </Pressable>
      )}
    </View>
  );
}

/* ---------------- styles ---------------- */
const mkStyles = (theme) =>
  StyleSheet.create({
    wrap: {
      borderWidth: 1,
      borderRadius: theme.radius.md,
      flexDirection: "row",
      alignItems: "flex-start",
      ...theme.shadow,
      ...(Platform.OS === "android" ? { elevation: 0 } : null), // inline message: sombra suave/casi nula
    },
    icon: {
      marginRight: 10,
      marginTop: 1,
    },
    title: {
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    text: {
      lineHeight: 20,
    },
    actionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    actionBtn: {
      paddingVertical: 2,
    },
    actionText: {
      fontWeight: "700",
      textDecorationLine: "underline",
    },
    closeBtn: {
      marginLeft: 10,
      padding: 4,
      borderRadius: 16,
      alignSelf: "center",
    },
  });
