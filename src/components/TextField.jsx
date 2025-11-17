import React, { useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../style/theme";

export function TextField({
  label,
  error,
  style,
  onBlur,
  secureTextEntry,
  leftIcon = null,
  rightIcon = null,
  helperText,
  forceLight = false,   // ⬅️ nuevo: modo auth siempre claro
  ...inputProps
}) {
  const { theme } = useTheme();

  // 🎨 paleta: o la del tema normal, o una fija "clara" para auth
  const colors = useMemo(
    () =>
      forceLight
        ? {
            border: "#E5E7EB",
            surface: "#FFFFFF",
            text: "#111827",
            textMuted: "#6B7280",
            error: "#E53935",
            secondary: "#0F4C4A",
          }
        : {
            border: theme.colors.border,
            surface: theme.colors.surface,
            text: theme.colors.text,
            textMuted: theme.colors.textMuted,
            error: theme.colors.error,
            secondary: theme.colors.secondary,
          },
    [forceLight, theme]
  );

  const s = useMemo(() => mkStyles(theme, colors), [theme, colors]);

  const [focused, setFocused] = useState(false);
  const isPassword = !!secureTextEntry;
  const [isSecure, setIsSecure] = useState(isPassword);

  const placeholderColor = colors.textMuted || "#6B7280";

  return (
    <View style={[s.wrap, style]}>
      {label ? <Text style={s.label}>{label}</Text> : null}

      <View style={s.inputWrap}>
        {/* Icono izquierdo (si lo pasas) */}
        {leftIcon ? <View style={s.leftIcon}>{leftIcon}</View> : null}

        <TextInput
          style={[
            s.input,
            isPassword && s.inputWithRightIcon,
            !!leftIcon && s.inputWithLeftIcon,
            focused && s.inputFocused,
            !!error && s.inputError,
          ]}
          placeholderTextColor={placeholderColor}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          {...inputProps}
          secureTextEntry={isPassword ? isSecure : false}
        />

        {/* Ojo (toggle) si es password, si no, rightIcon si existe */}
        {isPassword ? (
          <Pressable
            onPress={() => setIsSecure((v) => !v)}
            style={s.rightBtn}
            hitSlop={theme.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={
              isSecure ? "Mostrar contraseña" : "Ocultar contraseña"
            }
          >
            <Ionicons
              name={isSecure ? "eye" : "eye-off"}
              size={20}
              color={focused ? colors.secondary : (colors.textMuted || "#6B7280")}
            />
          </Pressable>
        ) : (
          rightIcon ? <View style={s.rightIcon}>{rightIcon}</View> : null
        )}
      </View>

      {/* helperText (si no hay error) o error */}
      {error ? (
        <Text style={s.error}>{String(error)}</Text>
      ) : helperText ? (
        <Text style={s.helper}>{helperText}</Text>
      ) : null}
    </View>
  );
}

/* ---------- Estilos dependientes del tema + paleta ---------- */
const mkStyles = (theme, colors) =>
  StyleSheet.create({
    wrap: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    inputWrap: {
      position: "relative",
      justifyContent: "center",
    },
    input: {
      height: 52,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.surface,
      fontSize: 16,
      color: colors.text,
    },

    // Ajustes por iconos
    inputWithRightIcon: { paddingRight: 44 },
    inputWithLeftIcon: { paddingLeft: 44 },

    // Estados
    inputFocused: {
      borderColor: colors.secondary,
    },
    inputError: {
      borderColor: colors.error,
    },

    // Icono derecho (ojito o rightIcon)
    rightBtn: {
      position: "absolute",
      right: 12,
      top: "50%",
      marginTop: -10,
      height: 20,
      width: 20,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2,
    },
    rightIcon: {
      position: "absolute",
      right: 12,
      top: "50%",
      marginTop: -10,
    },

    // Icono izquierdo
    leftIcon: {
      position: "absolute",
      left: 12,
      top: "50%",
      marginTop: -10,
    },

    // Mensajes
    error: {
      marginTop: 6,
      color: colors.error,
      fontSize: 13,
    },
    helper: {
      marginTop: 6,
      color: colors.textMuted,
      fontSize: 13,
    },
  });
