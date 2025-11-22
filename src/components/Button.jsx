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

  const s = mkStyles(theme, textColor, fullWidth);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={{ color: theme.colors.primary400, borderless: false }}
      style={({ pressed }) => [
        s.base,
        s[variant], // aplica estilo de la variante
        fullWidth && s.fullWidth,
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
            style={s.indicator}
          />
        ) : leftIcon ? (
          <View style={s.iconLeft}>{leftIcon}</View>
        ) : null}

        <Text style={s.text} numberOfLines={1}>
          {loading ? "Cargando..." : title}
        </Text>

        {rightIcon ? <View style={s.iconRight}>{rightIcon}</View> : null}
      </View>
    </Pressable>
  );
}

const mkStyles = (theme, textColor, fullWidth) =>
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
      color: textColor,
    },

    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 2,
      minWidth: 40,
    },

    fullWidth: {
      alignSelf: "stretch",
    },

    // icon wrappers / margins (evitan inline styles)
    iconLeft: {
      marginRight: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    iconRight: {
      marginLeft: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    indicator: {
      marginRight: 8,
    },
  });
