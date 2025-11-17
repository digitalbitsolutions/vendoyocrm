// app/(app)/clientes/editar.jsx
import React, { useEffect, useMemo, useState } from "react";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";

import { useTheme } from "../../../src/style/theme";
import { Button } from "../../../src/components/Button";

export const options = {
  presentation: "transparentModal",
  headerShown: false,
  animation: "slide_from_bottom",
  contentStyle: { backgroundColor: "transparent" },
};

export default function EditarClienteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const s = useMemo(() => mkStyles(theme), [theme]);
  const { id: idFromQuery } = useLocalSearchParams();

  const [id, setId] = useState(idFromQuery || "");
  const [tipoDoc, setTipoDoc] = useState("");
  const [numDoc, setNumDoc] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [direccion, setDireccion] = useState("");
  const [password, setPassword] = useState("");

  // Prefill
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("cliente:prefill", (c) => {
      setId(c?.id || idFromQuery || "");

      const [td, nd] =
        typeof c?.documento === "string" && c.documento.includes(":")
          ? c.documento.split(":").map((s) => s.trim())
          : ["", ""];
      setTipoDoc(td || "");
      setNumDoc(nd || "");

      const [n1, n2] =
        typeof c?.nombre === "string" && c.nombre.includes(",")
          ? c.nombre.split(",").map((s) => s.trim())
          : [c?.nombre || "", ""];
      setNombre(n1 || "");
      setApellido(n2 || "");
      setEmail(c?.email || "");
      setTelefono(c?.telefono || "");
      setWhatsapp(c?.whatsapp || "");
      setDireccion(c?.direccion || "");
      setPassword("");
    });

    return () => sub.remove();
  }, [idFromQuery]);

  const canSave = useMemo(
    () =>
      (tipoDoc || "").trim() &&
      (numDoc || "").trim() &&
      (nombre || "").trim() &&
      (apellido || "").trim() &&
      (email || "").trim(),
    [tipoDoc, numDoc, nombre, apellido, email]
  );

  const onClose = () => router.back();

  const onSave = () => {
    if (!canSave) return;

    const payload = {
      id: id || `c${Date.now()}`,
      tipoDoc: tipoDoc.trim(),
      numDoc: numDoc.trim(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
      telefono: (telefono || "").trim(),
      whatsapp: (whatsapp || "").trim(),
      direccion: (direccion || "").trim(),
      ...(password.trim() ? { password: password.trim() } : {}),
      updatedAt: new Date().toISOString(),
    };

    payload.documento = `${payload.tipoDoc || ""}: ${payload.numDoc || ""}`.trim();
    payload.nombreCompleto = `${payload.nombre}${
      payload.apellido ? ", " + payload.apellido : ""
    }`;

    DeviceEventEmitter.emit("cliente:updated", payload);
    router.back();
  };

  return (
    <SafeAreaView style={s.backdrop} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={s.card}>
          {/* Header */}
          <View style={s.header}>
            <View style={s.headerTop}>
              <Text style={s.title}>Editar Cliente</Text>
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

            {!!id && (
              <Pressable
                onPress={async () => {
                  try {
                    await Clipboard.setStringAsync(String(id));
                  } catch {}
                }}
                style={s.idRow}
                accessibilityLabel="Copiar ID"
              >
                <Ionicons
                  name="copy-outline"
                  size={14}
                  color={theme.colors.textMuted}
                />
                <Text style={s.idText} numberOfLines={1}>
                  {id}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Contenido */}
          <ScrollView
            contentContainerStyle={[
              s.content,
              {
                // más aire encima de la barra de guardar
                paddingBottom: theme.spacing.xxl + 180 + insets.bottom,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Label>Tipo de documento: *</Label>
            <Input
              placeholder="Ej: DNI, NIE, Pasaporte..."
              value={tipoDoc}
              onChangeText={setTipoDoc}
              autoCapitalize="characters"
              returnKeyType="next"
            />

            <Label>Número de documento: *</Label>
            <Input
              placeholder="Ej: 12345678X"
              value={numDoc}
              onChangeText={setNumDoc}
              autoCapitalize="characters"
              returnKeyType="next"
            />

            <Label>Nombre: *</Label>
            <Input
              placeholder="Ej: Miguel"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Label>Apellido: *</Label>
            <Input
              placeholder="Ej: Yesan"
              value={apellido}
              onChangeText={setApellido}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Label>Email: *</Label>
            <Input
              placeholder="Ej: cliente@correo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Label>Teléfono:</Label>
            <Input
              placeholder="Ej: +34 600 000 000"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType={
                Platform.OS === "ios"
                  ? "numbers-and-punctuation"
                  : "phone-pad"
              }
              returnKeyType="next"
            />

            <Label>WhatsApp:</Label>
            <Input
              placeholder="Ej: +34 600 000 000"
              value={whatsapp}
              onChangeText={setWhatsapp}
              keyboardType={
                Platform.OS === "ios"
                  ? "numbers-and-punctuation"
                  : "phone-pad"
              }
              returnKeyType="next"
            />

            <Label>Dirección:</Label>
            <Input
              placeholder="Ej: Calle Mayor, 123, Barcelona"
              value={direccion}
              onChangeText={setDireccion}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Label>Contraseña (dejar en blanco para no cambiar):</Label>
            <Input
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </ScrollView>

          {/* Save bar con más padding inferior */}
          <View
            style={[
              s.saveBar,
              s.saveBarShadow,
              { paddingBottom: insets.bottom + theme.spacing.xl + 10, },
            ]}
          >
            <Button
              title="Guardar cambios"
              onPress={onSave}
              disabled={!canSave}
              fullWidth
              variant="secondary"
              leftIcon={
                <Ionicons
                  name="save-outline"
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

/* ---------- Helpers ---------- */
function Label({ children }) {
  const { theme } = useTheme();
  const s = mkStyles(theme);
  return <Text style={s.label}>{children}</Text>;
}

function Input(props) {
  const { theme } = useTheme();
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
    backdrop: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      backgroundColor: theme.colors.overlay,
    },
    card: {
      width: "90%",
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
    idRow: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.05)" : "#F1F5F9",
    },
    idText: {
      maxWidth: 220,
      fontSize: 11,
      fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
      color: theme.colors.textMuted,
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
