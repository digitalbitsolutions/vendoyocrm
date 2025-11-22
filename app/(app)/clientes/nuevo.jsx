// app/(app)/clientes/nuevo.jsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  DeviceEventEmitter,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTheme } from "../../../src/style/theme";
import { Button } from "../../../src/components/Button";

export const options = {
  presentation: "transparentModal",
  headerShown: false,
  animation: "slide_from_bottom",
  contentStyle: { backgroundColor: "transparent" },
};

export default function NuevoClienteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const s = useMemo(() => mkStyles(theme), [theme]);

  const [tipoDoc, setTipoDoc] = useState("");
  const [numDoc, setNumDoc] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [password, setPassword] = useState("");

  const canSave = useMemo(
    () =>
      (tipoDoc || "").trim() &&
      (numDoc || "").trim() &&
      (nombre || "").trim() &&
      (apellido || "").trim() &&
      (email || "").trim() &&
      (password || "").trim().length >= 6,
    [tipoDoc, numDoc, nombre, apellido, email, password]
  );

  const onClose = () => router.back();

  const onSubmit = () => {
    if (!canSave) return;

    const payload = {
      id: `c-${Date.now()}`,
      tipoDoc: tipoDoc.trim(),
      numDoc: numDoc.trim(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      nombreCompleto: `${nombre.trim()} ${apellido.trim()}`,
      email: email.trim(),
      telefono: (telefono || "").trim(),
      direccion: (direccion || "").trim(),
      password: password.trim(),
      createdAt: new Date().toISOString(),
    };
    payload.documento = `${payload.tipoDoc || ""}: ${
      payload.numDoc || ""
    }`.trim();

    DeviceEventEmitter.emit("cliente:created", payload);
    router.back();
  };

  const SAVE_BTN_HEIGHT =
    theme.button && theme.button.height ? theme.button.height : 56;
  const SAVE_BAR_PADDING_ESTIMATE = SAVE_BTN_HEIGHT + (theme.spacing?.lg ?? 24);

  return (
    <SafeAreaView style={s.backdrop} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.container}     // <- reemplazado (antes: { flex: 1 })
      >
        <View style={s.card}>
          <View style={s.header}>
            <View style={s.headerTop}>
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
          </View>

          <ScrollView
            contentContainerStyle={[
              s.content,
              {
                paddingBottom:
                  (theme.spacing?.xxl ?? 20) +
                  SAVE_BAR_PADDING_ESTIMATE +
                  insets.bottom,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Label s={s}>Tipo de documento: *</Label>
            <Input
              s={s}
              placeholder="Ej: DNI, NIE, Pasaporte..."
              value={tipoDoc}
              onChangeText={setTipoDoc}
              autoCapitalize="characters"
              returnKeyType="next"
            />

            <Label s={s}>Número de documento: *</Label>
            <Input
              s={s}
              placeholder="Ej: 12345678X"
              value={numDoc}
              onChangeText={setNumDoc}
              autoCapitalize="characters"
              returnKeyType="next"
            />

            <Label s={s}>Nombre: *</Label>
            <Input
              s={s}
              placeholder="Ej: Miguel"
              value={nombre}
              onChangeText={setNombre}
              returnKeyType="next"
            />

            <Label s={s}>Apellido: *</Label>
            <Input
              s={s}
              placeholder="Ej: Yesan"
              value={apellido}
              onChangeText={setApellido}
              returnKeyType="next"
            />

            <Label s={s}>Email: *</Label>
            <Input
              s={s}
              placeholder="Ej: cliente@correo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Label s={s}>Teléfono:</Label>
            <Input
              s={s}
              placeholder="Ej: +34 600 000 000"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType={
                Platform.OS === "ios" ? "numbers-and-punctuation" : "phone-pad"
              }
              returnKeyType="next"
            />

            <Label s={s}>Dirección:</Label>
            <Input
              s={s}
              placeholder="Ej: Calle Mayor, 123, Barcelona"
              value={direccion}
              onChangeText={setDireccion}
            />

            <Label s={s}>Contraseña: *</Label>
            <Input
              s={s}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </ScrollView>

          <View
            style={[
              s.saveBar,
              s.saveBarShadow,
              { paddingBottom: insets.bottom + (theme.spacing?.sm ?? 8) },
            ]}
          >
            <Button
              title="Guardar Cliente"
              onPress={onSubmit}
              disabled={!canSave}
              fullWidth
              variant="secondary"
              leftIcon={
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={theme.colors.onSecondary}
                />
              }
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* helpers */
function Label({ children, s }) {
  return <Text style={s.label}>{children}</Text>;
}
function Input({ s, ...props }) {
  return (
    <TextInput
      placeholderTextColor={s.placeholderColor}
      {...props}
      style={[s.input, props.style]}
    />
  );
}

/* mkStyles - CORREGIDO */
const mkStyles = (theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: theme.colors.overlay,
    },
    container: { flex: 1 }, // <- agregado: evita inline style { flex: 1 }
    card: {
      width: "95%",
      maxWidth: 720,
      alignSelf: "center",
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      ...theme.shadow,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    header: {
      paddingTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
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
    placeholderColor: theme.colors.textMuted,
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
      paddingTop: 12,
      paddingHorizontal: theme.spacing.lg,
    },
  });
