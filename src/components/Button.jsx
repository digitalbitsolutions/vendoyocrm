// src/components/Button.jsx
import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  Platform,
  View,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../style/theme";

export function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary", // "primary" | "secondary" | "danger" | "outline" | "ghost"
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
}) {
  const { theme } = useTheme();
  const s = mkStyles(theme);

  // Color del texto por variante (siempre desde el theme)
  const textColor =
    variant === "primary"
      ? theme.colors.onAccent
      : variant === "secondary"
      ? theme.colors.onSecondary
      : variant === "danger"
      ? theme.colors.onDanger
      : variant === "outline"
      ? theme.colors.primary
      : variant === "ghost"
      ? theme.colors.primary
      : theme.colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={{ color: theme.colors.primary400, borderless: false }}
      style={({ pressed }) => [
        s.base,
        s[variant], // aplica estilo de la variante
        fullWidth && { alignSelf: "stretch" },
        (disabled || loading) && s.disabled,
        pressed && s.pressed,
      ]}
      hitSlop={theme.hitSlop}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      <View style={s.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={textColor}
            style={{ marginRight: 8 }}
          />
        ) : leftIcon ? (
          <View style={{ marginRight: 8 }}>{leftIcon}</View>
        ) : null}

        <Text style={[s.text, { color: textColor }]} numberOfLines={1}>
          {loading ? "Cargando..." : title}
        </Text>

        {rightIcon ? <View style={{ marginLeft: 8 }}>{rightIcon}</View> : null}
      </View>
    </Pressable>
  );
}

const mkStyles = (theme) =>
  StyleSheet.create({
    base: {
      height: 52,
      borderRadius: theme.radius.pill,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      ...theme.shadow,
      ...(Platform.OS === "android" ? { overflow: "hidden" } : null),
      backgroundColor: theme.colors.surface, // la variante define el color final
    },

    /* Variantes conectadas al theme */
    primary: { backgroundColor: theme.colors.primary },
    secondary: { backgroundColor: theme.colors.secondary },
    danger: { backgroundColor: theme.colors.danger },

    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.primary600 ?? theme.colors.primary,
      shadowOpacity: 0,
    },

    ghost: {
      backgroundColor: "transparent",
      shadowOpacity: 0,
    },

    disabled: { opacity: theme.opacity.disabled },
    pressed: { opacity: theme.opacity.pressed },

    text: {
      fontSize: theme.font.h3,
      fontWeight: "900",
    },

    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 2,
      minWidth: 40,
    },
  });
