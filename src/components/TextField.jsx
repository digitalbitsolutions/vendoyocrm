import { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { theme } from "../style/theme";

export function TextField({
  label,
  error,
  style,
  onBlur,
  ...inputProps // value, onChangeText, secureTextEntry, placeholder, etc.
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
        placeholderTextColor={theme.colors.muted}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e); // mantiene el onBlur de Formik si lo pasas
        }}
        autoCapitalize="none"
        autoCorrect={false}
        {...inputProps}
      />

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
  inputFocused: {
    borderColor: theme.colors.secondary,  // azul al enfocar
  },
  inputError: {
    borderColor: theme.colors.error,    // rojo si hay error
  },
  error: {
    marginTop: 6,
    color: theme.colors.error,
    fontSize: 13,
  },
});
