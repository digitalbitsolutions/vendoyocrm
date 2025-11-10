import React, { useState, useEffect, useMemo } from "react";
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
// ❌ REMOVED: import { theme } from "../../../src/style/theme";
import { useTheme } from "../../../src/style/theme"; // ✨ CHANGE: theme dinámico

export const options = {
  presentation: "transparentModal",
  headerShown: false,
  animation: "slide_from_bottom",
  contentStyle: { backgroundColor: "transparent" },
};

export default function EditarTramiteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const id = params?.id ? String(params.id) : null;

  const { theme } = useTheme();      // ✨ CHANGE: obtener theme actual
  const s = mkStyles(theme);         // ✨ CHANGE: styles reactivos al theme

  const [titulo, setTitulo] = useState("");
  const [ref, setRef] = useState("");
  const [cliente, setCliente] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estado, setEstado] = useState("pendiente");
  const [descripcion, setDescripcion] = useState("");

  const toISO = (d) => {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d?.trim() || "");
    if (!m) return null;
    const [_, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  };

  const toHuman = (iso) => {
    if (!iso || typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
    const [yyyy, mm, dd] = iso.split("-");
    return `${dd}/${mm}/${yyyy}`;
  };

  const canSave = useMemo(
    () => !!(id && titulo.trim() && ref.trim() && cliente.trim()),
    [id, titulo, ref, cliente]
  );

  const onClose = () => router.back();

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("tramite:prefill", (item) => {
      if (!item || !id || item.id !== id) return;
      setTitulo(item.titulo || "");
      setRef((item.ref || "").toUpperCase());
      setCliente(item.cliente || "");
      setFechaFin(toHuman(item.fechaFinEstimada));
      setEstado(item.estado || "pendiente");
      setDescripcion(item.descripcion || "");
    });
    return () => sub.remove();
  }, [id]);

  const onSubmit = () => {
    if (!canSave) return;
    const refNorm = ref.trim().toUpperCase();

    const payload = {
      id,
      titulo: titulo.trim(),
      ref: refNorm,
      cliente: cliente.trim(),
      fechaInicio: null,
      fechaFinEstimada: toISO(fechaFin),
      estado,
      descripcion: (descripcion || "").trim(),
    };

    DeviceEventEmitter.emit("tramite:updated", payload);
    router.back();
  };

  return (
    // ✨ CHANGE: fondo overlay desde estilos reactivos (no inline)
    <SafeAreaView style={s.backdrop} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={s.card}>
          {/* Header igual que clientes */}
          <View style={s.header}>
            <View style={s.headerTop}>
              <Text style={s.title}>Editar Trámite</Text>
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
                <Ionicons name="copy-outline" size={14} color={theme.colors.textMuted} />
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
              // mismo “aire” inferior que cliente para que nunca tape el botón
              { paddingBottom: (theme.spacing.xxl + 110) + insets.bottom + 20 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Label s={s}>Título: *</Label>
            <Input
              s={s}
              placeholderTextColor={theme.colors.textMuted} // ✨ CHANGE: viene del theme actual
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ej: Compraventa Inmuebles"
            />

            <Label s={s}>Referencia: *</Label>
            <Input
              s={s}
              placeholderTextColor={theme.colors.textMuted}
              value={ref}
              onChangeText={setRef}
              placeholder="Ej: CV-2025-0037"
              autoCapitalize="characters"
            />

            <Label s={s}>Cliente: *</Label>
            <Input
              s={s}
              placeholderTextColor={theme.colors.textMuted}
              value={cliente}
              onChangeText={setCliente}
              placeholder="Ej: Miguel Yesan"
              autoCapitalize="words"
            />

            <Label s={s}>Fecha Fin Estimada:</Label>
            <Input
              s={s}
              placeholderTextColor={theme.colors.textMuted}
              value={fechaFin}
              onChangeText={setFechaFin}
              placeholder="dd/mm/aaaa"
              keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"}
            />

            <Label s={s}>Estado: *</Label>
            <View style={s.chipsRow}>
              <Chip s={s} theme={theme} label="Pendiente" active={estado === "pendiente"} onPress={() => setEstado("pendiente")} />
              <Chip s={s} theme={theme} label="En Proceso" active={estado === "proceso"} onPress={() => setEstado("proceso")} />
              <Chip s={s} theme={theme} label="Completado" active={estado === "completado"} onPress={() => setEstado("completado")} />
            </View>

            <Label s={s}>Descripción:</Label>
            <Input
              s={s}
              placeholderTextColor={theme.colors.textMuted}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe el trámite..."
              multiline
              numberOfLines={4}
              style={{ height: 120, textAlignVertical: "top" }}
            />
          </ScrollView>

          {/* Botón Guardar con el mismo margen que cliente */}
          <View style={[s.saveBar, s.saveBarShadow, { paddingBottom: insets.bottom + 20 }]}>
            <Pressable
              onPress={onSubmit}
              disabled={!canSave}
              style={({ pressed }) => [
                s.saveCta,
                pressed && { opacity: theme.opacity.pressed },
                !canSave && { opacity: theme.opacity.disabled },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Guardar cambios"
              accessibilityState={{ disabled: !canSave }}
              hitSlop={theme.hitSlop}
            >
              <Ionicons name="save-outline" size={18} color={theme.colors.onSecondary} />
              <Text style={s.saveCtaText}>Guardar cambios</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- helpers (sin hooks; reciben estilos/props) ---------- */
function Label({ children, s }) {
  return <Text style={s.label}>{children}</Text>;
}
function Input({ s, style, ...props }) {
  return <TextInput {...props} style={[s.input, style]} />;
}
function Chip({ s, theme, label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.chip, active && s.chipActive, pressed && !active && { opacity: theme.opacity.pressed }]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      hitSlop={theme.hitSlop}
    >
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- styles reactivos ---------- */
const mkStyles = (theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      // ✨ CHANGE: overlay según tema (antes inline)
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
      // ✨ CHANGE: borde sutil para dark
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
      lineHeight: theme.font.h2 + 4,
      letterSpacing: 0.25,
    },
    closeBtn: {
      height: 36,
      width: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      ...(Platform.OS === "android" ? { overflow: "hidden" } : null),
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
        theme.mode === "dark" ? "rgba(255,255,255,0.06)" : "#F1F5F9", // ✨ CHANGE: tolerante a dark
      marginTop: 2,
    },
    idText: {
      maxWidth: 220,
      fontSize: 11,
      fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
      color: theme.colors.textMuted,
    },

    content: { padding: theme.spacing.lg, gap: theme.spacing.sm },

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

    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: theme.radius.pill,
      backgroundColor:
        theme.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    },
    chipActive: { backgroundColor: theme.colors.secondary },
    chipText: { fontWeight: "700", color: theme.colors.text, fontSize: theme.font.small },
    chipTextActive: { color: theme.colors.onSecondary },

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
      marginHorizontal: 16,
      marginBottom: 12,
    },
    saveCtaText: { color: theme.colors.onSecondary, fontWeight: "900", fontSize: theme.font.h3 },
  });
