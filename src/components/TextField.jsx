import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../style/theme";

export function TextField({
  label,
  error,
  style,
  onBlur,
  secureTextEntry,
  ...inputProps // value, onChangeText, secureTextEntry, placeholder, etc.
}) {
  const [focused, setFocused] = useState(false);

  const isPassword = !!secureTextEntry;        // true si te pasan secureTextEntry
  const [isSecure, setIsSecure] = useState(isPassword);   // empieza oculto si es password  

  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      
      <View style={styles.inputWrap}>
        <TextInput
          style={[
            styles.input,
            isPassword && styles.inputWithIcon,
            focused && styles.inputFocused,
            !!error && styles.inputError,
          ]}
          placeholderTextColor={theme.colors.muted || theme.colors.textMuted || "#6B7280"}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e); // mantiene el onBlur de Formik si lo pasas
          }}
          autoCapitalize="none"
          autoCorrect={false}
          {...inputProps}
          secureTextEntry={
            isPassword ? isSecure : false
          }
        />

        {/* botón del ojito (solo si es password) */}
        {isPassword && (
          <Pressable
            onPress={() => setIsSecure((v) => !v)}
            style={styles.eyeBtn}
            hitSlop={theme.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={isSecure ? "Mostrar contraseña" : "Ocultar contraseña"}
          >
            <Ionicons
              name={isSecure ? "eye" : "eye-off"}
              size={20}
              color={focused ? theme.colors.secondary : (theme.colors.textMuted || "#6B7280")}
            />
          </Pressable>
          )}
      </View>
        {!!error && <Text style={styles.error}>{String(error)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  inputWrap: {
    position: "relative",
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: theme.colors.border,   // gris suave
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surface,
    fontSize: 16,
    color: theme.colors.text,
  },
  inputWithIcon: {
    paddingRight: 44,
  },
  inputFocused: {
    borderColor: theme.colors.secondary,  // azul al enfocar
  },
  inputError: {
    borderColor: theme.colors.error,    // rojo si hay error
  },
  eyeBtn: {
    position:"absolute",
    right: 12,
    top: "50%",
    marginTop: -10,
    height: 20,
    width: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  error: {
    marginTop: 6,
    color: theme.colors.error,
    fontSize: 13,
  },
});
