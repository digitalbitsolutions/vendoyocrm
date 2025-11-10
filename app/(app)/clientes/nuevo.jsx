// app/(app)/clientes/nuevo.jsx
import React, { useState, useMemo } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView, Platform, DeviceEventEmitter
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTheme } from "../../../src/style/theme";   // ✅ tema dinámico
import ModalCard from "../../../src/components/ModalCard";

export const options = {
  presentation: "transparentModal",
  headerShown: false,
  animation: "slide_from_bottom",
  contentStyle: { backgroundColor: "transparent" },
};

export default function NuevoClienteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();     // ✅
  const s = mkStyles(theme);        // ✅

  const SAVE_CTA_H = 56;
  const SAVE_BAR_PT = 10;
  const SAVE_BAR_PB = Math.max(insets.bottom, 24);
  const SCROLL_EXTRA = SAVE_CTA_H + SAVE_BAR_PT + SAVE_BAR_PB + 12;

  const [tipoDoc, setTipoDoc] = useState("");
  const [numDoc, setNumDoc] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [direccion, setDireccion] = useState("");
  const [password, setPassword] = useState("");

  const canSave = useMemo(
    () =>
      tipoDoc.trim() &&
      numDoc.trim() &&
      nombre.trim() &&
      apellido.trim() &&
      email.trim() &&
      password.trim(),
    [tipoDoc, numDoc, nombre, apellido, email, password]
  );

  const onClose = () => router.back();

  const onSubmit = () => {
    if (!canSave) return;
    DeviceEventEmitter.emit("cliente:created", {
      id: `c-${Date.now()}`,
      tipoDoc: tipoDoc.trim(),
      numDoc: numDoc.trim(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
      telefono: telefono.trim() || "",
      whatsapp: whatsapp.trim() || "",
      direccion: direccion.trim() || "",
      // ⚠️ En producción: nunca guardes password en claro.
      password: password.trim(),
      createdAt: new Date().toISOString(),
    });
    router.back();
  };

  return (
    <ModalCard>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Nuevo Cliente</Text>
        <Pressable
          onPress={onClose}
          hitSlop={theme.hitSlop}
          style={s.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        >
          <Ionicons name="close" size={22} color={theme.colors.text} />
        </Pressable>
      </View>

      {/* Contenido */}
      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: SCROLL_EXTRA }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Label>Tipo de documento: *</Label>
        <Input
          value={tipoDoc}
          onChangeText={setTipoDoc}
          placeholder="Ej: DNI, NIE, Pasaporte..."
          autoCapitalize="characters"
          returnKeyType="next"
        />

        <Label>Número de documento: *</Label>
        <Input
          value={numDoc}
          onChangeText={setNumDoc}
          placeholder="Ej: 12345678X"
          autoCapitalize="characters"
          returnKeyType="next"
        />

        <Label>Nombre: *</Label>
        <Input
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej: Miguel"
          autoCapitalize="words"
          returnKeyType="next"
        />

        <Label>Apellido: *</Label>
        <Input
          value={apellido}
          onChangeText={setApellido}
          placeholder="Ej: Yesan"
          autoCapitalize="words"
          returnKeyType="next"
        />

        <Label>Email: *</Label>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="Ej: cliente@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />

        <Label>Teléfono:</Label>
        <Input
          value={telefono}
          onChangeText={setTelefono}
          placeholder="Ej: +34 600 000 000"
          keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "phone-pad"}
          returnKeyType="next"
        />

        <Label>WhatsApp:</Label>
        <Input
          value={whatsapp}
          onChangeText={setWhatsapp}
          placeholder="Ej: +34 600 000 000"
          keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "phone-pad"}
          returnKeyType="next"
        />

        <Label>Dirección:</Label>
        <Input
          value={direccion}
          onChangeText={setDireccion}
          placeholder="Ej: Calle Mayor, 123, Barcelona"
          autoCapitalize="words"
          returnKeyType="next"
        />

        <Label>Contraseña: *</Label>
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
          returnKeyType="done"
        />
      </ScrollView>

      {/* Save bar */}
      <View style={[s.saveBar, s.saveBarShadow, { paddingBottom: SAVE_BAR_PB }]}>
        <Pressable
          onPress={onSubmit}
          disabled={!canSave}
          style={({ pressed }) => [
            s.saveCta,
            pressed && { opacity: theme.opacity.pressed },
            !canSave && { opacity: theme.opacity.disabled },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Guardar Cliente"
          accessibilityState={{ disabled: !canSave }}
          hitSlop={theme.hitSlop}
        >
          <Ionicons name="checkmark-circle" size={18} color={theme.colors.onSecondary} />
          <Text style={s.saveCtaText}>Guardar Cliente</Text>
        </Pressable>
      </View>
    </ModalCard>
  );
}

/* ---------- Helpers ---------- */
function Label({ children }) {
  const { theme } = useTheme();       // ✅ usa theme actual
  const s = mkStyles(theme);
  return <Text style={s.label}>{children}</Text>;
}
function Input(props) {
  const { theme } = useTheme();       // ✅ placeholder correcto en dark
  const s = mkStyles(theme);
  return (
    <TextInput
      placeholderTextColor={theme.colors.textMuted}
      {...props}
      style={[s.input, props.style]}
    />
  );
}

/* ---------- Estilos tema-dependientes ---------- */
const mkStyles = (theme) =>
  StyleSheet.create({
    header: {
      height: 56,
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.surface,
    },
    title: {
      fontSize: theme.font.h2,
      fontWeight: "800",
      color: theme.colors.text,
    },
    closeBtn: {
      height: 36,
      width: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },

    content: {
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
    },
    label: {
      marginTop: theme.spacing.sm,
      marginBottom: 6,
      fontSize: theme.font.small,
      fontWeight: "800",
      color: theme.colors.text,
    },
    input: {
      height: 44,
      paddingHorizontal: 12,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      fontSize: theme.font.body,
    },

    saveBarShadow: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: -2 },
      elevation: 3,
    },
    saveBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.surface,
      paddingTop: 10,
      paddingHorizontal: theme.spacing.lg,
    },
    saveCta: {
      height: 56,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    saveCtaText: {
      color: theme.colors.onSecondary,
      fontWeight: "900",
      fontSize: theme.font.h3,
    },
  });
