// src/components/TextField.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../style/theme";

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  returnKeyType,
  onSubmitEditing,
  onBlur,

  // UX extra
  helperText,
  error,                    // string | boolean
  maxLength,
  showCounter = false,      // muestra 0/140 si hay maxLength

  // variantes & tamaños
  variant = "outline",      // "outline" | "filled" | "ghost"
  size = "md",              // "sm" | "md" | "lg"

  // iconos/slots
  leftIcon = null,
  rightIcon = null,

  // password / limpiar
  secureTextEntry,
  clearable = true,         // botón "x" si hay texto y no es password

  // multiline
  multiline = false,
  minLines = 1,
  maxLines = 6,

  // estilo externo y resto de props (editable, testID, etc.)
  style,
  ...rest
}) {
  const { theme } = useTheme();
  const s = useMemo(() => mkStyles(theme), [theme]);

  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(!!secureTextEntry);
  const [inputHeight, setInputHeight] = useState(undefined);

  const isError = !!error;
  const isPassword = !!secureTextEntry;
  const hasValue = (value ?? "").length > 0;

  // tamaños
  const SZ = {
    sm: { h: 40, padH: 12, fs: 14 },
    md: { h: 52, padH: 14, fs: 16 },
    lg: { h: 60, padH: 16, fs: 17 },
  }[size];

  // colores por estado
  const borderColor = isError
    ? theme.colors.danger
    : focused
    ? theme.colors.primary
    : theme.colors.border;

  const bgColor =
    variant === "filled" ? (theme.mode === "dark" ? "#0F1717" : "#F2F7F6")
    : variant === "ghost" ? "transparent"
    : theme.colors.surface;

  // padding lateral para iconos
  const leftPad = leftIcon ? SZ.padH + 26 : SZ.padH;
  const rightPad = (isPassword || clearable || rightIcon) ? SZ.padH + 26 : SZ.padH;

  // auto-height para multiline
  const onContentSizeChange = (e) => {
    if (!multiline) return;
    const h = e?.nativeEvent?.contentSize?.height ?? SZ.h;
    const lineHeight = 20; // aproximado
    const minH = Math.max(SZ.h, minLines * lineHeight + 16);
    const maxH = maxLines * lineHeight + 16;
    setInputHeight(Math.min(Math.max(h, minH), maxH));
  };

  const placeholderColor = theme.colors.textMuted;

  return (
    <View style={[s.wrap, style]}>
      {/* etiqueta */}
      {label ? <Text style={[s.label, { fontSize: 13, color: theme.colors.text }]}>{label}</Text> : null}

      {/* contenedor del input */}
      <View
        style={[
          s.inputWrap,
          {
            borderColor,
            backgroundColor: bgColor,
            borderWidth: variant === "ghost" ? 0 : 1,
            borderRadius: theme.radius.lg,
          },
        ]}
      >
        {/* icono izquierdo */}
        {leftIcon ? <View style={[s.iconLeft, { left: SZ.padH }]}>{leftIcon}</View> : null}

        {/* campo */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          style={[
            s.input,
            {
              height: multiline ? inputHeight : SZ.h,
              paddingLeft: leftPad,
              paddingRight: rightPad,
              fontSize: SZ.fs,
              color: theme.colors.text,
            },
          ]}
          selectionColor={theme.colors.primary400}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          underlineColorAndroid="transparent"
          {...rest}
          secureTextEntry={isPassword ? isSecure : false}
          multiline={multiline}
          onContentSizeChange={onContentSizeChange}
          maxLength={maxLength}
        />

        {/* icono derecho (prioridades: password toggle > clear > rightIcon) */}
        {isPassword ? (
          <Pressable
            onPress={() => setIsSecure((v) => !v)}
            hitSlop={theme.hitSlop}
            style={[s.iconBtn, { right: SZ.padH }]}
            accessibilityRole="button"
            accessibilityLabel={isSecure ? "Mostrar contraseña" : "Ocultar contraseña"}
            android_ripple={{ color: theme.colors.primary400, borderless: true }}
          >
            <Ionicons
              name={isSecure ? "eye" : "eye-off"}
              size={20}
              color={focused ? theme.colors.primary : theme.colors.textMuted}
            />
          </Pressable>
        ) : clearable && hasValue ? (
          <Pressable
            onPress={() => onChangeText?.("")}
            hitSlop={theme.hitSlop}
            style={[s.iconBtn, { right: SZ.padH }]}
            accessibilityRole="button"
            accessibilityLabel="Limpiar texto"
            android_ripple={{ color: theme.colors.primary400, borderless: true }}
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
          </Pressable>
        ) : rightIcon ? (
          <View style={[s.iconRight, { right: SZ.padH }]}>{rightIcon}</View>
        ) : null}
      </View>

      {/* mensajes */}
      {isError ? (
        <Text style={[s.msg, { color: theme.colors.danger }]}>{String(error)}</Text>
      ) : helperText ? (
        <Text style={[s.msg, { color: theme.colors.textMuted }]}>{helperText}</Text>
      ) : null}

      {/* contador */}
      {showCounter && typeof maxLength === "number" ? (
        <View style={s.counterRow}>
          <Text style={[s.counter, { color: theme.colors.textMuted }]}>
            {(value?.length ?? 0)}/{maxLength}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const mkStyles = (theme) =>
  StyleSheet.create({
    wrap: { marginBottom: theme.spacing.md },
    label: { marginBottom: 6, fontWeight: "700" },
    inputWrap: {
      position: "relative",
      justifyContent: "center",
      ...theme.shadow,
      ...(Platform.OS === "android" ? { elevation: 0 } : null), // sin sombra fuerte en Android
    },
    input: {
      borderRadius: 12,
    },
    iconLeft: {
      position: "absolute",
      top: "50%",
      marginTop: -12,
      height: 24,
      width: 24,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },
    iconRight: {
      position: "absolute",
      top: "50%",
      marginTop: -12,
      height: 24,
      minWidth: 24,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },
    iconBtn: {
      position: "absolute",
      top: "50%",
      marginTop: -12,
      height: 24,
      width: 24,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      zIndex: 2,
    },
    msg: { marginTop: 6, fontSize: 13 },
    counterRow: { marginTop: 4, alignItems: "flex-end" },
    counter: { fontSize: 12, letterSpacing: 0.2 },
  });
